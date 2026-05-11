
import React, { useState } from 'react';
import { Minus, Calculator, Save } from 'lucide-react';
import { RAW_INGREDIENTS, INDIAN_CUISINE } from '../utils/mockData';
import { FoodEntry, DBFoodItem } from '../types';

interface RecipeCreatorProps {
  onSave: (food: Omit<FoodEntry, 'id' | 'timestamp' | 'servingSize'>) => void;
}

type Unit = 'g' | 'kg' | 'ml' | 'l' | 'tbsp' | 'slice' | 'piece';

interface IngredientEntry {
  name: string;
  amount: number;
  unit: Unit;
  baseUnit: 'g' | 'ml';
  sliceWeight?: number;
  cals: number;
  p: number;
  c: number;
  f: number;
}

export const RecipeCreator: React.FC<RecipeCreatorProps> = ({ onSave }) => {
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState<IngredientEntry[]>([]);
  const [search, setSearch] = useState('');

  const getMultiplier = (amount: number, unit: Unit, sliceWeight?: number): number => {
    switch (unit) {
      case 'kg': return amount * 10;
      case 'l': return amount * 10;
      case 'tbsp': return (amount * 15) / 100;
      case 'slice': 
      case 'piece': 
        return (amount * (sliceWeight || 100)) / 100; // default 100g if no weight
      case 'g': 
      case 'ml': return amount / 100;
      default: return amount; // For direct piece/serving items
    }
  };

  const ALL_MOCK_DATA: DBFoodItem[] = [
    ...RAW_INGREDIENTS, 
    ...INDIAN_CUISINE.map(i => ({ ...i, baseUnit: i.baseUnit || ('g' as const) }))
  ];

  const addIngredient = (ing: DBFoodItem) => {
    setIngredients(prev => [...prev, { 
      name: ing.name, 
      amount: 100, 
      unit: (ing.baseUnit || 'g') as Unit,
      baseUnit: ing.baseUnit || 'g',
      sliceWeight: ing.sliceWeight,
      cals: ing.calories, 
      p: ing.protein, 
      c: ing.carbs, 
      f: ing.fat 
    }]);
    setSearch('');
  };

  const updateIngredient = (index: number, amount: number, unit: Unit) => {
    const updated = [...ingredients];
    const baseIng = ALL_MOCK_DATA.find(i => i.name === updated[index].name)!;
    const multiplier = getMultiplier(amount, unit, baseIng.sliceWeight);
    
    updated[index] = {
      ...updated[index],
      amount,
      unit,
      cals: baseIng.calories * multiplier,
      p: baseIng.protein * multiplier,
      c: baseIng.carbs * multiplier,
      f: baseIng.fat * multiplier
    };
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const totals = ingredients.reduce((acc, ing) => ({
    calories: acc.calories + ing.cals,
    protein: acc.protein + ing.p,
    carbs: acc.carbs + ing.c,
    fat: acc.fat + ing.f
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recipe Name</label>
        <input 
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          placeholder="e.g. My Special Khichdi"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Add Ingredients</label>
        <div className="relative">
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search raw or prepared foods..."
            className="w-full px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white"
          />
          {search && (
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mt-1 rounded-xl shadow-xl z-20 max-h-40 overflow-y-auto">
              {ALL_MOCK_DATA.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).map((ing: any) => (
                <button 
                  key={ing.name}
                  onClick={() => addIngredient(ing)}
                  className="w-full p-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm border-b border-slate-50 dark:border-slate-700 last:border-0 dark:text-slate-300"
                >
                  <div className="font-bold">{ing.name}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest">{ing.category || 'Raw'} • {ing.baseUnit}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {ingredients.map((ing, idx) => (
          <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{ing.name}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">{Math.round(ing.cals)} kcal</div>
            </div>
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-1 overflow-hidden">
              <input 
                type="number" 
                value={ing.amount}
                onChange={(e) => updateIngredient(idx, parseFloat(e.target.value) || 0, ing.unit)}
                className="w-10 py-1 text-center text-[11px] font-bold outline-none dark:bg-slate-800 dark:text-white"
              />
              <select 
                value={ing.unit}
                onChange={(e) => updateIngredient(idx, ing.amount, e.target.value as Unit)}
                className="text-[10px] font-black uppercase text-emerald-600 outline-none bg-transparent cursor-pointer border-l border-slate-100 dark:border-slate-700 pl-1"
              >
                {ing.baseUnit === 'g' ? (
                  <>
                    <option value="g">gm</option>
                    <option value="kg">kg</option>
                    <option value="tbsp">tbsp</option>
                    <option value="piece">piece</option>
                    {ing.sliceWeight && <option value="slice">slice</option>}
                  </>
                ) : (
                  <>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="tbsp">tbsp</option>
                    <option value="piece">piece</option>
                  </>
                )}
              </select>
            </div>
            <button onClick={() => removeIngredient(idx)} className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400">
              <Minus size={16} />
            </button>
          </div>
        ))}
      </div>

      {ingredients.length > 0 && (
        <div className="bg-emerald-600 p-5 rounded-[2rem] text-white shadow-lg shadow-emerald-100 dark:shadow-none">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Calculator size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Recipe Total</span>
            </div>
            <div className="text-2xl font-black">{Math.round(totals.calories)} kcal</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center border-t border-emerald-500/30 pt-4">
            <div>
              <div className="text-[9px] font-bold uppercase opacity-60">Protein</div>
              <div className="font-bold">{Math.round(totals.protein)}g</div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase opacity-60">Carbs</div>
              <div className="font-bold">{Math.round(totals.carbs)}g</div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase opacity-60">Fat</div>
              <div className="font-bold">{Math.round(totals.fat)}g</div>
            </div>
          </div>
        </div>
      )}

      <button 
        disabled={!recipeName || ingredients.length === 0}
        onClick={() => onSave({
          name: recipeName,
          calories: Math.round(totals.calories),
          protein: totals.protein,
          carbs: totals.carbs,
          fat: totals.fat,
          category: 'Custom'
        })}
        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-30 transition-opacity"
      >
        <Save size={18} />
        Save & Log Recipe
      </button>
    </div>
  );
};
