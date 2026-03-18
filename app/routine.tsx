import { DayData, Meal, useAppContext } from '@/src/store/AppContext';
import { Save } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RoutineEditorScreen() {
    const { routine, updateRoutineDay } = useAppContext();
    const insets = useSafeAreaInsets();

    const [activeDayIndex, setActiveDayIndex] = useState(0); // 0 = Mon, 6 = Sun
    const [editedDay, setEditedDay] = useState<DayData>(routine[activeDayIndex]);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const sourceDay = routine[activeDayIndex];
        // Calculate exact sums from meals on load/tab switch
        const exactTargetP = sourceDay.meals.reduce((sum, m) => sum + (Number(m.p) || 0), 0);
        const exactTargetC = sourceDay.meals.reduce((sum, m) => sum + (Number(m.c) || 0), 0);
        const exactTargetCal = sourceDay.meals.reduce((sum, m) => sum + (Number(m.cal) || 0), 0);

        setEditedDay({
            ...sourceDay,
            targetP: exactTargetP,
            targetC: exactTargetC,
            targetCal: exactTargetCal
        });
        setHasChanges(false);
    }, [activeDayIndex, routine]);

    const handleSave = () => {
        updateRoutineDay(activeDayIndex, editedDay);
        setHasChanges(false);
    };

    const updateField = (field: keyof DayData, value: any) => {
        setEditedDay(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const updateMealField = (mealId: string, field: keyof Meal, value: any) => {
        setEditedDay(prev => {
            const newMeals = prev.meals.map(m => m.id === mealId ? { ...m, [field]: value } : m);

            // Auto-calculate new targets based on meal sum
            const newTargetP = newMeals.reduce((sum, m) => sum + (Number(m.p) || 0), 0);
            const newTargetC = newMeals.reduce((sum, m) => sum + (Number(m.c) || 0), 0);
            const newTargetCal = newMeals.reduce((sum, m) => sum + (Number(m.cal) || 0), 0);

            return {
                ...prev,
                meals: newMeals,
                targetP: newTargetP,
                targetC: newTargetC,
                targetCal: newTargetCal
            };
        });
        setHasChanges(true);
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <ScrollView horizontal contentContainerStyle={styles.tabs} showsHorizontalScrollIndicator={false}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, ix) => (
                        <TouchableOpacity
                            key={ix}
                            style={[styles.tabBtn, activeDayIndex === ix && styles.tabActive]}
                            onPress={() => {
                                if (hasChanges) {
                                    // Auto save on tab switch for simplicity (or can prompt)
                                    updateRoutineDay(activeDayIndex, editedDay);
                                }
                                setActiveDayIndex(ix);
                            }}
                        >
                            <Text style={[styles.tabText, activeDayIndex === ix && styles.tabTextActive]}>{day}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <TouchableOpacity
                    style={[styles.saveBtn, !hasChanges && styles.saveBtnDisabled]}
                    onPress={handleSave}
                    disabled={!hasChanges}
                >
                    <Save size={16} color={hasChanges ? '#0f0f0f' : '#333'} />
                    <Text style={[styles.saveText, !hasChanges && styles.saveTextDisabled]}>SAVE</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.sectionTitle}>ROUTINE DEFAULTS</Text>

                <View style={styles.card}>
                    <Text style={styles.label}>Workout Name</Text>
                    <TextInput
                        style={styles.input}
                        value={editedDay.workout}
                        onChangeText={(txt) => updateField('workout', txt)}
                        placeholderTextColor="#888"
                    />

                    <TouchableOpacity
                        style={[styles.restBtn, editedDay.isRestDay && styles.restBtnActive]}
                        onPress={() => updateField('isRestDay', !editedDay.isRestDay)}
                    >
                        <Text style={[styles.restText, editedDay.isRestDay && styles.restTextActive]}>
                            {editedDay.isRestDay ? '💪 Mark as Workout Day' : '😴 Mark as Rest Day'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>MACRO TARGETS (AUTO-COMPILED)</Text>
                    <Text style={styles.note}>Targets are now calculated automatically from your meal list below.</Text>
                    <View style={styles.targetRow}>
                        <Text style={styles.targetLabel}>Protein (g)</Text>
                        <Text style={styles.derivedTarget}>{editedDay.targetP}</Text>
                    </View>
                    <View style={styles.targetRow}>
                        <Text style={styles.targetLabel}>Carbs (g)</Text>
                        <Text style={styles.derivedTarget}>{editedDay.targetC}</Text>
                    </View>
                    <View style={styles.targetRow}>
                        <Text style={styles.targetLabel}>Calories</Text>
                        <Text style={styles.derivedTarget}>{editedDay.targetCal}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>DEFAULT MEALS</Text>
                    {editedDay.meals.map((m, i) => (
                        <View key={m.id} style={styles.mealRow}>
                            <Text style={styles.mealIcon}>{m.icon}</Text>
                            <View style={styles.mealInfo}>
                                <Text style={styles.mealTime}>{m.time}</Text>
                                <TextInput
                                    style={styles.mealNameInput}
                                    value={m.name}
                                    onChangeText={(txt) => updateMealField(m.id, 'name', txt)}
                                />
                                <View style={styles.mealMacrosEdit}>
                                    <View style={styles.macroInputBox}>
                                        <Text style={styles.macroInputLabel}>P</Text>
                                        <TextInput
                                            style={styles.macroInput} keyboardType="numeric"
                                            value={String(m.p)} onChangeText={(txt) => updateMealField(m.id, 'p', Number(txt) || 0)}
                                        />
                                    </View>
                                    <View style={styles.macroInputBox}>
                                        <Text style={styles.macroInputLabel}>C</Text>
                                        <TextInput
                                            style={styles.macroInput} keyboardType="numeric"
                                            value={String(m.c)} onChangeText={(txt) => updateMealField(m.id, 'c', Number(txt) || 0)}
                                        />
                                    </View>
                                    <View style={styles.macroInputBox}>
                                        <Text style={styles.macroInputLabel}>Kcal</Text>
                                        <TextInput
                                            style={styles.macroInput} keyboardType="numeric"
                                            value={String(m.cal)} onChangeText={(txt) => updateMealField(m.id, 'cal', Number(txt) || 0)}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f0f',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        paddingBottom: 8,
        paddingHorizontal: 8,
    },
    tabs: {
        padding: 8,
        gap: 8,
    },
    tabBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 99,
        backgroundColor: '#181818',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        height: 38,
    },
    tabActive: {
        backgroundColor: '#a8ff78',
        borderColor: '#a8ff78',
    },
    tabText: {
        color: '#888',
        fontWeight: '600',
        fontSize: 13,
    },
    tabTextActive: {
        color: '#0f0f0f',
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#a8ff78',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 99,
        marginRight: 8,
    },
    saveBtnDisabled: {
        backgroundColor: '#181818',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    saveText: {
        color: '#0f0f0f',
        fontWeight: '700',
        fontSize: 12,
    },
    saveTextDisabled: {
        color: '#333',
    },
    scroll: {
        padding: 16,
        paddingBottom: 80,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#888',
        letterSpacing: 1,
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#181818',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        color: '#888',
        marginBottom: 8,
    },
    input: {
        color: '#f0f0f0',
        fontSize: 14,
        fontWeight: '500',
        backgroundColor: '#222',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    restBtn: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(136,136,136,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(136,136,136,0.2)',
        alignItems: 'center',
    },
    restBtnActive: {
        backgroundColor: 'rgba(168,255,120,0.1)',
        borderColor: 'rgba(168,255,120,0.2)',
    },
    restText: {
        color: '#888',
        fontWeight: '600',
    },
    restTextActive: {
        color: '#a8ff78',
    },
    targetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    targetLabel: {
        color: '#f0f0f0',
        fontSize: 14,
    },
    derivedTarget: {
        color: '#a8ff78',
        fontWeight: '700',
        fontSize: 16,
    },
    mealRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    mealIcon: {
        fontSize: 20,
        marginTop: 4,
    },
    mealInfo: {
        flex: 1,
    },
    mealTime: {
        fontSize: 10,
        color: '#888',
        marginBottom: 4,
    },
    mealNameInput: {
        fontSize: 14,
        color: '#f0f0f0',
        backgroundColor: '#222',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    mealMacrosEdit: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    macroInputBox: {
        width: '31%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
    },
    macroInputLabel: {
        fontSize: 10,
        color: '#888',
        minWidth: 32,
        textAlign: 'center',
        backgroundColor: '#2a2a2a',
        paddingVertical: 6,
    },
    macroInput: {
        flex: 1,
        color: '#f0f0f0',
        fontSize: 13,
        paddingVertical: 4,
        paddingHorizontal: 2,
        textAlign: 'center',
        minWidth: 0,
    },
    note: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
        marginBottom: 16,
    },
});
