import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import animationData from "../../public/animations/Animation - 1734515517907.json";
import OccupancyCard from "@/components/OccupancyCard";
import OccupancyChart from "@/components/OccupancyChart";
import WeeklyHeatmap from "@/components/WeeklyHeatmap";

// データの型定義
type DayData = {
  [timeString: string]: number;
};

type WeeklyData = {
  [day: string]: DayData;
};

// 型定義を追加
type OccupancyData = {
  numberOfPeople: number;
  percentage: number;
};

const fetchWeeklyData = async (): Promise<WeeklyData> => {
  try {
    const response = await fetch('/api/forecast');
    if (!response.ok) {
      throw new Error('データの取得に失敗しました');
    }
    const data: WeeklyData = await response.json();
    return data;
  } catch (error) {
    console.error('データ取得エラー:', error);
    return {};
  }
};

const getFutureOccupancy = (data: DayData, offsetHours: number) => {
  const now = new Date();
  const futureTime = new Date(now.getTime() + offsetHours * 60 * 60000);
  
  // 時間を2桁でパディング
  const hours = futureTime.getHours().toString().padStart(2, '0');
  // 15分単位に丸める（切り上げ）
  const roundedMinutes = Math.ceil(futureTime.getMinutes() / 15) * 15;
  // 60分になった場合は0分にする
  const minutes = (roundedMinutes === 60 ? 0 : roundedMinutes).toString().padStart(2, '0');
  
  const timeString = `${hours}:${minutes}`;
  
  // データの値を直接確認
  console.log('Looking for time:', timeString);
  console.log('Raw data:', data);
  console.log('Available times:', Object.keys(data));
  console.log('Value found:', data[timeString]);
  
  // 人数を取得（0-9の値）
  const numberOfPeople = Number(data[timeString]);
  if (isNaN(numberOfPeople)) {
    console.warn(`Invalid data for time ${timeString}`);
    return {
      numberOfPeople: 0,
      percentage: 0,
      timeString
    };
  }
  
  // パーセンテージに変換
  const percentage = Math.round((numberOfPeople / 9) * 100);
  
  return {
    numberOfPeople,
    percentage,
    timeString
  };
};

const Index = () => {
  const currentOccupancy = 65;
  const forecast = "混雑回避のご協力をお願いします";
  const [currentTime, setCurrentTime] = useState("");
  const [futureOccupancies, setFutureOccupancies] = useState<OccupancyData[]>([]);

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
      try {
        const data = await fetchWeeklyData();
        console.log('Raw API response:', data); // APIレスポンス全体を確認
        
        const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
        console.log('Current day:', today);
        
        const todayData = data[today] || {};
        console.log('Today\'s data:', todayData);
        
        const futureData = [1, 2, 3].map(offset => {
          return getFutureOccupancy(todayData, offset);
        });
        setFutureOccupancies(futureData);
      } catch (error) {
        console.error('データ読み込みエラー:', error);
        setFutureOccupancies([]);
      }
    };

    loadData();
    // 定期的なデータ更新
    const interval = setInterval(loadData, 5 * 60 * 1000); // 5分ごとに更新
    
    return () => clearInterval(interval);
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
          <OccupancyCard 
            key={index} 
            time={`${index + 1}時間後`} 
            percentage={occupancy.percentage} 
          />
        ))}
      </div>
      
      <OccupancyChart />
      <WeeklyHeatmap />
    </div>
  );
};

export default Index;