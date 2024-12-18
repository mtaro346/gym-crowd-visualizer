import OccupancyCard from "@/components/OccupancyCard";
import OccupancyChart from "@/components/OccupancyChart";

const Index = () => {
  const currentOccupancy = 65;
  const forecast = "現在は比較的空いていますが、2時間後から混雑が予想されます";

  return (
    <div className="container max-w-md mx-auto py-4 space-y-4">
      <h1 className="text-xl font-bold mb-4">ジム混雑状況</h1>
      
      {/* Current Occupancy */}
      <OccupancyCard 
        time="現在" 
        percentage={currentOccupancy} 
        isNow={true}
        forecast={forecast}
      />
      
      {/* Predictions */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
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