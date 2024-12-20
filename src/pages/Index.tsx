import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import animationData from "../../public/animations/Animation - 1734515517907.json";
import OccupancyCard from "@/components/OccupancyCard";
import OccupancyChart from "@/components/OccupancyChart";
import WeeklyHeatmap from "@/components/WeeklyHeatmap";
import { WeeklyDataProvider, useWeeklyData } from '@/contexts/WeeklyDataContext';

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

const IndexContent = () => {
  const { weeklyData } = useWeeklyData();
  const [futureOccupancies, setFutureOccupancies] = useState<number[]>([]);

  useEffect(() => {
    const calculateFutureOccupancies = () => {
      const now = new Date();
      const dayName = now.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
      const todayData = weeklyData[dayName];

      if (!todayData) return;

      const futureData = [1, 2, 3].map(offset => {
        const futureTime = new Date(now.getTime() + offset * 60 * 60000);
        const hours = futureTime.getHours().toString().padStart(2, '0');
        const minutes = Math.floor(futureTime.getMinutes() / 15) * 15;
        const timeString = `${hours}:${minutes.toString().padStart(2, '0')}`;
        
        const occupancy = todayData[timeString] || 0;
        return Math.round((occupancy / 9) * 100);
      });

      setFutureOccupancies(futureData);
    };

    if (Object.keys(weeklyData).length > 0) {
      calculateFutureOccupancies();
    }
  }, [weeklyData]);

  return (
    <div className="container max-w-md mx-auto py-4 space-y-4 px-4">
      {/* ロゴ - 後で高解像度の画像に置き換え可能 */}
      <div className="flex justify-center mb-6">
        <img 
          src="/images/LifeFit_Logo_Basic_B_C.png" 
          alt="LifeFit" 
          className="h-20 w-auto"
        />
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-lifefit-blue-400">フリーウェイトエリア混雑状況</h1>
        <div className="flex items-center">
          <Lottie 
            options={{
              loop: true,
              autoplay: true,
              animationData: animationData,
              rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice'
              }
            }}
            height={25}
            width={25}
          />
          <span className="text-sm text-lifefit-gray-400">現在時刻: {currentTime}</span>
        </div>
      </div>
      
      <OccupancyCard 
        time="現在" 
        percentage={currentOccupancy} 
        isNow={true}
        forecast={forecast}
      />
      
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {futureOccupancies.map((occupancy, index) => (
          <OccupancyCard key={index} time={`${index + 1}時間後`} percentage={occupancy} />
        ))}
      </div>
      
      <OccupancyChart />
      <WeeklyHeatmap />
    </div>
  );
};

const Index = () => {
  return (
    <WeeklyDataProvider>
      <IndexContent />
    </WeeklyDataProvider>
  );
};

export default Index;