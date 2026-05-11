
import React from 'react';
import { format, isSameDay } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { FoodEntry, ExerciseEntry } from '../types';

interface HistoryLogsProps {
  foodEntries: FoodEntry[];
  exerciseEntries: ExerciseEntry[];
  onDateSelect: (date: Date) => void;
}

export const HistoryLogs: React.FC<HistoryLogsProps> = ({ foodEntries, exerciseEntries, onDateSelect }) => {
  // Get unique dates from all entries
  const allTimestamps = [
    ...foodEntries.map(e => e.timestamp),
    ...exerciseEntries.map(e => e.timestamp)
  ];
  
  const uniqueDates = Array.from(new Set(
    allTimestamps.map(ts => new Date(ts).setHours(0,0,0,0))
  )).sort((a, b) => b - a).map(ts => new Date(ts));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">History</h3>
      
      {uniqueDates.length === 0 ? (
        <div className="bg-white p-12 rounded-[2rem] text-center border border-slate-100">
           <p className="text-slate-300 font-bold">No history found yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {uniqueDates.map((date, idx) => {
            const dayFood = foodEntries.filter(e => isSameDay(new Date(e.timestamp), date));
            const dayEx = exerciseEntries.filter(e => isSameDay(new Date(e.timestamp), date));
            const cals = dayFood.reduce((sum, e) => sum + e.calories, 0);
            const burned = dayEx.reduce((sum, e) => sum + e.caloriesBurned, 0);

            return (
              <button 
                key={idx}
                onClick={() => onDateSelect(date)}
                className="w-full bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all"
              >
                <div className="text-left">
                  <div className="text-sm font-black text-slate-800 dark:text-slate-100">{format(date, 'EEEE, MMM d')}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    {dayFood.length} items logged
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-600">{cals - burned}</div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase">Net kcal</div>
                  </div>
                  <ChevronRight size={18} className="text-slate-200 dark:text-slate-700" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
