import requests
import sqlite3
import time
from datetime import datetime, timedelta
import json
import logging

# ロギングの設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("gym_data_sender.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)

class GymDataSender:
    def __init__(self):
        self.base_url = 'https://gym-crowd-visualizer.vercel.app/api'
        self.db_path = 'gym_visitors.db'
        self.headers = {
            'Content-Type': 'application/json'
        }
        self.last_posted_timestamp = None
        self.current_date = datetime.now().date()
        
        # 英語の曜日名を使用するように変更
        self.day_translation = {
            'Monday': 'Monday',
            'Tuesday': 'Tuesday',
            'Wednesday': 'Wednesday',
            'Thursday': 'Thursday',
            'Friday': 'Friday',
            'Saturday': 'Saturday',
            'Sunday': 'Sunday'
        }
    
    def connect_db(self):
        """データベース接続を確立"""
        try:
            return sqlite3.connect(self.db_path)
        except sqlite3.Error as e:
            logging.error(f"データベース接続エラー: {e}")
            return None
    
    def send_current_count(self):
        """現在の人数データを送信"""
        conn = self.connect_db()
        if not conn:
            return False
        try:
            c = conn.cursor()
            c.execute("""
                SELECT average_count, timestamp 
                FROM average_people_count 
                ORDER BY timestamp DESC LIMIT 1
            """)
            row = c.fetchone()
            
            if not row:
                logging.warning("現在のデータが見つかりません")
                return False
            count, last_updated = row
            if last_updated != self.last_posted_timestamp:
                payload = {
                    'count': count,
                    'last_updated': last_updated
                }
                response = requests.post(
                    f'{self.base_url}/people',
                    headers=self.headers,
                    json=payload
                )
                if response.status_code == 200:
                    logging.info(f"現在の人数を送信成功: {count}人")
                    self.last_posted_timestamp = last_updated
                    return True
                else:
                    logging.error(f"API エラー: {response.status_code} - {response.text}")
                    return False
            else:
                logging.info(f"{datetime.now()} - 最新情報がなく、ポストしませんでした。")
                return False
        except Exception as e:
            logging.error(f"エラー発生: {e}")
            return False
        finally:
            conn.close()
    
    def send_forecast_data(self):
        """予測データを送信"""
        conn = self.connect_db()
        if not conn:
            return False
        try:
            c = conn.cursor()
            two_weeks_ago = datetime.now() - timedelta(weeks=2)
            
            c.execute("""
                SELECT average_count, timestamp
                FROM average_people_count
                WHERE timestamp >= ?
            """, (two_weeks_ago.strftime('%Y-%m-%d %H:%M:%S'),))
            
            rows = c.fetchall()
            if not rows:
                logging.warning("予測用データが見つかりません")
                return False
            
            # データを曜日と15分ごとに整理
            forecast_data = {}
            for count, timestamp in rows:
                dt = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
                day = self.day_translation[dt.strftime('%A')]
                quarter_hour = (dt.minute // 15) * 15
                time_slot = dt.replace(minute=quarter_hour, second=0, microsecond=0).strftime('%H:%M')
                
                if day not in forecast_data:
                    forecast_data[day] = {}
                if time_slot not in forecast_data[day]:
                    forecast_data[day][time_slot] = []
                
                forecast_data[day][time_slot].append(count)
            
            # 平均値を計算
            processed_data = []
            for day, time_slots in forecast_data.items():
                time_slots_data = []
                for time_slot, counts in time_slots.items():
                    # 各時間スロットの平均を計算
                    avg_count = round(sum(counts) / len(counts))
                    time_slots_data.append({
                        "hour": time_slot,
                        "occupancy": avg_count
                    })
                processed_data.append({
                    "day": day,
                    "hours": sorted(time_slots_data, key=lambda x: x["hour"])
                })
            
            # ペイロードの構造を修正
            payload = {
                'data': processed_data
            }
            
            response = requests.post(
                f'{self.base_url}/forecast',
                headers=self.headers,
                json=payload
            )
            
            if response.status_code == 200:
                logging.info("予測データを送信成功")
                return True
            else:
                logging.error(f"予測データAPI エラー: {response.status_code} - {response.text}")
                return False
            
        except Exception as e:
            logging.error(f"予測データ処理エラー: {e}", exc_info=True)
            return False
        finally:
            conn.close()

def main():
    sender = GymDataSender()
    while True:
        try:
            # 現在の人数を送信
            sender.send_current_count()
            
            # 日付が変わったかどうかをチェック
            new_date = datetime.now().date()
            if new_date != sender.current_date:
                sender.send_forecast_data()
                sender.current_date = new_date
            
            # 20秒待機
            time.sleep(20)
        except KeyboardInterrupt:
            logging.info("プログラムを終了します")
            break
        except Exception as e:
            logging.error(f"予期せぬエラー: {e}")
            time.sleep(20)

if __name__ == "__main__":
    main()