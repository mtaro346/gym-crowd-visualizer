import sqlite3
import requests
from datetime import datetime, timedelta
import numpy as np

# WordPressのカスタムエンドポイントURL
url = 'https://gym-crowd-visualizer.vercel.app/api/forecast'

# SQLiteデータベースに接続
conn = sqlite3.connect('gym_visitors.db')
c = conn.cursor()

# 時間スロットを定義
time_slots = [f"{hour:02}:{minute:02}" for hour in range(24) for minute in range(0, 60, 15)]

# 英語の曜日を日本語に変換する辞書
day_translation = {
    'Monday': '月曜日',
    'Tuesday': '火曜日',
    'Wednesday': '水曜日',
    'Thursday': '木曜日',
    'Friday': '金曜日',
    'Saturday': '土曜日',
    'Sunday': '日曜日'
}

# データベースから直近2週間のデータを取得
def get_data_from_db():
    two_weeks_ago = datetime.now() - timedelta(weeks=2)
    query = """
    SELECT average_count, timestamp
    FROM average_people_count
    WHERE timestamp >= ?
    """
    c.execute(query, (two_weeks_ago,))
    rows = c.fetchall()
    print("All rows in DB:", rows)  # ログ追加
    return rows

# データを処理して、曜日と時間スロットごとの平均値を計算
def process_data(rows):
    data = []

    # データを曜日ごとに整理
    for row in rows:
        timestamp = datetime.strptime(row[1], '%Y-%m-%d %H:%M:%S')
        day = day_translation[timestamp.strftime('%A')]
        hour = timestamp.strftime('%H:%M')
        
        # 既存の曜日データを取得または新規作成
        day_data = next((item for item in data if item["day"] == day), None)
        if not day_data:
            day_data = {"day": day, "hours": []}
            data.append(day_data)
        
        # 時間スロットのデータを追加
        hour_data = next((item for item in day_data["hours"] if item["hour"] == hour), None)
        if not hour_data:
            hour_data = {"hour": hour, "occupancy": 0}
            day_data["hours"].append(hour_data)
        
        # 占有率を更新
        hour_data["occupancy"] += row[0]

    # 各時間スロットの平均を計算
    for day_data in data:
        for hour_data in day_data["hours"]:
            hour_data["occupancy"] = round(hour_data["occupancy"] / len(rows))

    print("Processed data:", data)  # ログ追加
    return data

# データをポスト
def post_data(data):
    payload = {
        'forecast_data': data
    }
    response = requests.post(url, json=payload)
    print("Post response:", response.status_code, response.text)  # ログ追加

if __name__ == '__main__':
    # データベースの内容を確認
    c.execute("SELECT * FROM average_people_count")
    rows = c.fetchall()
    print("All rows in DB:", rows)

    rows = get_data_from_db()
    data = process_data(rows)
    post_data(data)
    conn.close()
