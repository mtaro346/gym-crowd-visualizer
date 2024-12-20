import redis
import os
from dotenv import load_dotenv

def check_redis_connection():
    try:
        # .envファイルを読み込む
        load_dotenv()

        # 環境変数からRedisのURLとトークンを取得
        redis_url = os.getenv('UPSTASH_REDIS_URL')
        redis_token = os.getenv('UPSTASH_REDIS_TOKEN')

        # デバッグ用出力
        print(f"Redis URL: {redis_url}")
        print(f"Redis Token: {redis_token}")

        if not redis_url or not redis_token:
            raise ValueError("Redis URLまたはトークンが設定されていません")

        # Redisクライアントを作成
        client = redis.StrictRedis.from_url(redis_url, password=redis_token)

        # 接続テスト: キーと値を設定
        client.set('test_key', 'test_value')

        # 値を取得して確認
        value = client.get('test_key')
        if value == b'test_value':
            print("Redis接続成功: 値が正しく設定されました")
        else:
            print("Redis接続エラー: 値が正しく設定されませんでした")

    except Exception as e:
        print(f"Redis接続エラー: {e}")

if __name__ == "__main__":
    check_redis_connection()
