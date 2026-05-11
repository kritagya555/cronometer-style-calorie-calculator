
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';
import { FoodEntry, ExerciseEntry } from '../types';

interface TrendsProps {
  foodEntries: FoodEntry[];
  exerciseEntries: ExerciseEntry[];
  dailyGoal: number;
  theme: 'light' | 'dark';
}

export const Trends: React.FC<TrendsProps> = ({ foodEntries, exerciseEntries, dailyGoal, theme }) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();

  const data = last7Days.map(date => {
    const dailyFood = foodEntries.filter(e => isSameDay(new Date(e.timestamp), date));
    const dailyEx = exerciseEntries.filter(e => isSameDay(new Date(e.timestamp), date));
    
    const consumed = dailyFood.reduce((sum, e) => sum + e.calories, 0);
    const burned = dailyEx.reduce((sum, e) => sum + e.caloriesBurned, 0);
    const net = consumed - burned;

    return {
      date: format(date, 'EEE'),
      fullDate: format(date, 'MMM d'),
      net,
      goal: dailyGoal
    };
  });

  const isDark = theme === 'dark';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Last 7 Days (Net kcal)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: isDark ? '#475569' : '#cbd5e1' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: isDark ? '#475569' : '#cbd5e1' }}
              />
              <Tooltip 
                cursor={{ fill: isDark ? '#1e293b' : '#f8fafc' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-2xl shadow-xl border border-slate-700">
                        <p className="text-[10px] font-bold opacity-60 uppercase">{payload[0].payload.fullDate}</p>
                        <p className="text-sm font-black">{Math.round(payload[0].value as number)} kcal</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="net" radius={[6, 6, 0, 0]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.net > entry.goal ? '#f43f5e' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Weekly Avg</div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {Math.round(data.reduce((sum, d) => sum + d.net, 0) / 7)}
          </div>
          <div className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-widest">KCAL / DAY</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Consistency</div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {data.filter(d => d.net > 0 && d.net <= d.goal * 1.1).length}/7
          </div>
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-600 mt-1 uppercase tracking-widest">DAYS ON TRACK</div>
        </div>
      </div>
    </div>
  );
};
