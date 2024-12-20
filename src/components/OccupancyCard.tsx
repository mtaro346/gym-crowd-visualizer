import { useEffect, useState } from 'react';
import { Users } from "lucide-react";

interface OccupancyCardProps {
  time: string;
  percentage?: number;
  isNow?: boolean;
  forecast?: string;
}

const OccupancyCard = ({ time, percentage: predictedPercentage, isNow = false, forecast }: OccupancyCardProps) => {
  const [percentage, setPercentage] = useState(predictedPercentage || 0);

  useEffect(() => {
    if (isNow) {
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
    } else if (predictedPercentage !== undefined) {
      setPercentage(predictedPercentage);
    }
  }, [isNow, predictedPercentage]);

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 80) return "text-accent";
    if (percentage >= 50) return "text-primary";
    return "text-lifefit-blue-300";
  };

  const displayValue = percentage === -1 ? '--' : `${percentage.toFixed(1)}%`;
  const displayForecast = percentage === -1 ? 'エラーが発生しました' : forecast;

  return (
    <div className={`glass-card rounded-xl p-3 ${isNow ? 'w-full' : 'min-w-[100px]'} animate-fade-in`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          {/* 「混雑回避のご協力をお願いします」というメッセージ */}
          {isNow && forecast && (
            <p className="text-sm text-lifefit-gray-400 mb-1">{displayForecast}</p>
          )}
          {/* 「現在」という文字のサイズ設定 */}
          <span className="text-base font-medium text-lifefit-gray-400">{time}</span>
        </div>
        <Users className={`w-4 h-4 ${getOccupancyColor(percentage)}`} />
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        {/* パーセンテージ（例：65.0%）の文字サイズ設定 */}
        <span className="text-2xl font-bold text-primary">{displayValue}</span>
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