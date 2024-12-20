import { useEffect, useState } from 'react';
import { Users } from "lucide-react";

interface OccupancyCardProps {
  time: string;
  isNow?: boolean;
  forecast?: string;
}

const OccupancyCard = ({ time, isNow = false, forecast }: OccupancyCardProps) => {
  const [percentage, setPercentage] = useState(0);

  // APIから人数データを取得し、混雑率を計算
  useEffect(() => {
    const fetchOccupancyData = async () => {
      try {
        const response = await fetch('/api/people');
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }
        const data = await response.json();
        const count = data.count || 0;
        setPercentage((count / 9) * 100); // 9人を100%とする
      } catch (error) {
        console.error('データ取得エラー:', error);
      }
    };
    fetchOccupancyData();
  }, []);

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
        <span className="text-xl font-bold text-primary">{percentage.toFixed(1)}%</span>
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