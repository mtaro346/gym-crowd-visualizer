import React, { useEffect, useState } from 'react';

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

const getFutureOccupancy = (data: any, offsetHours: number) => {
  const now = new Date();
  now.setMinutes(Math.floor(now.getMinutes() / 15) * 15, 0, 0);
  const futureTime = new Date(now.getTime() + offsetHours * 60 * 60000);
  const hours = futureTime.getHours().toString().padStart(2, '0');
  const minutes = futureTime.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  return Math.round((Number(data[timeString] || 0) / 9) * 100);
};

const OccupancyCard = ({ time, isNow = false, forecast }: { time: string, isNow?: boolean, forecast?: string }) => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchWeeklyData();
      const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
      const todayData = data[today] || {};

      const offset = parseInt(time);
      if (!isNaN(offset)) {
        const occupancy = getFutureOccupancy(todayData, offset);
        setPercentage(occupancy);
      }
    };

    loadData();
  }, [time]);

  return (
    <div className={`glass-card rounded-xl p-3 ${isNow ? 'w-full' : 'min-w-[100px]'} animate-fade-in`}>
      {forecast && (
        <p className="text-sm text-lifefit-gray-400 mb-2">{forecast}</p>
      )}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-lifefit-gray-400">{time}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-xl font-bold text-primary">{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};

export default OccupancyCard;