import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function MituOrb({ active = false }: { active?: boolean }) {
  const colors = useColors();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: active ? 600 : 1400, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulse, { toValue: 0, duration: active ? 600 : 1400, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [active, pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, active ? 1.11 : 1.04] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.28, active ? 0.7 : 0.42] });

  return (
    <View style={styles.orbStage}>
      <Animated.View style={[styles.glow, { backgroundColor: colors.primary, opacity: glowOpacity, transform: [{ scale }] }]} />
      <Animated.View style={[styles.ring, { borderColor: colors.accent, transform: [{ scale }] }]} />
      <View style={[styles.orb, { backgroundColor: colors.primary }]}>
        <View style={[styles.core, { backgroundColor: colors.accent }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  orbStage: { width: 210, height: 210, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 180, height: 180, borderRadius: 90 },
  ring: { position: 'absolute', width: 188, height: 188, borderRadius: 94, borderWidth: 1, opacity: 0.75 },
  orb: { width: 132, height: 132, borderRadius: 66, alignItems: 'center', justifyContent: 'center' },
  core: { width: 42, height: 42, borderRadius: 21, opacity: 0.9 },
});