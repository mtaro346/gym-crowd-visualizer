import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Lottie from "react-lottie";
import animationData from "../../public/animations/Animation - 1734516359433.json";

// 現在時刻から15分間隔のデータを生成
const generateTimeData = () => {
  const now = new Date();
  const data = [];
  
  // 現在時刻の時間を切り捨てて、00分に設定
  now.setMinutes(Math.floor(now.getMinutes() / 15) * 15, 0, 0);

  for (let i = 0; i <= 12; i++) { // 3時間分（15分×12）
    const time = new Date(now.getTime() + i * 15 * 60000);
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    // 仮のデータ（本来はAPIから取得）
    const values = [65, 68, 70, 72, 75, 70, 65, 55, 45, 40, 35, 32, 30];
    data.push({
      time: timeString,
      value: values[i] || 30,
    });
  }
  return data;
};

const data = generateTimeData();

const OccupancyChart = () => {
  return (
    <div className="glass-card rounded-xl p-4 h-[200px] animate-fade-in">
      <div className="flex items-center mb-4">
        <h3 className="text-sm font-medium text-gym-text/70">今後の混雑予想</h3>
        <Lottie 
          options={{
            loop: true,
            autoplay: true,
            animationData: animationData,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid slice'
            }
          }}
          height={40}
          width={40}
        />
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
          <XAxis 
            dataKey="time" 
            stroke="#00000050"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval={3}  // 1時間おきに表示（15分×4）
            angle={0}     // 傾きを直す
            textAnchor="middle"
            height={40}
          />
          <YAxis 
            stroke="#00000050"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#000" }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#FF5733"
            strokeWidth={2}
            dot={{ fill: "#FF5733", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OccupancyChart;