import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, getDay, parseISO, subDays } from 'date-fns';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Meal = {
  id: string;
  icon: string;
  time: string;
  name: string;
  p: number;
  c: number;
  cal: number;
};

export type ReminderType = 'once' | 'frequently';
export type ReminderDayType = 'Everyday' | 'Only Today' | 'Custom';

export type Reminder = {
  id: string;
  title: string;
  isEnabled: boolean;
  isWater: boolean;
  type: ReminderType;
  time?: string;
  frequency?: number;
  startTime?: string;
  endTime?: string;
  dayType?: ReminderDayType;
  customDays?: number[];
};

export type DayData = {
  short: string;
  label: string;
  workout: string;
  isRestDay: boolean;
  workoutCompleted?: boolean;
  targetP: number;
  targetC: number;
  targetCal: number;
  meals: Meal[];
  checkedMeals: string[];
  water: number;
};

const defaultMonMeals: Meal[] = [
  { id: '1', icon: '🍌', time: 'Pre-gym', name: 'Banana + water', p: 1, c: 24, cal: 100 },
  { id: '2', icon: '🥚', time: 'Breakfast', name: '4 eggs + Muesli + Milk', p: 47, c: 55, cal: 460 },
  { id: '3', icon: '🍎', time: 'Mid-day', name: 'Guava + Apple', p: 2, c: 30, cal: 120 },
  { id: '4', icon: '🍚', time: 'Lunch', name: 'Rice + Veg curry + Soya chunks', p: 38, c: 85, cal: 520 },
  { id: '5', icon: '🥜', time: 'Evening', name: 'Tea + Biscuits + Peanuts', p: 8, c: 20, cal: 200 },
  { id: '6', icon: '🍽️', time: 'Dinner', name: 'Rice + Veg curry + 3 eggs', p: 23, c: 70, cal: 430 },
  { id: '7', icon: '🥛', time: 'After dinner', name: '100g Curd', p: 4, c: 5, cal: 60 },
];

export const DEFAULT_ROUTINE: DayData[] = [
  { short: 'Mon', label: 'Monday', workout: 'Chest & Triceps', isRestDay: false, workoutCompleted: false, targetP: 132, targetC: 280, targetCal: 2800, meals: [...defaultMonMeals], checkedMeals: [], water: 0 },
  { short: 'Tue', label: 'Tuesday', workout: 'Legs & Shoulders', isRestDay: false, workoutCompleted: false, targetP: 130, targetC: 280, targetCal: 2800, meals: [...defaultMonMeals], checkedMeals: [], water: 0 },
  { short: 'Wed', label: 'Wednesday', workout: 'Back & Biceps', isRestDay: false, workoutCompleted: false, targetP: 138, targetC: 290, targetCal: 2900, meals: [...defaultMonMeals], checkedMeals: [], water: 0 },
  { short: 'Thu', label: 'Thursday', workout: 'Chest & Triceps', isRestDay: false, workoutCompleted: false, targetP: 149, targetC: 280, targetCal: 2850, meals: [...defaultMonMeals], checkedMeals: [], water: 0 },
  { short: 'Fri', label: 'Friday', workout: 'Legs & Shoulders', isRestDay: false, workoutCompleted: false, targetP: 132, targetC: 280, targetCal: 2800, meals: [...defaultMonMeals], checkedMeals: [], water: 0 },
  { short: 'Sat', label: 'Saturday', workout: 'Back & Biceps', isRestDay: false, workoutCompleted: false, targetP: 162, targetC: 285, targetCal: 2900, meals: [...defaultMonMeals], checkedMeals: [], water: 0 },
  { short: 'Sun', label: 'Sunday', workout: 'Rest Day', isRestDay: true, workoutCompleted: false, targetP: 114, targetC: 260, targetCal: 2500, meals: [...defaultMonMeals], checkedMeals: [], water: 0 },
];

const STORAGE_KEY = '@fitness_tracker_v2';

interface AppStateData {
  routine: DayData[];
  daysData: Record<string, DayData>;
  reminders: Reminder[];
}

