export default function handler(req, res) {
  if (req.method === 'POST') {
    const { count, last_updated } = req.body;

    // 受け取ったデータを処理する（例: データベースに保存するなど）
    console.log(`Received count: ${count}, Last Updated: ${last_updated}`);

    // 成功レスポンスを返す
    res.status(200).json({ message: 'Data received successfully' });
  } else {
    // POST以外のリクエストは405エラーを返す
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 