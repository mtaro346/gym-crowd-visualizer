import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import Lottie from "react-lottie";
import animationData from "../../public/animations/Animation - 1734516359433.json";

const generateTimeData = () => {
  const now = new Date();
  const data = [];
  
  now.setMinutes(Math.floor(now.getMinutes() / 15) * 15, 0, 0);

  for (let i = 0; i <= 12; i++) {
    const time = new Date(now.getTime() + i * 15 * 60000);
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
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
      <div className="flex items-center gap-1 mb-2">
        <h3 className="text-sm font-medium text-gym-text/70">今後の混雑予想</h3>
        <div className="-mt-1">
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
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            stroke="#00000050"
            fontSize={10}
            tickLine={true}
            axisLine={true}
            interval={3}
            angle={0}
            textAnchor="middle"
            height={40}
          />
          <YAxis 
            stroke="#00000050"
            fontSize={12}
            tickLine={true}
            axisLine={true}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]} // 明示的にticksを指定
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
            stroke="#ff6f61"
            strokeWidth={2}
            dot={{ 
              fill: "#ff6f61", 
              strokeWidth: 2,
              r: 4, // ドットのサイズを大きく
              stroke: "#ff6f61",
              fillOpacity: 1 // 不透明度を1に設定
            }}
            activeDot={{
              r: 6,
              stroke: "#ff6f61",
              strokeWidth: 2,
              fill: "#ff6f61",
              fillOpacity: 1
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OccupancyChart;