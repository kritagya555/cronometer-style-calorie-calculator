
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { MacroNutrients } from '../types';

interface SummaryCardsProps {
  consumed: number;
  burned: number;
  goal: number;
  macros: MacroNutrients;
  actualMacros: MacroNutrients;
  theme: 'light' | 'dark';
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ consumed, burned, goal, macros, actualMacros, theme }) => {
  const remaining = goal - consumed + burned;
  
  const macroData = [
    { name: 'Protein', value: actualMacros.protein * 4, color: '#3b82f6', goal: macros.protein * 4 },
    { name: 'Carbs', value: actualMacros.carbs * 4, color: '#10b981', goal: macros.carbs * 4 },
    { name: 'Fat', value: actualMacros.fat * 9, color: '#f59e0b', goal: macros.fat * 9 },
  ];

  const isDark = theme === 'dark';

  return (
    <div className="space-y-4 mb-6 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative min-h-[220px]">
        <div className="w-full h-44">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[{ value: consumed }, { value: Math.max(0, goal - consumed) }]}
                innerRadius={65}
                outerRadius={80}
                startAngle={90}
                endAngle={450}
                dataKey="value"
                stroke="none"
              >
                <Cell fill="#10b981" />
                <Cell fill={isDark ? '#1e293b' : '#f1f5f9'} />
                <Label
                  content={({ viewBox }) => {
                    const { cx, cy } = viewBox as any;
                    return (
                      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                        <tspan x={cx} y={cy - 12} className="text-3xl font-black fill-slate-800 dark:fill-slate-100">
                          {Math.round(remaining)}
                        </tspan>
                        <tspan x={cx} y={cy + 15} className="text-[10px] font-bold fill-slate-400 dark:fill-slate-500 uppercase tracking-widest">
                          kcal left
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 w-full px-4 text-center">
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">Goal</div>
            <div className="font-bold text-slate-600 dark:text-slate-400 text-sm">{goal}</div>
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">Food</div>
            <div className="font-bold text-emerald-600 text-sm">{consumed}</div>
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">Burned</div>
            <div className="font-bold text-orange-500 text-sm">{burned}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {macroData.map((macro) => (
          <div key={macro.name} className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{macro.name[0]}</span>
                <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600">{Math.round(macro.value / (macro.name === 'Fat' ? 9 : 4))}g</span>
              </div>
              <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out" 
                  style={{ 
                    width: `${Math.min(100, (macro.value / macro.goal) * 100)}%`,
                    backgroundColor: macro.color 
                  }}
                />
              </div>
              <div className="text-xs font-black text-slate-700 dark:text-slate-300">
                {Math.round((macro.value / macro.goal) * 100)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
