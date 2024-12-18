import OccupancyCard from "@/components/OccupancyCard";
import OccupancyChart from "@/components/OccupancyChart";

const Index = () => {
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getFutureTime = (hoursToAdd: number) => {
    const future = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);
    const hours = future.getHours().toString().padStart(2, '0');
    const minutes = future.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const currentOccupancy = 65;
  const forecast = "現在は比較的空いていますが、2時間後から混雑が予想されます";

  return (
    <div className="container max-w-md mx-auto py-4 space-y-4 px-4">
      <h1 className="text-xl font-bold mb-4">ジム混雑状況</h1>
      
      {/* Current Occupancy */}
      <OccupancyCard 
        time={getCurrentTime()} 
        percentage={currentOccupancy} 
        isNow={true}
        forecast={forecast}
      />
      
      {/* Predictions */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <OccupancyCard time={getFutureTime(1)} percentage={75} />
        <OccupancyCard time={getFutureTime(2)} percentage={45} />
        <OccupancyCard time={getFutureTime(3)} percentage={30} />
      </div>
      
      {/* Chart */}
      <OccupancyChart />
    </div>
  );
};

export default Index;