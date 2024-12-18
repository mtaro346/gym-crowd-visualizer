import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// 仮のデータ生成関数（後でAPIから取得するデータに置き換え可能）
const generateWeeklyData = () => {
  const days = ['月', '火', '水', '木', '金', '土', '日'];
  const hours = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  });
  
  const data = days.map(day => ({
    day,
    hours: hours.map(hour => ({
      hour,
      occupancy: Math.floor(Math.random() * 100)
    }))
  }));
  
  return data;
};

const getOccupancyColor = (percentage: number) => {
  if (percentage >= 80) return 'bg-accent hover:bg-accent-light';
  if (percentage >= 60) return 'bg-primary hover:bg-primary-light';
  if (percentage >= 40) return 'bg-lifefit-blue-200 hover:bg-lifefit-blue-100';
  return 'bg-lifefit-gray-100 hover:bg-lifefit-gray-200';
};

const WeeklyHeatmap = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const weeklyData = generateWeeklyData();

  return (
    <div className="glass-card rounded-xl p-4 mt-4 animate-fade-in">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-sm font-medium text-gym-text/70">週間の混雑状況</h3>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gym-text/50" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gym-text/50" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 overflow-x-auto scrollbar-hide">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[auto_repeat(96,1fr)] gap-[2px]">
              {/* 時間のヘッダー */}
              <div className="h-6" /> {/* 空のセル */}
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  className="text-xs text-gym-text/50 text-center col-span-4"
                >
                  {`${String(i).padStart(2, '0')}`}
                </div>
              ))}

              {/* 曜日ごとのデータ */}
              {weeklyData.map((dayData) => (
                <React.Fragment key={dayData.day}>
                  <div className="text-sm text-gym-text/70 pr-2 flex items-center">
                    {dayData.day}
                  </div>
                  {dayData.hours.map((hourData, index) => (
                    <div
                      key={index}
                      className={`h-6 transition-colors ${getOccupancyColor(
                        hourData.occupancy
                      )}`}
                      title={`${dayData.day} ${hourData.hour}: ${hourData.occupancy}%`}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyHeatmap;