import { Users } from "lucide-react";

interface OccupancyCardProps {
  time: string;
  percentage: number;
  isNow?: boolean;
  forecast?: string;
}

const OccupancyCard = ({ time, percentage, isNow = false, forecast }: OccupancyCardProps) => {
  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 80) return "text-gym-accent1";
    if (percentage >= 50) return "text-gym-accent2";
    return "text-gym-button";
  };

  return (
    <div className={`glass-card rounded-xl p-3 ${isNow ? 'w-full' : 'min-w-[100px]'} animate-fade-in`}>
      {forecast && (
        <p className="text-sm text-gym-text/70 mb-2">{forecast}</p>
      )}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gym-text/70">{time}</span>
        <Users className={`w-4 h-4 ${getOccupancyColor(percentage)}`} />
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-xl font-bold text-gym-text">{percentage}%</span>
      </div>
      <div className="w-full bg-gym-text/10 rounded-full h-1.5">
        <div 
          className={`h-full rounded-full ${getOccupancyColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default OccupancyCard;