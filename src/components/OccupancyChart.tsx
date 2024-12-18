import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { time: "現在", value: 65 },
  { time: "1時間後", value: 75 },
  { time: "2時間後", value: 45 },
  { time: "3時間後", value: 30 },
];

const OccupancyChart = () => {
  return (
    <div className="glass-card rounded-xl p-4 h-[200px] animate-fade-in">
      <h3 className="text-sm font-medium text-gym-text/70 mb-4">混雑度の推移</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis 
            dataKey="time" 
            stroke="#00000050"
            fontSize={12}
            tickLine={false}
            axisLine={false}
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
              backgroundColor: "#FFFFFF",
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