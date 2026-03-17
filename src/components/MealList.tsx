import { Check } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Meal } from '../store/AppContext';

interface Props {
    meals: Meal[];
    checkedMeals: string[];
    onToggleMeal: (id: string) => void;
}

export const MealList: React.FC<Props> = ({ meals, checkedMeals, onToggleMeal }) => {
    return (
        <View style={styles.list}>
            {meals.map(meal => {
                const isChecked = checkedMeals.includes(meal.id);
                return (
                    <TouchableOpacity
                        key={meal.id}
                        activeOpacity={0.8}
                        style={[styles.card, isChecked && styles.cardChecked]}
                        onPress={() => onToggleMeal(meal.id)}
                    >
                        <View style={styles.iconBox}>
                            <Text style={{ fontSize: 16 }}>{meal.icon}</Text>
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.time}>{meal.time}</Text>
                            <Text style={styles.name} numberOfLines={1}>{meal.name}</Text>
                            <View style={styles.macros}>
                                <Text style={styles.tag}><Text style={{ color: '#a8ff78', fontWeight: '500' }}>{meal.p}g</Text> p</Text>
                                <Text style={styles.tag}><Text style={{ color: '#78c1ff', fontWeight: '500' }}>{meal.c}g</Text> c</Text>
                                <Text style={styles.tag}><Text style={{ color: '#ff7eb3', fontWeight: '500' }}>{meal.cal}</Text> kcal</Text>
                            </View>
                        </View>
                        <View style={[styles.checkCircle, isChecked && styles.checkCircleActive]}>
                            {isChecked && <Check size={14} color="#0f0f0f" strokeWidth={3} />}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    list: {
        gap: 8,
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#181818',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardChecked: {
        borderColor: '#a8ff78',
        backgroundColor: 'rgba(168,255,120,0.06)',
    },
    iconBox: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        flex: 1,
    },
    time: {
        fontSize: 10,
        color: '#888',
        marginBottom: 1,
    },
    name: {
        fontSize: 13,
        fontWeight: '500',
        color: '#f0f0f0',
    },
    macros: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 3,
    },
    tag: {
        fontSize: 10,
        color: '#888',
    },
    checkCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkCircleActive: {
        backgroundColor: '#a8ff78',
        borderColor: '#a8ff78',
    },
});