interface AppContextType {
  routine: DayData[];
  daysData: Record<string, DayData>;
  reminders: Reminder[];
  updateRoutineDay: (dayIndex: number, updatedDay: Partial<DayData>) => void;
  getDayData: (dateStr: string) => DayData; // YYYY-MM-DD
  updateDay: (dateStr: string, updatedDay: Partial<DayData>) => void;
  toggleMealCheck: (dateStr: string, mealId: string) => void;
  updateWater: (dateStr: string, amount: number) => void;
  resetDay: (dateStr: string) => void;
  addNewMeal: (dateStr: string, meal: Omit<Meal, 'id'>) => void;
  addReminder: (reminder: Omit<Reminder, 'id' | 'isWater'>) => void;
  updateReminder: (id: string, updated: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  getCurrentStreak: () => number;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routine, setRoutine] = useState<DayData[]>(DEFAULT_ROUTINE);
  const [daysData, setDaysData] = useState<Record<string, DayData>>({});
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: 'water', title: 'Water', isEnabled: false, isWater: true, type: 'once' }
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: AppStateData = JSON.parse(stored);
          if (parsed.routine) setRoutine(parsed.routine);
          if (parsed.daysData) setDaysData(parsed.daysData);
          if (parsed.reminders) setReminders(parsed.reminders);
        } else {
          // Migration from old app version if needed
          const oldStored = await AsyncStorage.getItem('@fitness_tracker_week');
          if (oldStored) {
            const oldWeek = JSON.parse(oldStored);
            setRoutine(oldWeek);
          }
        }
      } catch (e) {
        console.error('Failed to load data', e);
      }
    };
    loadData();
  }, []);

  const saveToStorage = async (newRoutine: DayData[], newDaysData: Record<string, DayData>, newReminders: Reminder[]) => {
    try {
      const data: AppStateData = { routine: newRoutine, daysData: newDaysData, reminders: newReminders };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data', e);
    }
  };

  const updateRoutineDay = (dayIndex: number, updatedDay: Partial<DayData>) => {
    setRoutine(prev => {
      const next = [...prev];
      next[dayIndex] = { ...next[dayIndex], ...updatedDay };
      saveToStorage(next, daysData, reminders);
      return next;
    });
  };

  const getDayOfWeekIndex = (dateStr: string) => {
    // 0 is Sunday, 1 is Monday in date-fns getDay
    // Our array is 0=Mon, 1=Tue, ..., 6=Sun
    const d = parseISO(dateStr);
    const day = getDay(d);
    const map = [6, 0, 1, 2, 3, 4, 5];
    return map[day];
  };

  const getDayData = (dateStr: string) => {
    if (daysData[dateStr]) {
      return daysData[dateStr];
    }
    // Return template from routine if no specific data exists
    const template = routine[getDayOfWeekIndex(dateStr)];
    return { ...template, checkedMeals: [], water: 0, workoutCompleted: false };
  };

  const updateDay = (dateStr: string, updatedDay: Partial<DayData>) => {
    setDaysData(prev => {
      const current = prev[dateStr] || getDayData(dateStr);
      const next = { ...prev, [dateStr]: { ...current, ...updatedDay } };
      saveToStorage(routine, next, reminders);
      return next;
    });
  };

  const toggleMealCheck = (dateStr: string, mealId: string) => {
    setDaysData(prev => {
      const current = prev[dateStr] || getDayData(dateStr);
      const isChecked = current.checkedMeals.includes(mealId);

      let newChecked = [...current.checkedMeals];
      if (isChecked) {
        newChecked = newChecked.filter(id => id !== mealId);
      } else {
        newChecked.push(mealId);
      }

      const next = { ...prev, [dateStr]: { ...current, checkedMeals: newChecked } };
      saveToStorage(routine, next, reminders);
      return next;
    });
  };

  const updateWater = (dateStr: string, amount: number) => {
    setDaysData(prev => {
      const current = prev[dateStr] || getDayData(dateStr);
      const newWater = Math.max(0, Math.min(8, current.water + amount));
      const next = { ...prev, [dateStr]: { ...current, water: newWater } };
      saveToStorage(routine, next, reminders);
      return next;
    });
  };

  const resetDay = (dateStr: string) => {
    setDaysData(prev => {
      const current = prev[dateStr] || getDayData(dateStr);
      const next = { ...prev, [dateStr]: { ...current, checkedMeals: [], water: 0, workoutCompleted: false } };
      saveToStorage(routine, next, reminders);
      return next;
    });
  };

  const addNewMeal = (dateStr: string, meal: Omit<Meal, 'id'>) => {
    setDaysData(prev => {
      const current = prev[dateStr] || getDayData(dateStr);
      const newMeal: Meal = { ...meal, id: Date.now().toString() };
      const next = { ...prev, [dateStr]: { ...current, meals: [...current.meals, newMeal] } };
      saveToStorage(routine, next, reminders);
      return next;
    });
  };

  const addReminder = (reminder: Omit<Reminder, 'id' | 'isWater'>) => {
    setReminders(prev => {
      const next = [...prev, { ...reminder, id: Date.now().toString(), isWater: false }];
      saveToStorage(routine, daysData, next);
      return next;
    });
  };

  const updateReminder = (id: string, updated: Partial<Reminder>) => {
    setReminders(prev => {
      const next = prev.map(r => r.id === id ? { ...r, ...updated } : r);
      saveToStorage(routine, daysData, next);
      return next;
    });
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => {
      const next = prev.filter(r => r.id !== id);
      saveToStorage(routine, daysData, next);
      return next;
    });
  };

  const getCurrentStreak = () => {
    let streak = 0;
    let currentDate = new Date();

    // Check up to 365 days backwards to find streak
    for (let i = 0; i < 365; i++) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const day = daysData[dateStr] || getDayData(dateStr);

      if (day.isRestDay) {
        // Rest days extend the streak, they do not break it and don't add to it (or maybe they add? let's add them to continuum)
        // But what if the whole week is rest days? Typically streak is contiguous active completion.
        // If it's a rest day, it's a pass. We just keep iterating.
        // (Optional logic: +1 to streak if you actually rested properly, but for now we just don't break the streak string)
        // It just allows the chain to look further back.
        continue;
      }

      if (day.workoutCompleted) {
        streak++;
      } else {
        // The first check is today. If today isn't completed, it might just mean they haven't worked out yet today.
        // So we only break if it's NOT today OR if it's past the end of the day.
        if (i === 0) {
          // Allow today to be incomplete without breaking yesterday's streak
        } else {
          // A past non-rest day was not completed, streak broken.
          break;
        }
      }
      currentDate = subDays(currentDate, 1);
    }
    return streak;
  }

  return (
    <AppContext.Provider value={{
      routine, daysData, reminders,
      updateRoutineDay, getDayData, updateDay, toggleMealCheck, updateWater, resetDay, addNewMeal,
      addReminder, updateReminder, deleteReminder,
      getCurrentStreak
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
