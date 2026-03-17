import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    water: number;
    onAdd: (amount: number) => void;
}

export const WaterSection: React.FC<Props> = ({ water, onAdd }) => {
    return (
        <View style={styles.container}>
            <View style={styles.head}>
                <Text style={styles.title}>💧 Water</Text>
                <Text style={styles.val}>{water} / 8 glasses</Text>
            </View>
            <View style={styles.btns}>
                <TouchableOpacity style={styles.btn} onPress={() => onAdd(-1)}>
                    <Text style={styles.btnText}>− Glass</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={() => onAdd(1)}>
                    <Text style={styles.btnText}>+ Glass</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.cups}>
                {[...Array(8)].map((_, i) => (
                    <View key={i} style={[styles.cup, i < water && styles.cupFilled]} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#181818',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginBottom: 20,
    },
    head: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 13,
        fontWeight: '700',
        color: '#78c1ff',
    },
    val: {
        fontSize: 13,
        fontWeight: '500',
        color: '#f0f0f0',
    },
    btns: {
        flexDirection: 'row',
        gap: 8,
    },
    btn: {
        flex: 1,
        height: 36,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        color: '#78c1ff',
        fontSize: 12,
        fontWeight: '700',
    },
    cups: {
        flexDirection: 'row',
        gap: 5,
        marginTop: 10,
        flexWrap: 'wrap',
    },
    cup: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    cupFilled: {
        backgroundColor: '#78c1ff',
        borderColor: '#78c1ff',
    },
});
