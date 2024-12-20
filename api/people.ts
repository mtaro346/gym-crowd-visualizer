import { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { count, last_updated } = req.body;

    if (typeof count !== 'number' || typeof last_updated !== 'string') {
      return res.status(400).json({ message: '無効なデータ形式です' });
    }

    try {
      await redis.set('current_count', JSON.stringify({ count, last_updated }));
      return res.status(200).json({ message: 'データを正常に保存しました' });
    } catch (error) {
      console.error('Redis保存エラー:', error);
      return res.status(500).json({ message: '内部サーバーエラー' });
    }
  } else if (req.method === 'GET') {
    try {
      const data = await redis.get('current_count');
      if (!data) {
        return res.status(404).json({ message: 'データが見つかりません' });
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