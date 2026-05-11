
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { UserStats, ACTIVITY_LEVELS } from '../types';

interface ProfileSettingsProps {
  stats: UserStats;
  onSave: (stats: UserStats) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ stats, onSave, theme, onThemeToggle }) => {
  const [formData, setFormData] = React.useState(stats);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <div 
        onClick={onThemeToggle}
        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 cursor-pointer active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          {theme === 'dark' ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-orange-400" />}
          <div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">Appearance</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">{theme} mode</div>
          </div>
        </div>
        <div
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
            theme === 'dark' ? 'bg-emerald-600' : 'bg-slate-200'
          }`}
        >
          <span
            className={`${
              theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out`}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Activity Level</label>
          <select
            value={formData.activityLevel}
            onChange={(e) => setFormData({ ...formData, activityLevel: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
          >
            {ACTIVITY_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={formData.targetWeight}
            onChange={(e) => setFormData({ ...formData, targetWeight: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors mt-4 shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          Update Goals
        </button>
        <div className="pt-6 border-t border-slate-100 dark:border-slate-700 mt-6">
          <button
            type="button"
            onClick={() => {
              if(confirm('Are you sure you want to clear all your data?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            Clear All Data
          </button>
        </div>
      </form>
    </div>
  );
};
