import { useAppContext } from '@/src/store/AppContext';
import { eachDayOfInterval, endOfMonth, format, isBefore, isToday, parseISO, startOfDay, startOfMonth } from 'date-fns';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const { daysData, getDayData, getCurrentStreak } = useAppContext();
  const [selectedDateStr, setSelectedDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));

  const streak = getCurrentStreak();

  // Calculate month stats
  const start = startOfMonth(new Date(selectedDateStr));
  const end = endOfMonth(new Date(selectedDateStr));
  const daysInMonth = eachDayOfInterval({ start, end });

  let completedWorkouts = 0;
  let totalWorkouts = 0;

  daysInMonth.forEach(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const d = daysData[dateStr] || getDayData(dateStr);

    if (!d.isRestDay) {
      totalWorkouts++;
      if (d.workoutCompleted) {
        completedWorkouts++;
      }
    }
  });

  const monthProgressPct = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;

  const dayPreview = getDayData(selectedDateStr);
  let p = 0, c = 0, cal = 0;
  dayPreview.checkedMeals.forEach(id => {
    const meal = dayPreview.meals.find(m => m.id === id);
    if (meal) {
      p += meal.p;
      c += meal.c;
      cal += meal.cal;
    }
  });

  const exactTargetP = dayPreview.meals.reduce((sum, m) => sum + (Number(m.p) || 0), 0);
  const exactTargetC = dayPreview.meals.reduce((sum, m) => sum + (Number(m.c) || 0), 0);
  const exactTargetCal = dayPreview.meals.reduce((sum, m) => sum + (Number(m.cal) || 0), 0);

  const pPct = exactTargetP > 0 ? Math.min(100, Math.round((p / exactTargetP) * 100)) : 0;
  const cPct = exactTargetC > 0 ? Math.min(100, Math.round((c / exactTargetC) * 100)) : 0;
  const calPct = exactTargetCal > 0 ? Math.min(100, Math.round((cal / exactTargetCal) * 100)) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>DASHBOARD</Text>
        <Text style={styles.sub}>Analytics & History</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Progress</Text>
          <View style={styles.progressBarWrap}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>{completedWorkouts} / {totalWorkouts} Workouts</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: '#ff8c42', fontWeight: '800', fontSize: 13 }}>🔥 {streak} Streak</Text>
                <Text style={styles.progressPct}>{Math.round(monthProgressPct)}%</Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${monthProgressPct}%` as any }]} />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Calendar
            current={selectedDateStr}
            style={styles.calendar}
            theme={{
              backgroundColor: '#181818',
              calendarBackground: '#181818',
              textSectionTitleColor: '#888',
              monthTextColor: '#f0f0f0',
              arrowColor: '#888',
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
            } as any}
            dayComponent={({ date, state }: any) => {
              const dateStr = date.dateString;
              const d = daysData[dateStr] || getDayData(dateStr);

              const isSelected = dateStr === selectedDateStr;
              const isPast = isBefore(parseISO(dateStr), startOfDay(new Date())) && !isToday(parseISO(dateStr));

              let icon = null;
              if (d.workoutCompleted) {
                icon = '🔥';
              } else if (isPast && !d.isRestDay) {
                icon = '💧';
              }

              return (
                <TouchableOpacity
                  onPress={() => setSelectedDateStr(dateStr)}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    state === 'disabled' && styles.dayCellDisabled
                  ]}
                >
                  {icon && (
                    <View style={styles.dayIconBg}>
                      <Text style={styles.dayIconText}>{icon}</Text>
                    </View>
                  )}
                  <Text style={[
                    styles.dayCellText,
                    isSelected && styles.dayCellTextSelected,
                    state === 'disabled' && styles.dayCellTextDisabled
                  ]}>
                    {date.day}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{format(new Date(selectedDateStr), 'MMMM do, yyyy')} Preview</Text>
          <Text style={styles.workoutStatus}>
            {dayPreview.isRestDay ? '😴 Rest Day' : `💪 ${dayPreview.workout} `}
          </Text>
          <View style={styles.bars}>
            <MacroRow label="Protein Hit" val={`${p} / ${exactTargetP}g`} color="#a8ff78" fill={`${pPct}%`} />
            <MacroRow label="Carbs Hit" val={`${c} / ${exactTargetC}g`} color="#78c1ff" fill={`${cPct}%`} />
            <MacroRow label="Calories Hit" val={`${cal} / ${exactTargetCal}`} color="#ff7eb3" fill={`${calPct}%`} />
          </View >
        </View >

      </ScrollView >
    </SafeAreaView >
  );
}

const MacroRow = ({ label, val, color, fill }: any) => (
  <View style={styles.macroRow}>
    <View style={styles.mbarHead}>
      <Text style={styles.mbarName}>{label}</Text>
      <Text style={[styles.mbarVal, { color }]}>{val}</Text>
    </View>
    <View style={styles.mbarTrack}>
      <View style={[{ width: fill, backgroundColor: color }, styles.mbarFill]} />
    </View>
  </View>
);

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
    color: '#78c1ff',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  sub: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f0f0f0',
    marginBottom: 16,
  },
  progressBarWrap: {
    width: '100%',
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#a8ff78',
    borderRadius: 99,
  },
  calendar: {
    transform: [{ scale: 0.9 }],
    marginHorizontal: -16,
    marginTop: -16,
  },
  dayCell: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayCellSelected: {
    backgroundColor: '#78c1ff',
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayCellText: {
    color: '#f0f0f0',
    fontSize: 14,
    fontWeight: '500',
  },
  dayCellTextSelected: {
    color: '#0f0f0f',
    fontWeight: '700',
  },
  dayCellTextDisabled: {
    color: '#333',
  },
  dayIconBg: {
    position: 'absolute',
    opacity: 0.7,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayIconText: {
    fontSize: 28,
    opacity: 0.8,
  },
  workoutStatus: {
    fontSize: 12,
    color: '#888',
    marginBottom: 16,
  },
  bars: {
    width: '100%',
    gap: 12,
  },
  macroRow: {
    gap: 4,
  },
  mbarHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mbarName: {
    fontSize: 12,
    color: '#888',
  },
  mbarVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  mbarTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  mbarFill: {
    height: '100%',
    borderRadius: 99,
  },
});

