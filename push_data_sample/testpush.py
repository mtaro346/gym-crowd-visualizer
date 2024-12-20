import requests
import json

# ダミーデータの作成
dummy_data = [
    {
        "day": "Monday",
        "hours": [
            {"hour": "08:00", "occupancy": 20},
        {"hour": "09:00", "occupancy": 25},
            # 他の時間帯のデータを追加
        ]
    },
    {
        "day": "Tuesday",
        "hours": [
            {"hour": "08:00", "occupancy": 15},
            {"hour": "09:00", "occupancy": 30},
            # 他の時間帯のデータを追加
        ]
    },
    # 他の日のデータを追加
]

# APIエンドポイントのURL
url = "https://gym-crowd-visualizer.vercel.app/api/forecast"

# デバッグ用にリクエストデータを表示
print("送信データ:", json.dumps({"data": dummy_data}, indent=2))

# POSTリクエストの送信
response = requests.post(url, json={"data": dummy_data})

# レスポンスの詳細な表示
print("ステータスコード:", response.status_code)
print("レスポンスヘッダー:", response.headers)
print("レスポンス生データ:", response.text)

try:
    print("レスポンスボディ:", response.json())
except requests.exceptions.JSONDecodeError as e:
    print("JSONデコードエラー:", str(e))
