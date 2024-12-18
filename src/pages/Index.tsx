import React, { useEffect, useState } from "react";
import axios from "axios";
import OccupancyCard from "@/components/OccupancyCard";
import OccupancyChart from "@/components/OccupancyChart";
import WeeklyHeatmap from "@/components/WeeklyHeatmap";

const Index = () => {
  const [occupancyData, setOccupancyData] = useState({ count: 0, last_updated: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://lifefitnarimasu.com/wp-json/gym/v1/people');
        setOccupancyData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container max-w-md mx-auto py-4 space-y-4 px-4">
      <div className="flex justify-center mb-6">
        <img 
          src="/images/LifeFit_Logo_Basic_B_C.png" 
          alt="LifeFit" 
          className="h-20 w-auto"
        />
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-lifefit-blue-400">フリーウェイトエリア混雑状況</h1>
        <span className="text-sm text-lifefit-gray-400">最終更新: {occupancyData.last_updated}</span>
      </div>
      
      <OccupancyCard 
        time="現在" 
        percentage={occupancyData.count} 
        isNow={true}
      />
      
      <OccupancyChart data={occupancyData} />
      <WeeklyHeatmap />
    </div>
  );
};

export default Index;