import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { data } = req.body;

      if (!data || !Array.isArray(data)) {
        return res.status(400).json({ error: 'Invalid data format' });
      }

      // データを整形して保存
      const formattedData = data.reduce((acc, day) => {
        const dayData = day.hours.reduce((hourAcc, hour) => {
          hourAcc[hour.hour] = hour.occupancy;
          return hourAcc;
        }, {});
        
        acc[day.day.toLowerCase()] = dayData;
        return acc;
      }, {});

      // KVストアにデータを保存
      await kv.set('forecast_data', formattedData);

      return res.status(200).json({ 
        success: true, 
        message: 'Data successfully stored'
      });

    } catch (error) {
      console.error('Error processing request:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  } else if (req.method === 'GET') {
    try {
      // KVストアからデータを取得
      const data = await kv.get('forecast_data');
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 