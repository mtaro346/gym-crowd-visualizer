import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// 15分間隔のデータ
const data = [
  { time: "現在", value: 65 },
  { time: "15分後", value: 68 },
  { time: "30分後", value: 70 },
  { time: "45分後", value: 72 },
  { time: "1時間後", value: 75 },
  { time: "1時間15分後", value: 70 },
  { time: "1時間30分後", value: 65 },
  { time: "1時間45分後", value: 55 },
  { time: "2時間後", value: 45 },
  { time: "2時間15分後", value: 40 },
  { time: "2時間30分後", value: 35 },
  { time: "2時間45分後", value: 32 },
  { time: "3時間後", value: 30 },
];

const OccupancyChart = () => {
  return (
    <div className="glass-card rounded-xl p-4 h-[200px] animate-fade-in">
      <h3 className="text-sm font-medium text-gym-text/70 mb-4">混雑度の推移</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
          <XAxis 
            dataKey="time" 
            stroke="#00000050"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval={2}
            angle={-45}
            textAnchor="end"
            height={60}
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