import React, { useEffect, useState } from "react";
import OccupancyCard from "@/components/OccupancyCard";
import OccupancyChart from "@/components/OccupancyChart";

const Index = () => {
  const currentOccupancy = 65;
  const forecast = "現在は比較的空いていますが、2時間後から混雑が予想されます";
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 60000); // 1分ごとに更新

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container max-w-md mx-auto py-4 space-y-4 px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">ジム混雑状況</h1>
        <span className="text-sm text-gym-text/70">現在時刻: {currentTime}</span>
      </div>
      
      {/* Current Occupancy */}
      <OccupancyCard 
        time="現在" 
        percentage={currentOccupancy} 
        isNow={true}
        forecast={forecast}
      />
      
      {/* Predictions */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <OccupancyCard time="1時間後" percentage={75} />
        <OccupancyCard time="2時間後" percentage={45} />
        <OccupancyCard time="3時間後" percentage={30} />
      </div>
      
      {/* Chart */}
      <OccupancyChart />
    </div>
  );
};

export default Index;