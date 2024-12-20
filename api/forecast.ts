import { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    console.log('=== リクエスト情報 ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('リクエストボディ:', JSON.stringify(req.body, null, 2));
    console.log('リクエストボディのキー:', Object.keys(req.body));

    const { forecast_data } = req.body;
    
    console.log('\n=== forecast_data の検証 ===');
    console.log('forecast_data の型:', typeof forecast_data);
    console.log('forecast_data の値:', JSON.stringify(forecast_data, null, 2));
    console.log('forecast_data のキー:', forecast_data ? Object.keys(forecast_data) : 'undefined');

    if (!forecast_data) {
        console.log('エラー: forecast_data が存在しません');
        return res.status(400).json({ message: 'forecast_data is missing' });
    }

    console.log('\n=== data プロパティの検証 ===');
    console.log('data プロパティの型:', typeof forecast_data.data);
    console.log('data は配列?:', Array.isArray(forecast_data.data));
    console.log('data の値:', JSON.stringify(forecast_data.data, null, 2));

    if (!forecast_data.data) {
        console.log('エラー: forecast_data.data が存在しません');
        return res.status(400).json({ message: 'forecast_data.data is missing' });
    }

    if (!Array.isArray(forecast_data.data)) {
        console.log('エラー: forecast_data.data が配列ではありません');
        return res.status(400).json({ message: 'forecast_data.data is not an array' });
    }

    console.log('\n=== 配列の内容確認 ===');
    console.log('配列の長さ:', forecast_data.data.length);
    if (forecast_data.data.length > 0) {
        console.log('最初の要素:', JSON.stringify(forecast_data.data[0], null, 2));
    }

    try {
        console.log('\n=== Redis保存処理 ===');
        await redis.set('forecast_data', JSON.stringify(forecast_data));
        console.log('Redis保存成功');
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