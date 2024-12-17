import OccupancyCard from "@/components/OccupancyCard";
import OccupancyChart from "@/components/OccupancyChart";

const Index = () => {
  return (
    <div className="container max-w-md mx-auto py-6 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Gym Occupancy</h1>
      
      {/* Current Occupancy */}
      <OccupancyCard time="Current" percentage={65} isNow={true} />
      
      {/* Predictions */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <OccupancyCard time="In 1 hour" percentage={75} />
        <OccupancyCard time="In 2 hours" percentage={45} />
        <OccupancyCard time="In 3 hours" percentage={30} />
      </div>
      
      {/* Chart */}
      <OccupancyChart />
    </div>
  );
};

export default Index;