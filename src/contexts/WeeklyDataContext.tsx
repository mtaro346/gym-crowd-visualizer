import React, { createContext, useContext, useState } from 'react';

type WeeklyDataContextType = {
  weeklyData: Record<string, Record<string, number>>;
  setWeeklyData: (data: Record<string, Record<string, number>>) => void;
};

const WeeklyDataContext = createContext<WeeklyDataContextType | undefined>(undefined);

export const WeeklyDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weeklyData, setWeeklyData] = useState<Record<string, Record<string, number>>>({});

  return (
    <WeeklyDataContext.Provider value={{ weeklyData, setWeeklyData }}>
      {children}
    </WeeklyDataContext.Provider>
  );
};

export const useWeeklyData = () => {
  const context = useContext(WeeklyDataContext);
  if (context === undefined) {
    throw new Error('useWeeklyData must be used within a WeeklyDataProvider');
  }
  return context;
}; 