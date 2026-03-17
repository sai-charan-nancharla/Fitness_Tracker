import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
    p: number;
    c: number;
    cal: number;
    targetP: number;
    targetC: number;
    targetCal: number;
}

export const MacroRing: React.FC<Props> = ({ p, c, cal, targetP, targetC, targetCal }) => {
    const pPct = Math.min(100, Math.round((p / targetP) * 100)) || 0;
    const cPct = Math.min(100, Math.round((c / targetC) * 100)) || 0;
    const calPct = Math.min(100, Math.round((cal / targetCal) * 100)) || 0;
    const circ = 238.76;
    const strokeDashoffset = circ - (circ * pPct) / 100;

    return (
        <View style={styles.container}>
            <View style={styles.ringWrap}>
                <Svg width={90} height={90} viewBox="0 0 90 90" style={{ transform: [{ rotate: '-90deg' }] }}>
                    <Circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <Circle
                        cx="45" cy="45" r="38" fill="none" stroke="#a8ff78"
                        strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={circ} strokeDashoffset={strokeDashoffset}
                    />
                </Svg>
                <View style={styles.ringCenter}>
                    <Text style={styles.ringPct}>{pPct}%</Text>
                    <Text style={styles.ringLabel}>PROTEIN</Text>
                </View>
            </View>

            <View style={styles.macroBars}>
                <MacroBar name="Protein" current={p} target={targetP} unit="g" pct={pPct} color="#a8ff78" />
                <MacroBar name="Carbs" current={c} target={targetC} unit="g" pct={cPct} color="#78c1ff" />
                <MacroBar name="Calories" current={cal} target={targetCal} unit="" pct={calPct} color="#ff7eb3" />
            </View>
        </View>
    );
};

const MacroBar = ({ name, current, target, unit, pct, color }: any) => (
    <View style={styles.mbarRow}>
        <View style={styles.mbarHead}>
            <Text style={styles.mbarName}>{name}</Text>
            <Text style={[styles.mbarVal, { color }]}>{current} / {target}{unit}</Text>
        </View>
        <View style={styles.mbarTrack}>
            <View style={[{ width: `${pct}%`, backgroundColor: color }, styles.mbarFill]} />
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: '#181818',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    ringWrap: {
        width: 90,
        height: 90,
        position: 'relative',
    },
    ringCenter: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringPct: {
        fontSize: 18,
        fontWeight: '800',
        color: '#a8ff78',
    },
    ringLabel: {
        fontSize: 9,
        color: '#888',
        letterSpacing: 0.5,
    },
    macroBars: {
        flex: 1,
        gap: 8,
    },
    mbarRow: {
        gap: 3,
    },
    mbarHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    mbarName: {
        fontSize: 11,
        color: '#888',
    },
    mbarVal: {
        fontSize: 11,
        fontWeight: '500',
    },
    mbarTrack: {
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 99,
        overflow: 'hidden',
    },
    mbarFill: {
        height: '100%',
        borderRadius: 99,
    },
});
