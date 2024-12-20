import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { count, last_updated } = req.body;

      if (typeof count !== 'number') {
        return res.status(400).json({ error: 'Count must be a number' });
      }

      if (!last_updated) {
        return res.status(400).json({ error: 'Last updated timestamp is required' });
      }

      const currentData = {
        count,
        last_updated,
        updated_at: new Date().toISOString()
      };

      await kv.set('current_people', currentData);

      return res.status(200).json({ 
        success: true, 
        message: 'Current count data successfully stored',
        data: currentData
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
      const data = await kv.get('current_people');
      if (!data) {
        return res.status(404).json({ error: 'No current data found' });
      }
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