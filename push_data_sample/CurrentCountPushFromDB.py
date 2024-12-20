import requests
import time
import urllib3
import sqlite3
from datetime import datetime
import subprocess

# 不安全なリクエストに関する警告を無視
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 新しいNode.jsエンドポイントURL
url = 'https://gym-crowd-visualizer.vercel.app/api/people'  # VercelのデプロイURLに合わせて変更

# 認証情報（WordPressのログインIDとアプリケーションパスワード）
username = 'lifefitnarimasu@gmail.com'
password = 'lx70 XOtq g4XR xNFb Fwex LFZh'

# 最大再試行回数
max_retries = 5
# 再試行間の待機時間（秒）
retry_interval = 20
# タイムアウト設定（秒）
timeout_duration = 10

# SQLiteデータベースに接続
conn = sqlite3.connect('gym_visitors.db')
c = conn.cursor()

# 最後にPOSTしたタイムスタンプを記録
last_posted_timestamp = None

# 現在の日付を記録
current_date = datetime.now().date()

while True:
    try:
        # 最新のレコードを取得
        c.execute("SELECT average_count, timestamp FROM average_people_count ORDER BY timestamp DESC LIMIT 1")
        row = c.fetchone()
        if row:
            people_count, last_updated = row
            if last_updated != last_posted_timestamp:
                # 送信するデータ（人数と更新日時）
                data = {
                    'count': people_count,
                    'last_updated': last_updated
                }

                # POSTリクエストを送信、SSL証明書の検証を無効化、タイムアウトを設定
                response = requests.post(url, json=data, auth=(username, password), verify=False, timeout=timeout_duration)
                
                # ステータスコードとレスポンスのテキストを出力
                print(f"Status Code: {response.status_code}")
                print(f"Response Text: {response.text}")
                
                # JSONレスポンスを出力
                try:
                    print(response.json())
                except requests.exceptions.JSONDecodeError:
                    print("JSON decode failed")
                
                # 最後にPOSTしたタイムスタンプを更新
                last_posted_timestamp = last_updated

                # 日付が変わったかどうかをチェック
                new_date = datetime.now().date()
                if new_date != current_date:
                    subprocess.run(["python", "ForcastPush.py"])
                    current_date = new_date
            else:
                print(f"{datetime.now()} - 最新情報がなく、ポストしませんでした。")
        else:
            print(f"{datetime.now()} - データベースにレコードがありません。")

    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        # 再試行ロジック
        for i in range(max_retries):
            time.sleep(retry_interval)
            try:
                response = requests.post(url, json=data, auth=(username, password), verify=False, timeout=timeout_duration)
                print(f"Retry {i+1}: Status Code: {response.status_code}")
                break
            except requests.exceptions.RequestException as retry_error:
                print(f"Retry {i+1} failed: {retry_error}")
                if i == max_retries - 1:
                    print("Max retries reached, moving to next iteration.")

    # 10秒ごとにデータベースをチェック（1分ごとに更新される前提）
    time.sleep(10)

# 接続を閉じる（通常はプログラム終了時に行う）
conn.close()
