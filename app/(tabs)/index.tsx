import { DayScroller } from '@/src/components/DayScroller';
import { MacroRing } from '@/src/components/MacroRing';
import { MealList } from '@/src/components/MealList';
import { WaterSection } from '@/src/components/WaterSection';
import { useAppContext } from '@/src/store/AppContext';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TrackerScreen() {
  const { getDayData, updateDay, toggleMealCheck, updateWater, resetDay } = useAppContext();

  const [activeDateStr, setActiveDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));

  const day = getDayData(activeDateStr);

  let p = 0, c = 0, cal = 0;
  day.checkedMeals.forEach(id => {
    const meal = day.meals.find(m => m.id === id);
    if (meal) {
      p += meal.p;
      c += meal.c;
      cal += meal.cal;
    }
  });

  const exactTargetP = day.meals.reduce((sum, m) => sum + (Number(m.p) || 0), 0);
  const exactTargetC = day.meals.reduce((sum, m) => sum + (Number(m.c) || 0), 0);
  const exactTargetCal = day.meals.reduce((sum, m) => sum + (Number(m.cal) || 0), 0);

  const totalCurrentMacros = p + c + cal;
  const totalTargetMacros = exactTargetP + exactTargetC + exactTargetCal;
  const progressPct = totalTargetMacros > 0 ? Math.min(100, (totalCurrentMacros / totalTargetMacros) * 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>MACRO TRACKER</Text>
        <Text style={styles.sub}>Bulk + fat loss plan · 64kg · 5'9 · 23M</Text>

        <DayScroller activeDateStr={activeDateStr} onSelectDate={setActiveDateStr} />

        <View style={styles.progressBarWrap}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>Daily Progress</Text>
            <Text style={styles.progressPct}>{Math.round(progressPct)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
        </View>

        <View style={styles.workoutHeader}>
          <TouchableOpacity
            style={[styles.workoutChip, day.isRestDay && styles.restChip]}
            onPress={() => updateDay(activeDateStr, { isRestDay: !day.isRestDay, workout: day.isRestDay ? 'New Workout' : 'Rest Day' })}
          >
            <Text style={{ fontSize: 14 }}>{day.isRestDay ? '😴' : '💪'}</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.workoutInput, day.isRestDay && styles.restInput]}
            value={day.workout}
            onChangeText={(txt) => updateDay(activeDateStr, { workout: txt })}
            placeholder="Workout Name..."
            placeholderTextColor="#888"
          />
          {!day.isRestDay && (
            <TouchableOpacity
              style={[styles.completeBtn, day.workoutCompleted && styles.completeBtnActive]}
              onPress={() => updateDay(activeDateStr, { workoutCompleted: !day.workoutCompleted })}
            >
              <Text style={[styles.completeBtnText, day.workoutCompleted && styles.completeBtnTextActive]}>
                {day.workoutCompleted ? 'Completed 🔥' : 'Mark as Complete'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <MacroRing
          p={p} c={c} cal={cal}
          targetP={exactTargetP} targetC={exactTargetC} targetCal={exactTargetCal}
        />

        <Text style={styles.sectionTitle}>MEALS</Text>
        <MealList
          meals={day.meals}
          checkedMeals={day.checkedMeals}
          onToggleMeal={(id) => toggleMealCheck(activeDateStr, id)}
        />

        <WaterSection water={day.water} onAdd={(amt) => updateWater(activeDateStr, amt)} />

        <TouchableOpacity style={styles.resetBtn} onPress={() => resetDay(activeDateStr)}>
          <RefreshCw size={14} color="#888" />
          <Text style={styles.resetText}>Reset Today</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  scroll: {
    padding: 16,
    paddingBottom: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#a8ff78',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  sub: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
  },
  progressBarWrap: {
    width: '100%',
    marginBottom: 20,
    marginTop: -8, // Pull closer to scroller
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  progressPct: {
    fontSize: 15,
    fontWeight: '800',
    color: '#a8ff78',
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#a8ff78',
    borderRadius: 99,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  workoutChip: {
    backgroundColor: 'rgba(168,255,120,0.1)',
    borderColor: 'rgba(168,255,120,0.2)',
    borderWidth: 1,
    borderRadius: 99,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restChip: {
    backgroundColor: 'rgba(136,136,136,0.1)',
    borderColor: 'rgba(136,136,136,0.2)',
  },
  workoutInput: {
    flex: 1,
    color: '#a8ff78',
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 4,
  },
  restInput: {
    color: '#888',
  },
  completeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#181818',
  },
  completeBtnActive: {
    backgroundColor: 'rgba(168,255,120,0.15)',
    borderColor: 'rgba(168,255,120,0.3)',
  },
  completeBtnText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '700',
  },
  completeBtnTextActive: {
    color: '#a8ff78',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
    marginBottom: 10,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 10,
  },
  resetText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
});
