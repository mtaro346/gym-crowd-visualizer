import { Users } from "lucide-react";

interface OccupancyCardProps {
  time: string;
  percentage: number;
  isNow?: boolean;
  forecast?: string;
}

const OccupancyCard = ({ time, percentage, isNow = false, forecast }: OccupancyCardProps) => {
  // 混雑度に応じた色を返す関数
  // Note: このセクションは後でLottieファイルによるアニメーションに置き換える予定です。
  // アイコンとgetOccupancyColor関数を置き換えることで、アニメーションを実装できます。
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
        {/* このアイコンは後でLottieファイルに置き換える予定です */}
        <Users className={`w-4 h-4 ${getOccupancyColor(percentage)}`} />
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-xl font-bold text-gym-text">{percentage}%</span>
      </div>
      {/* パーセンテージバーの実装 */}
      <div className="w-full bg-gym-text/10 rounded-full h-1.5">
        <div 
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};

export default OccupancyCard;