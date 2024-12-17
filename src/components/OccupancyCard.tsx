import { Users } from "lucide-react";

interface OccupancyCardProps {
  time: string;
  percentage: number;
  isNow?: boolean;
}

const OccupancyCard = ({ time, percentage, isNow = false }: OccupancyCardProps) => {
  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 80) return "text-gym-warning";
    if (percentage >= 50) return "text-yellow-500";
    return "text-gym-accent";
  };

  return (
    <div className={`glass-card rounded-xl p-4 ${isNow ? 'w-full' : 'min-w-[140px]'} animate-fade-in`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white/70">{time}</span>
        <Users className={`w-5 h-5 ${getOccupancyColor(percentage)}`} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{percentage}%</span>
        <span className="text-sm text-white/50">occupancy</span>
      </div>
      <div className="mt-2 w-full bg-white/10 rounded-full h-2">
        <div 
          className={`h-full rounded-full ${getOccupancyColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default OccupancyCard;