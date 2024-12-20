import React, { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import Lottie from "react-lottie";
import animationData from "../../public/animations/Animation - 1734516359433.json";

// APIから週間データを取得する関数
const fetchWeeklyData = async () => {
  try {
    const response = await fetch('/api/forecast');
    if (!response.ok) {
      throw new Error('データの取得に失敗しました');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('データ取得エラー:', error);
    return {};
  }
};

const OccupancyChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchWeeklyData();
      const now = new Date();
      const today = now.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
      const todayData = data[today] || {};

      const formattedData = Object.entries(todayData).map(([time, occupancy]) => ({
        time,
        value: Math.round((Number(occupancy) / 9) * 100), // 9を100%として計算
      }));

      setChartData(formattedData);
    };

    loadData();
  }, []);

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
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
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
            ticks={[0, 20, 40, 60, 80, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#000" }}
            formatter={(value: number) => [`${Math.round(value)}%`, '混雑率']}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#ff6f61"
            strokeWidth={2}
            dot={{ 
              fill: "#ff6f61", 
              strokeWidth: 2,
              r: 4,
              stroke: "#ff6f61",
              fillOpacity: 1
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