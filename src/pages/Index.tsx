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
  // 60分になった場合は次の時間の0分にする
  if (roundedMinutes === 60) {
    const nextHour = (futureTime.getHours() + 1).toString().padStart(2, '0');
    const timeString = `${nextHour}:00`;
    console.log('Adjusted to next hour:', timeString);
    
    // データの値を直接確認
    console.log('Data sample:', {
      previous: data[`${hours}:45`],
      current: data[timeString],
      next: data[`${nextHour}:15`]
    });
    
    const numberOfPeople = Number(data[timeString]) || 0;
    return {
      numberOfPeople,
      percentage: Math.round((numberOfPeople / 9) * 100),
      timeString
    };
  }
  
  const minutes = roundedMinutes.toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  
  // 前後の時間のデータも確認
  const prevTime = `${hours}:${(roundedMinutes - 15).toString().padStart(2, '0')}`;
  const nextTime = `${hours}:${(roundedMinutes + 15 === 60 ? '00' : (roundedMinutes + 15).toString().padStart(2, '0'))}`;
  
  console.log('Time check:', {
    looking_for: timeString,
    previous: prevTime,
    next: nextTime,
    values: {
      prev: data[prevTime],
      current: data[timeString],
      next: data[nextTime]
    }
  });
  
  const numberOfPeople = Number(data[timeString]) || 0;
  return {
    numberOfPeople,
    percentage: Math.round((numberOfPeople / 9) * 100),
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
        const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
        const todayData = data[today] || {};
        
        // データの詳細を確認
        console.log('Data check:', {
          allDays: Object.keys(data),
          todayTimes: Object.keys(todayData).sort(),
          sampleValues: {
            morning: todayData['09:00'],
            noon: todayData['12:00'],
            evening: todayData['18:00']
          }
        });
        
        const futureData = [1, 2, 3].map(offset => getFutureOccupancy(todayData, offset));
        setFutureOccupancies(futureData);
      } catch (error) {
        console.error('データ読み込みエラー:', error);
        setFutureOccupancies([]);
      }
    };

    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000);
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
          <span className="text-sm text-lifefit-gray-400">現時刻: {currentTime}</span>
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