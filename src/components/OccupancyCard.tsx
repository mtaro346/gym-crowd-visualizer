import { Users } from "lucide-react";

interface OccupancyCardProps {
  time: string;
  percentage: number;
  isNow?: boolean;
  forecast?: string;
}

const OccupancyCard = ({ time, percentage, isNow = false, forecast }: OccupancyCardProps) => {
  // 混雑度に応じた色を返す関数
  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 80) return "text-accent";
    if (percentage >= 50) return "text-primary";
    return "text-lifefit-blue-300";
  };

  return (
    <div className={`glass-card rounded-xl p-3 ${isNow ? 'w-full' : 'min-w-[100px]'} animate-fade-in`}>
      {forecast && (
        <p className="text-sm text-lifefit-gray-400 mb-2">{forecast}</p>
      )}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-lifefit-gray-400">{time}</span>
        {/* このアイコンは後でLottieファイルに置き換える予定です */}
        <Users className={`w-4 h-4 ${getOccupancyColor(percentage)}`} />
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-xl font-bold text-primary">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};

export default OccupancyCard;