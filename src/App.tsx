
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Utensils,
  Search,
  PlusCircle,
  TrendingUp,
  History,
  Home
} from 'lucide-react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { 
  UserStats, 
  FoodEntry, 
  ExerciseEntry 
} from './types';
import { calculateTDEE, calculateMacroGoals } from './utils/calculations';
import { INDIAN_CUISINE, EXERCISE_MET } from './utils/mockData';
import { SummaryCards } from './components/SummaryCards';
import { LogTable } from './components/LogTable';
import { Modal } from './components/Modal';
import { ProfileSettings } from './components/ProfileSettings';
import { Trends } from './components/Trends';
import { HistoryLogs } from './components/HistoryLogs';
import { RecipeCreator } from './components/RecipeCreator';

const DEFAULT_STATS: UserStats = {
  age: 28,
  gender: 'male',
  weight: 70,
  height: 175,
  activityLevel: 1.375,
  targetWeight: 68,
};

function App() {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('userStats');
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });

  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>(() => {
    const saved = localStorage.getItem('foodEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntry[]>(() => {
    const saved = localStorage.getItem('exerciseEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({ name: '', duration: 30, calories: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('diary');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('userStats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('foodEntries', JSON.stringify(foodEntries));
  }, [foodEntries]);

  useEffect(() => {
    localStorage.setItem('exerciseEntries', JSON.stringify(exerciseEntries));
  }, [exerciseEntries]);

  const dailyFood = useMemo(() => 
    foodEntries.filter(entry => isSameDay(new Date(entry.timestamp), selectedDate)),
  [foodEntries, selectedDate]);

  const dailyExercise = useMemo(() => 
    exerciseEntries.filter(entry => isSameDay(new Date(entry.timestamp), selectedDate)),
  [exerciseEntries, selectedDate]);

  const totals = useMemo(() => {
    const consumed = dailyFood.reduce((sum, entry) => sum + entry.calories, 0);
    const burned = dailyExercise.reduce((sum, entry) => sum + entry.caloriesBurned, 0);
    const macros = dailyFood.reduce((acc, entry) => ({
      protein: acc.protein + (entry.protein || 0),
      carbs: acc.carbs + (entry.carbs || 0),
      fat: acc.fat + (entry.fat || 0),
    }), { protein: 0, carbs: 0, fat: 0 });

    return { consumed, burned, macros };
  }, [dailyFood, dailyExercise]);

  const tdee = calculateTDEE(stats);
  const macroGoals = calculateMacroGoals(tdee);

  const [pendingFood, setPendingFood] = useState<typeof INDIAN_CUISINE[0] | null>(null);
  const [foodQuantity, setFoodQuantity] = useState(1);
  const [foodUnit, setFoodUnit] = useState<'serving' | 'g' | 'ml' | 'tbsp' | 'slice'>('serving');

  const addFood = (food: typeof INDIAN_CUISINE[0], quantity: number = 1, unit: string = 'serving') => {
    let factor = quantity;
    if (unit === 'tbsp') factor = (quantity * 15) / 100;
    else if (unit === 'slice') factor = (quantity * ((food as any).sliceWeight || 30)) / 100;
    else if (unit === 'g' || unit === 'ml') factor = quantity / 100;
    
    const newEntry: FoodEntry = {
      ...food,
      id: Math.random().toString(36).substr(2, 9),
      name: unit === 'serving' && quantity === 1 ? food.name : `${quantity}${unit === 'serving' ? 'x' : unit} ${food.name}`,
      calories: Math.round(food.calories * factor),
      protein: food.protein * factor,
      carbs: food.carbs * factor,
      fat: food.fat * factor,
      timestamp: selectedDate.getTime(),
      servingSize: `${quantity} ${unit}`
    };
    setFoodEntries([...foodEntries, newEntry]);
    setIsFoodModalOpen(false);
    setPendingFood(null);
    setFoodQuantity(1);
    setFoodUnit('serving');
    setSearchTerm('');
  };

  const addExercise = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newEntry: ExerciseEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name: exerciseForm.name,
      caloriesBurned: exerciseForm.calories,
      duration: exerciseForm.duration,
      timestamp: selectedDate.getTime(),
    };
    setExerciseEntries([...exerciseEntries, newEntry]);
    setIsExerciseModalOpen(false);
    setExerciseForm({ name: '', duration: 30, calories: 0 });
  };

  const handleExerciseChange = (name: string, duration: number) => {
    const activity = EXERCISE_MET.find(a => a.name === name);
    let calories = 0;
    if (activity) {
      // Formula: (MET * 3.5 * weight) / 200 * duration
      calories = Math.round((activity.met * 3.5 * stats.weight) / 200 * duration);
    }
    setExerciseForm({ name, duration, calories });
  };

  const deleteFood = (id: string) => setFoodEntries(foodEntries.filter(e => e.id !== id));
  const deleteExercise = (id: string) => setExerciseEntries(exerciseEntries.filter(e => e.id !== id));

  const filteredFoods = INDIAN_CUISINE.filter(food => 
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-20 transition-colors duration-300">
      {/* Mobile Top Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 h-14 flex items-center justify-center shadow-sm">
        <h1 className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          HUNGERY<span className="text-emerald-600">GOAT</span>
        </h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 min-h-[calc(100vh-120px)]">
        {activeTab === 'diary' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Date Selector - Mobile Friendly */}
            <div className="flex items-center justify-between mb-6 bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="text-center">
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">
                  {isSameDay(selectedDate, new Date()) ? 'TODAY' : format(selectedDate, 'EEEE')}
                </div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {format(selectedDate, 'MMM d, yyyy')}
                </div>
              </div>

              <button 
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Dashboard Components */}
            <SummaryCards 
              consumed={totals.consumed}
              burned={totals.burned}
              goal={Math.round(tdee)}
              macros={macroGoals}
              actualMacros={totals.macros}
              theme={theme}
            />

            {/* Action Quick Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                onClick={() => setIsFoodModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none active:scale-95 transition-transform"
              >
                <PlusCircle size={20} />
                <span>Add Food</span>
              </button>
              <button 
                onClick={() => setIsExerciseModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 py-3.5 rounded-2xl font-bold active:scale-95 transition-transform shadow-sm"
              >
                <PlusCircle size={20} />
                <span>Exercise</span>
              </button>
            </div>

            {/* Logs */}
            <div className="mb-8">
               <LogTable 
                foodEntries={dailyFood}
                exerciseEntries={dailyExercise}
                onDeleteFood={deleteFood}
                onDeleteExercise={deleteExercise}
                onAddFoodClick={() => setIsFoodModalOpen(true)}
                onAddExerciseClick={() => setIsExerciseModalOpen(true)}
              />
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <Trends 
            foodEntries={foodEntries} 
            exerciseEntries={exerciseEntries} 
            dailyGoal={Math.round(tdee)} 
            theme={theme}
          />
        )}

        {activeTab === 'history' && (
          <HistoryLogs 
            foodEntries={foodEntries} 
            exerciseEntries={exerciseEntries} 
            onDateSelect={(date) => {
              setSelectedDate(date);
              setActiveTab('diary');
            }} 
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] dark:shadow-none">
        <button onClick={() => setActiveTab('diary')} className={`flex flex-col items-center gap-1 ${activeTab === 'diary' ? 'text-emerald-600' : 'text-slate-400 dark:text-slate-500'}`}>
          <Home size={22} fill={activeTab === 'diary' ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-bold">DIARY</span>
        </button>
        <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center gap-1 ${activeTab === 'stats' ? 'text-emerald-600' : 'text-slate-400 dark:text-slate-500'}`}>
          <TrendingUp size={22} />
          <span className="text-[10px] font-bold">TRENDS</span>
        </button>
        <button onClick={() => setIsFoodModalOpen(true)} className="flex flex-col items-center gap-1 bg-emerald-600 text-white p-3 rounded-2xl -mt-8 shadow-xl shadow-emerald-200 dark:shadow-none active:scale-90 transition-transform">
          <Utensils size={24} />
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-emerald-600' : 'text-slate-400 dark:text-slate-500'}`}>
          <History size={22} />
          <span className="text-[10px] font-bold">LOGS</span>
        </button>
        <button onClick={() => setIsProfileModalOpen(true)} className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-emerald-600' : 'text-slate-400 dark:text-slate-500'}`}>
          <Settings size={22} />
          <span className="text-[10px] font-bold">GOALS</span>
        </button>
      </nav>

      {/* Modals */}
      <Modal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        title="Settings & Goals"
      >
        <ProfileSettings 
          stats={stats} 
          theme={theme}
          onThemeToggle={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          onSave={(newStats) => {
            setStats(newStats);
            setIsProfileModalOpen(false);
          }} 
        />
      </Modal>

      <Modal 
        isOpen={isFoodModalOpen} 
        onClose={() => setIsFoodModalOpen(false)} 
        title="Search Food"
      >
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
             <button className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 dark:shadow-none">Database</button>
             <button 
               onClick={() => {
                 setIsFoodModalOpen(false);
                 setIsRecipeModalOpen(true);
               }}
               className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold"
             >
               Recipe Creator
             </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search Indian dishes, fruits, veggies..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-[50vh] overflow-y-auto pr-1 -mr-1 custom-scrollbar">
            {pendingFood ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-slate-100">{pendingFood.name}</h4>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase">{pendingFood.category}</p>
                  </div>
                  <button onClick={() => setPendingFood(null)} className="text-slate-400 text-xs font-bold uppercase tracking-widest">Cancel</button>
                </div>
                
                <div className="flex flex-col gap-4 mb-8">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Unit</span>
                    <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                      {['serving', 'g', 'ml', 'tbsp', 'slice'].map((u) => {
                        if (u === 'slice' && !(pendingFood as any)?.sliceWeight) return null;
                        return (
                          <button
                            key={u}
                            onClick={() => {
                              setFoodUnit(u as any);
                              setFoodQuantity(u === 'serving' || u === 'slice' ? 1 : 100);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${foodUnit === u ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                          >
                            {u === 'serving' ? 'pcs' : u}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Amount</span>
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800">
                      <button 
                        onClick={() => {
                          const step = (foodUnit === 'serving' || foodUnit === 'slice') ? 1 : 10;
                          setFoodQuantity(Math.max(step, foodQuantity - step));
                        }}
                        className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-black active:scale-90 transition-transform"
                      >
                        -
                      </button>
                      <span className="text-lg font-black text-slate-800 dark:text-slate-100 w-16 text-center">{foodQuantity}</span>
                      <button 
                        onClick={() => {
                          const step = (foodUnit === 'serving' || foodUnit === 'slice') ? 1 : 10;
                          setFoodQuantity(foodQuantity + step);
                        }}
                        className="w-10 h-10 flex items-center justify-center bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-black active:scale-90 transition-transform"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {(() => {
                    let factor = foodQuantity;
                    if (foodUnit === 'tbsp') factor = (foodQuantity * 15) / 100;
                    else if (foodUnit === 'slice') factor = (foodQuantity * ((pendingFood as any).sliceWeight || 30)) / 100;
                    else if (foodUnit === 'g' || foodUnit === 'ml') factor = foodQuantity / 100;
                    
                    return (
                      <>
                        <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-xl">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Calories</div>
                          <div className="text-lg font-black text-slate-800 dark:text-slate-100">{Math.round(pendingFood.calories * factor)}</div>
                        </div>
                        <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-xl">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Protein</div>
                          <div className="text-lg font-black text-slate-800 dark:text-slate-100">{Math.round(pendingFood.protein * factor)}g</div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <button 
                  onClick={() => addFood(pendingFood, foodQuantity, foodUnit)}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 dark:shadow-none active:scale-95 transition-all"
                >
                  ADD TO DIARY
                </button>
              </div>
            ) : filteredFoods.length > 0 ? (
              <div className="space-y-1">
                {filteredFoods.map((food, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPendingFood(food);
                      setFoodQuantity(1);
                    }}
                    className="w-full p-4 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/10 active:bg-emerald-100 dark:active:bg-emerald-900/20 rounded-2xl flex justify-between items-center group transition-colors border border-transparent hover:border-emerald-100 dark:hover:border-emerald-800"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-0.5">{food.name}</div>
                      <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{food.category}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-800 dark:text-slate-100">{food.calories}</div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase">kcal</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium mb-4 text-sm">Can't find it?</p>
                <button 
                  onClick={() => {
                    const name = prompt('Dish name:');
                    const cals = parseInt(prompt('Approx calories:') || '0');
                    if (name && cals) {
                      addFood({ name, calories: cals, protein: 0, carbs: 0, fat: 0, category: 'Custom' });
                    }
                  }}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold"
                >
                  Create Custom Entry
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isRecipeModalOpen} 
        onClose={() => setIsRecipeModalOpen(false)} 
        title="Recipe Creator"
      >
        <RecipeCreator onSave={(recipe) => {
          const newEntry: FoodEntry = {
            ...recipe,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: selectedDate.getTime(),
          };
          setFoodEntries([...foodEntries, newEntry]);
          setIsRecipeModalOpen(false);
        }} />
      </Modal>

      <Modal 
        isOpen={isExerciseModalOpen} 
        onClose={() => setIsExerciseModalOpen(false)} 
        title="Log Exercise"
      >
        <form onSubmit={addExercise} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Select Activity</label>
            <select 
              value={exerciseForm.name}
              onChange={(e) => handleExerciseChange(e.target.value, exerciseForm.duration)}
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white appearance-none"
            >
              <option value="">Choose activity...</option>
              {EXERCISE_MET.map(ex => (
                <option key={ex.name} value={ex.name}>{ex.name}</option>
              ))}
              <option value="Custom">Custom / Other</option>
            </select>
          </div>

          {exerciseForm.name === 'Custom' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Activity Name</label>
              <input 
                required
                placeholder="Name of activity"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Duration (min)</label>
              <input 
                type="number" 
                required 
                value={exerciseForm.duration}
                onChange={(e) => handleExerciseChange(exerciseForm.name, parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Cals Burned</label>
              <input 
                type="number" 
                required 
                value={exerciseForm.calories}
                onChange={(e) => setExerciseForm({ ...exerciseForm, calories: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white font-bold text-emerald-600 dark:text-emerald-400" 
              />
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
             <div className="flex justify-between items-center">
               <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Estimated Burn</span>
               <span className="text-xl font-black text-emerald-800 dark:text-emerald-100">{exerciseForm.calories} kcal</span>
             </div>
             <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-1 font-medium italic">Based on your current weight of {stats.weight}kg</p>
          </div>

          <button type="submit" className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-xl active:scale-[0.98] transition-all mt-2">
            Save Activity
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default App;
