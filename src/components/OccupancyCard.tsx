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
    <div className={`glass-card rounded-xl p-4 ${isNow ? 'w-full' : 'min-w-[160px]'} animate-fade-in`}>
      {forecast && (
        <p className="text-sm text-gym-text/70 mb-2">{forecast}</p>
      )}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gym-text/70">{time}</span>
        <Users className={`w-5 h-5 ${getOccupancyColor(percentage)}`} />
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-gym-text">{percentage}%</span>
        <span className="text-sm text-gym-text/50">混雑度</span>
      </div>
      <div className="mt-2 w-full bg-gym-text/10 rounded-full h-2">
        <div 
          className={`h-full rounded-full ${getOccupancyColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default OccupancyCard;