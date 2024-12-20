import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import animationData from "../../public/animations/Animation - 1734515517907.json";
import OccupancyCard from "@/components/OccupancyCard";
import OccupancyChart from "@/components/OccupancyChart";
import WeeklyHeatmap from "@/components/WeeklyHeatmap";

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

const Index = () => {
  const currentOccupancy = 65;
  const forecast = "現在は比較的空いていますが、2時間後から混雑が予想されます";
  const [currentTime, setCurrentTime] = useState("");
  const [futureOccupancies, setFutureOccupancies] = useState<number[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchWeeklyData();
      const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
      const todayData = data[today] || {};

      const futureData = [1, 2, 3].map(offset => getFutureOccupancy(todayData, offset));
      setFutureOccupancies(futureData);
    };

    loadData();
  }, []);

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

export default Index;