import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock, Plus, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Reminder, ReminderDayType, useAppContext } from '../src/store/AppContext';
import { cancelAllScheduledNotificationsAsync, registerForPushNotificationsAsync, scheduleNotification } from '../src/utils/notifications';

const FREQUENCIES = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
const DAY_TYPES: ReminderDayType[] = ['Everyday', 'Only Today', 'Custom'];
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatTime = (isoString?: string) => {
  if (!isoString) return 'Select Time';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const RadioButton = ({ selected, label, onPress }: { selected: boolean; label: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.radioContainer} onPress={onPress}>
    <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>
    <Text style={styles.radioLabel}>{label}</Text>
  </TouchableOpacity>
);

const ReminderCard = ({ reminder, onUpdate, onDelete }: { reminder: Reminder; onUpdate: (updated: Partial<Reminder>) => void; onDelete?: () => void }) => {
  const [showPicker, setShowPicker] = useState<'time' | 'startTime' | 'endTime' | null>(null);

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    const current = showPicker;
    setShowPicker(null);
    if (selectedDate && current) {
      onUpdate({ [current]: selectedDate.toISOString() });
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {reminder.isWater ? (
          <Text style={styles.cardTitle}>{reminder.title}</Text>
        ) : (
          <TextInput
            style={[styles.cardTitle, { padding: 0, flex: 1, marginRight: 10 }]}
            value={reminder.title}
            onChangeText={(t) => onUpdate({ title: t })}
            placeholder="Reminder Name"
            placeholderTextColor="#888"
          />
        )}
        <View style={styles.headerActions}>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
              <Trash2 size={20} color="#ff4444" />
            </TouchableOpacity>
          )}
          <Switch
            value={reminder.isEnabled}
            onValueChange={(val) => onUpdate({ isEnabled: val })}
            trackColor={{ false: '#333', true: '#4ade80' }}
            thumbColor={reminder.isEnabled ? '#fff' : '#888'}
          />
        </View>
      </View>

      {reminder.isEnabled && (
        <View style={styles.cardBody}>
          <View style={styles.radioGroup}>
            <RadioButton selected={reminder.type === 'once'} label="Only Once" onPress={() => onUpdate({ type: 'once' })} />
            <RadioButton selected={reminder.type === 'frequently'} label="Frequently" onPress={() => onUpdate({ type: 'frequently' })} />
          </View>

          {reminder.type === 'once' && (
            <View style={styles.timeSection}>
              <Text style={styles.sectionLabel}>Time</Text>
              <TouchableOpacity style={styles.timeBtn} onPress={() => setShowPicker('time')}>
                <Clock size={16} color="#a8ff78" />
                <Text style={styles.timeText}>{formatTime(reminder.time)}</Text>
              </TouchableOpacity>
            </View>
          )}

          {reminder.type === 'frequently' && (
            <View style={styles.freqSection}>
              <Text style={styles.sectionLabel}>Frequency (minutes)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {FREQUENCIES.map(f => (
                  <TouchableOpacity key={f} style={[styles.chip, reminder.frequency === f && styles.chipSelected]} onPress={() => onUpdate({ frequency: f })}>
                    <Text style={[styles.chipText, reminder.frequency === f && styles.chipTextSelected]}>{f}m</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.sectionLabel}>Start Time</Text>
                  <TouchableOpacity style={styles.timeBtn} onPress={() => setShowPicker('startTime')}>
                    <Text style={styles.timeText}>{formatTime(reminder.startTime)}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.half}>
                  <Text style={styles.sectionLabel}>End Time</Text>
                  <TouchableOpacity style={styles.timeBtn} onPress={() => setShowPicker('endTime')}>
                    <Text style={styles.timeText}>{formatTime(reminder.endTime)}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Days</Text>
              <View style={styles.rowWrap}>
                {DAY_TYPES.map(dt => (
                  <TouchableOpacity key={dt} style={[styles.chip, reminder.dayType === dt && styles.chipSelected]} onPress={() => onUpdate({ dayType: dt })}>
                    <Text style={[styles.chipText, reminder.dayType === dt && styles.chipTextSelected]}>{dt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {reminder.dayType === 'Custom' && (
                <View style={styles.rowWrap}>
                  {DAYS_OF_WEEK.map((day, idx) => {
                    const isSel = (reminder.customDays || []).includes(idx);
                    return (
                      <TouchableOpacity key={day} style={[styles.chipDay, isSel && styles.chipDaySelected]} onPress={() => {
                        let cd = [...(reminder.customDays || [])];
                        if (isSel) cd = cd.filter(d => d !== idx);
                        else cd.push(idx);
                        onUpdate({ customDays: cd });
                      }}>
                        <Text style={[styles.chipText, isSel && styles.chipTextSelected]}>{day}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {showPicker && (
            <DateTimePicker
              value={reminder[showPicker] ? new Date(reminder[showPicker]!) : new Date()}
              mode="time"
              is24Hour={false} // Depending on locale, false is often safer for users
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default function RemindersScreen() {
  const { reminders, updateReminder, addReminder, deleteReminder } = useAppContext();

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    const sync = async () => {
      await cancelAllScheduledNotificationsAsync();
      const now = new Date();

      for (const r of reminders) {
        if (!r.isEnabled) continue;
        const title = r.title || 'Reminder';
        const body = r.isWater ? 'Time to drink some water.' : 'This is your scheduled reminder.';

        if (r.type === 'once' && r.time) {
          const t = new Date(r.time);
          if (t > now) {
            // Schedule once
            // Actually expo-notifications allows scheduling daily if we use hourly/daily triggers.
            // But if it's "Only Once" per card, we just schedule the exact date.
            // Wait, usually when a user says "Only once" they mean it just triggers at that time today/tomorrow.
            // If they mean "daily at this time", it would be different, but prompt specifically asked for radio buttons: Once/Frequently.
            await scheduleNotification(title, body, { date: t } as any);
          }
        } else if (r.type === 'frequently' && r.frequency && r.startTime && r.endTime) {
            const st = new Date(r.startTime);
            const et = new Date(r.endTime);
            
            let cur = new Date();
            cur.setHours(st.getHours(), st.getMinutes(), 0, 0);
            
            let endLimit = new Date();
            endLimit.setHours(et.getHours(), et.getMinutes(), 0, 0);

            if (endLimit < cur) {
              endLimit.setDate(endLimit.getDate() + 1);
            }

            if (cur < now) {
                while (cur < now) {
                    cur = new Date(cur.getTime() + r.frequency * 60000);
                }
            }

            let scheduledCount = 0;
            while (cur <= endLimit && scheduledCount < 20) {
              const dayIdx = cur.getDay();
              let shouldSchedule = false;
              if (r.dayType === 'Everyday') shouldSchedule = true;
              else if (r.dayType === 'Only Today' && cur.getDate() === now.getDate()) shouldSchedule = true;
              else if (r.dayType === 'Custom' && r.customDays?.includes(dayIdx)) shouldSchedule = true;

              if (shouldSchedule && cur > now) {
                await scheduleNotification(title, body, { date: cur } as any);
                scheduledCount++;
              }
              cur = new Date(cur.getTime() + r.frequency * 60000);
            }
        }
      }
    };
    sync();
  }, [reminders]);

  const handleCreateCustom = () => {
    addReminder({
      title: 'New Reminder', 
      type: 'once', 
      isEnabled: true,
      dayType: 'Everyday',
      frequency: 60,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Your Reminders</Text>
        {reminders.map(r => (
           <ReminderCard
             key={r.id}
             reminder={r}
             onUpdate={(updated) => updateReminder(r.id, updated)}
             onDelete={r.isWater ? undefined : () => deleteReminder(r.id)}
           />
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={handleCreateCustom}>
        <Plus color="#0f0f0f" size={32} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  scroll: { padding: 16, paddingBottom: 100 },
  heading: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 20 },
  card: { backgroundColor: '#181818', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: '#a8ff78', fontSize: 20, fontWeight: '600' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deleteBtn: { padding: 4 },
  cardBody: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#333', paddingTop: 16 },
  radioGroup: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  radioContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#888', justifyContent: 'center', alignItems: 'center' },
  radioOuterSelected: { borderColor: '#a8ff78' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#a8ff78' },
  radioLabel: { color: '#fff', fontSize: 16 },
  timeSection: { gap: 8 },
  sectionLabel: { color: '#888', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  timeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#222', padding: 12, borderRadius: 8 },
  timeText: { color: '#fff', fontSize: 16 },
  freqSection: { gap: 12 },
  chipScroll: { flexDirection: 'row', marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#222', marginRight: 8, borderWidth: 1, borderColor: 'transparent' },
  chipSelected: { backgroundColor: 'rgba(168,255,120,0.1)', borderColor: '#a8ff78' },
  chipText: { color: '#888', fontSize: 14 },
  chipTextSelected: { color: '#a8ff78', fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1, gap: 8 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipDay: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#222', borderWidth: 1, borderColor: '#333', marginBottom: 8 },
  chipDaySelected: { borderColor: '#a8ff78', backgroundColor: 'rgba(168,255,120,0.1)' },
  fab: { position: 'absolute', bottom: 32, right: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: '#a8ff78', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#a8ff78', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }
});
