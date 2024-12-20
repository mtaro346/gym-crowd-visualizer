import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { useWeeklyData } from '@/contexts/WeeklyDataContext';

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
  switch (occupancy) {
    case 9: return 'bg-[#ff0000] hover:bg-[#ff1a1a]';  // 100%
    case 8: return 'bg-[#ff1a1a] hover:bg-[#ff3333]';  // 89%
    case 7: return 'bg-[#ff3333] hover:bg-[#ff4d4d]';  // 78%
    case 6: return 'bg-[#ff4d4d] hover:bg-[#ff6666]';  // 67%
    case 5: return 'bg-[#ff6666] hover:bg-[#ff8080]';  // 56%
    case 4: return 'bg-[#ff8080] hover:bg-[#ff9999]';  // 44%
    case 3: return 'bg-[#ff9999] hover:bg-[#ffb3b3]';  // 33%
    case 2: return 'bg-[#ffb3b3] hover:bg-[#ffcccc]';  // 22%
    case 1: return 'bg-[#ffcccc] hover:bg-[#ffe6e6]';  // 11%
    case 0: return 'bg-[#ffe6e6] hover:bg-[#ffffff]';  // 0%
    default: return 'bg-[#ffe6e6] hover:bg-[#ffffff]';
  }
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
  const { setWeeklyData } = useWeeklyData();

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchWeeklyData();
      setWeeklyData(data); // 生のデータをコンテキストに保存
      
      // 既存の配列形式への変換はそのまま
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
  }, [setWeeklyData]);

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
                {setWeeklyData.map((dayData) => (
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