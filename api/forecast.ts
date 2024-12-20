import { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    console.log('受信したリクエストボディ:', JSON.stringify(req.body, null, 2));
    const { forecast_data } = req.body;

    // デバッグ用ログ
    console.log('バリデーション1 - forecast_data:', !!forecast_data);
    console.log('バリデーション2 - forecast_data.data:', !!forecast_data?.data);
    console.log('バリデーション3 - isArray:', Array.isArray(forecast_data?.data));
    
    if (!forecast_data) {
        return res.status(400).json({ message: 'forecast_data is missing' });
    }
    if (!forecast_data.data) {
        return res.status(400).json({ message: 'forecast_data.data is missing' });
    }
    if (!Array.isArray(forecast_data.data)) {
        return res.status(400).json({ message: 'forecast_data.data is not an array' });
    }
    
    // データの中身のバリデーション前にデバッグログ
    console.log('データ構造チェック開始');
    console.log('最初の要素:', JSON.stringify(forecast_data.data[0], null, 2));
    
    // データの中身も確認
    if (!forecast_data.data.every(item => {
        const valid = item.day && 
            Array.isArray(item.hours) && 
            item.hours.every(hour => 
                typeof hour.hour === 'string' && 
                typeof hour.occupancy === 'number'
            );
        if (!valid) {
            console.log('Invalid item:', JSON.stringify(item, null, 2));
        }
        return valid;
    })) {
        return res.status(400).json({ message: 'Invalid data structure in forecast_data' });
    }

    try {
        await redis.set('forecast_data', JSON.stringify(forecast_data));
        return res.status(200).json({ message: '予測データを正常に保存しました' });
    } catch (error) {
        console.error('Redis保存エラー:', error);
        return res.status(500).json({ message: '内部サーバーエラー' });
    }
  } else if (req.method === 'GET') {
    try {
      // Upstash Redisから予測データを取得
      const data = await redis.get('forecast_data');
      if (!data) {
        return res.status(404).json({ message: '予測データが見つかりません' });
      }
      return res.status(200).json(data);
    } catch (error) {
      console.error('Redis取得エラー:', error);
      return res.status(500).json({ message: '内部サーバーエラー' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 