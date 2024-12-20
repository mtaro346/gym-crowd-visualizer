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

    console.log('forecast_data の中身:', JSON.stringify(forecast_data, null, 2));
    console.log('forecast_data の型:', typeof forecast_data);
    console.log('forecast_data.data は配列?:', Array.isArray(forecast_data?.data));

    // データ構造の詳細なバリデーションを追加
    if (!forecast_data || !forecast_data.data || !Array.isArray(forecast_data.data)) {
        console.log('バリデーションエラーの詳細:');
        console.log('- forecast_data exists:', !!forecast_data);
        console.log('- forecast_data.data exists:', !!forecast_data?.data);
        console.log('- forecast_data.data is array:', Array.isArray(forecast_data?.data));
        return res.status(400).json({ message: 'Invalid data format' });
    }

    try {
      // 予測データをUpstash Redisに保存
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