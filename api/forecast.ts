import { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { data } = req.body;

      // 受け取ったデータをログに出力
      console.log('受け取ったデータ:', JSON.stringify(data, null, 2));

      if (!data || !Array.isArray(data)) {
        return res.status(400).json({ message: 'Invalid data format' });
      }

      const isValidData = data.every(item => 
        item.day && 
        Array.isArray(item.hours) &&
        item.hours.every(hour => 
          typeof hour.hour === 'string' &&
          typeof hour.occupancy === 'number'
        )
      );

      if (!isValidData) {
        return res.status(400).json({ message: 'Invalid data structure' });
      }

      await redis.set('forecast_data', JSON.stringify(data));
      return res.status(200).json({ message: '予測データを正常に保存しました' });
      
    } catch (error) {
      console.error('Error processing request:', error);
      console.error('Error details:', error.message, error.stack);
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