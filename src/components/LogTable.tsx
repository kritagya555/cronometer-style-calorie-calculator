
import React from 'react';
import { Trash2 } from 'lucide-react';
import { FoodEntry, ExerciseEntry } from '../types';

interface LogTableProps {
  foodEntries: FoodEntry[];
  exerciseEntries: ExerciseEntry[];
  onDeleteFood: (id: string) => void;
  onDeleteExercise: (id: string) => void;
  onAddFoodClick: () => void;
  onAddExerciseClick: () => void;
}

export const LogTable: React.FC<LogTableProps> = ({
  foodEntries,
  exerciseEntries,
  onDeleteFood,
  onDeleteExercise,
}) => {
  return (
    <div className="space-y-4 transition-colors duration-300">
      {/* Entries Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Diary Entries</h3>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {foodEntries.length === 0 && exerciseEntries.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-300 dark:text-slate-700 font-bold text-sm">Hungery? Log your first meal!</p>
            </div>
          ) : (
            <>
              {foodEntries.map((entry) => (
                <div key={entry.id} className="px-6 py-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-800 transition-colors group">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{entry.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{entry.category || 'Food'}</span>
                      <span className="text-[10px] text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">P: {Math.round(entry.protein)}g C: {Math.round(entry.carbs)}g F: {Math.round(entry.fat)}g</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-black text-slate-800 dark:text-slate-100 text-sm">{entry.calories}</div>
                      <div className="text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase">kcal</div>
                    </div>
                    <button 
                      onClick={() => onDeleteFood(entry.id)}
                      className="p-2 text-slate-200 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {exerciseEntries.map((entry) => (
                <div key={entry.id} className="px-6 py-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-800 transition-colors group bg-orange-50/30 dark:bg-orange-950/10">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{entry.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-orange-600 font-black uppercase tracking-widest">Exercise</span>
                      <span className="text-[10px] text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{entry.duration} min</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-black text-orange-600 dark:text-orange-400 text-sm">-{entry.caloriesBurned}</div>
                      <div className="text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase">kcal</div>
                    </div>
                    <button 
                      onClick={() => onDeleteExercise(entry.id)}
                      className="p-2 text-slate-200 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
