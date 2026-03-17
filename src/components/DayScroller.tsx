import { addDays, addWeeks, format, startOfWeek, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    activeDateStr: string;
    onSelectDate: (dateStr: string) => void;
}

export const DayScroller: React.FC<Props> = ({ activeDateStr, onSelectDate }) => {
    const activeDate = new Date(activeDateStr);
    const [weekStart, setWeekStart] = useState(startOfWeek(activeDate, { weekStartsOn: 1 }));

    // Keep scroller week synced if external change happens
    useEffect(() => {
        const currentWeekStart = startOfWeek(new Date(activeDateStr), { weekStartsOn: 1 });
        if (currentWeekStart.getTime() !== weekStart.getTime()) {
            setWeekStart(currentWeekStart);
        }
    }, [activeDateStr]);

    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
    const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <View style={styles.wrapper}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.arrowBtn} onPress={() => setWeekStart(subWeeks(weekStart, 1))}>
                    <ChevronLeft size={20} color="#888" />
                </TouchableOpacity>
                <Text style={styles.monthText}>{format(weekStart, 'MMMM yyyy')}</Text>
                <TouchableOpacity style={styles.arrowBtn} onPress={() => setWeekStart(addWeeks(weekStart, 1))}>
                    <ChevronRight size={20} color="#888" />
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
                {days.map((date, i) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isActive = dateStr === activeDateStr;

                    return (
                        <TouchableOpacity
                            key={i}
                            style={[styles.btn, isActive && styles.activeBtn]}
                            onPress={() => onSelectDate(dateStr)}
                        >
                            <Text style={[styles.short, isActive && styles.activeText]}>{format(date, 'dd')}</Text>
                            <Text style={[styles.letter, isActive && styles.activeText]}>{letters[i]}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    arrowBtn: {
        padding: 4,
    },
    monthText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#f0f0f0',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    container: {
        paddingBottom: 8,
        gap: 8,
        flexDirection: 'row',
    },
    btn: {
        width: 48,
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: '#181818',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        marginRight: 8,
    },
    activeBtn: {
        backgroundColor: '#a8ff78',
        borderColor: '#a8ff78',
    },
    short: {
        fontSize: 15,
        fontWeight: '800',
        color: '#f0f0f0',
    },
    letter: {
        fontSize: 11,
        fontWeight: '600',
        color: '#888',
    },
    activeText: {
        color: '#0f0f0f',
    },
});
