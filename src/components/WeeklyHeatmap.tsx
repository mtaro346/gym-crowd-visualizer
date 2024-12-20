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

const getOccupancyColor = (occupancy: number) => {
  const percentage = (occupancy / 9) * 100; // 9を100%として計算
  if (percentage > 80) return 'bg-[#ff0000] hover:bg-[#ff1a1a]';
  if (percentage > 60) return 'bg-[#ff3333] hover:bg-[#ff4d4d]';  
  if (percentage > 40) return 'bg-[#ff6666] hover:bg-[#ff8080]';
  if (percentage > 20) return 'bg-[#ff9999] hover:bg-[#ffb3b3]';
  return 'bg-[#ffcccc] hover:bg-[#ffe6e6]';
};

const dayNames = {
  sunday: '日曜日',
  monday: '月曜日',
  tuesday: '火曜日',
  wednesday: '水曜日',
  thursday: '木曜日',
  friday: '金曜日',
  saturday: '土曜日',
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
      // データを配列形式に変換
      const formattedData = Object.entries(data).map(([day, hours]) => ({
        day,
        hours: Object.entries(hours).map(([hour, occupancy]) => ({
          hour,
          occupancy
        }))
      }));
      setWeeklyData(formattedData);
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
              {dayNames[selectedTile.day]} {selectedTile.hour} ({Math.round((selectedTile.occupancy / 9) * 100)}%)
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
                      {dayNames[dayData.day]}
                    </div>
                    {dayData.hours.map((hourData, index) => (
                      <div
                        key={index}
                        className={`h-6 transition-colors cursor-pointer ${getOccupancyColor(
                          hourData.occupancy
                        )}`}
                        title={`${dayNames[dayData.day]} ${hourData.hour}: ${hourData.occupancy}%`}
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