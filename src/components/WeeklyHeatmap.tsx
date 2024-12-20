import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

// APIから週間データを取得する関数
const fetchWeeklyData = async () => {
  try {
    const response = await fetch('/api/forecast');
    if (!response.ok) {
      throw new Error('データの取得に失敗しました');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('データ取得エラー:', error);
    return [];
  }
};

const getOccupancyColor = (percentage: number) => {
  if (percentage >= 80) return 'bg-accent hover:bg-accent-light';
  if (percentage >= 60) return 'bg-primary hover:bg-primary-light';
  if (percentage >= 40) return 'bg-lifefit-blue-200 hover:bg-lifefit-blue-100';
  return 'bg-lifefit-gray-100 hover:bg-lifefit-gray-200';
};

const WeeklyHeatmap = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTile, setSelectedTile] = useState<{
    day: string;
    hour: string;
    occupancy: number;
  } | null>(null);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchWeeklyData();
      setWeeklyData(data);
    };
    loadData();
  }, []);

  return (
    <div className="glass-card rounded-xl p-4 mt-4 animate-fade-in">
      <div className="flex items-center justify-between w-full text-left mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gym-text/70">週間の混雑状況</h3>
          {selectedTile && (
            <span className="text-sm text-primary-DEFAULT">
              {selectedTile.day} {selectedTile.hour} ({selectedTile.occupancy}%)
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-gym-text/50"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="flex items-center justify-end gap-1 text-xs text-gym-text/50 mb-2">
            <ChevronRight className="w-4 h-4 animate-pulse" />
            <span>スクロールで詳細を表示</span>
          </div>
          <div className="mt-2 overflow-x-auto scrollbar-hide">
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
                        className={`h-6 transition-colors cursor-pointer ${getOccupancyColor(
                          hourData.occupancy
                        )}`}
                        title={`${dayData.day} ${hourData.hour}: ${hourData.occupancy}%`}
                        onClick={() => setSelectedTile({
                          day: dayData.day,
                          hour: hourData.hour,
                          occupancy: hourData.occupancy
                        })}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WeeklyHeatmap;