import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGetRemoteConfig, useRecordMobileUsage } from '@workspace/api-client-react';
import { MituOrb } from '@/components/MituOrb';
import { CapabilityRow } from '@/components/CapabilityRow';
import { nativeCapabilities } from '@/services/nativeCapabilities';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [listening, setListening] = useState(false);
  const [actionsUsed, setActionsUsed] = useState(0);
  const { data: remoteConfig } = useGetRemoteConfig();
  const usage = useRecordMobileUsage({
    mutation: {
      onSuccess: (data) => {
        setActionsUsed(data.used);
        setListening(false);
      },
    },
  });

  const toggleListening = () => {
    if (listening) {
      setListening(false);
    } else {
      usage.mutate({ data: { userId: 'usr_nabila', actionType: 'voice' } });
      setListening(true);
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: insets.bottom + 100 }}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.kicker, { color: colors.accent }]}>MITU / ASSISTANT CORE</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Good evening, Nabila</Text>
        </View>
        <View style={[styles.liveBadge, { borderColor: colors.border }]}>
          <View style={[styles.liveDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.liveText, { color: colors.mutedForeground }]}>SLEEP MODE</Text>
        </View>
      </View>

      <View style={styles.orbWrap}>
        <MituOrb active={listening} />
        <Text style={[styles.state, { color: colors.foreground }]}>{listening ? 'Listening for your command' : 'Say “Mitu” to begin'}</Text>
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>Your assistant name is fixed for reliable offline detection.</Text>
        <Pressable testID="voice-toggle" onPress={toggleListening} style={({ pressed }) => [styles.listenButton, { backgroundColor: listening ? colors.secondary : colors.primary, opacity: pressed ? 0.82 : 1 }]}>
          <Feather name={listening ? 'pause' : 'mic'} size={17} color={listening ? colors.foreground : colors.primaryForeground} />
          <Text style={[styles.listenText, { color: listening ? colors.foreground : colors.primaryForeground }]}>{listening ? 'Pause listening' : 'Test voice command'}</Text>
        </Pressable>
      </View>

      <View style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.planTop}>
          <View>
            <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>FREE PLAN / TODAY</Text>
            <Text style={[styles.planCount, { color: colors.foreground }]}>{actionsUsed} <Text style={[styles.planLimit, { color: colors.mutedForeground }]}>of {remoteConfig?.freeDailyActionLimit ?? 10} actions</Text></Text>
          </View>
          <View style={[styles.upgradeTag, { backgroundColor: 'rgba(168,85,247,0.16)' }]}>
            <Text style={[styles.upgradeText, { color: colors.primary }]}>UPGRADE TO PRO</Text>
          </View>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
          <View style={[styles.progressValue, { width: `${Math.min(100, (actionsUsed / (remoteConfig?.freeDailyActionLimit ?? 10)) * 100)}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.planHint, { color: colors.mutedForeground }]}>Unlimited commands, translations, and lock-screen access with Mitu Pro.</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Device readiness</Text>
      <CapabilityRow icon="radio" {...nativeCapabilities.wakeWord} />
      <CapabilityRow icon="unlock" {...nativeCapabilities.accessibility} />
      <CapabilityRow icon="camera" {...nativeCapabilities.camera} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  kicker: { fontSize: 10, letterSpacing: 1.4, fontWeight: '800' },
  title: { fontSize: 23, fontWeight: '700', marginTop: 7 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6, gap: 5 },
  liveDot: { width: 5, height: 5, borderRadius: 3 },
  liveText: { fontSize: 9, letterSpacing: 0.7, fontWeight: '800' },
  orbWrap: { alignItems: 'center', paddingTop: 26, paddingBottom: 26 },
  state: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  caption: { textAlign: 'center', fontSize: 11, lineHeight: 16, maxWidth: 250, marginTop: 7 },
  listenButton: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 11, gap: 8, marginTop: 18 },
  listenText: { fontSize: 12, fontWeight: '700' },
  planCard: { borderWidth: 1, borderRadius: 18, marginHorizontal: 20, padding: 16 },
  planTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardKicker: { fontSize: 9, letterSpacing: 1.1, fontWeight: '800' },
  planCount: { fontSize: 24, fontWeight: '800', marginTop: 6 },
  planLimit: { fontSize: 12, fontWeight: '500' },
  upgradeTag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 },
  upgradeText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.6 },
  progressTrack: { height: 6, borderRadius: 3, marginTop: 16, overflow: 'hidden' },
  progressValue: { height: 6, borderRadius: 3 },
  planHint: { fontSize: 11, lineHeight: 16, marginTop: 11 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginHorizontal: 20, marginTop: 26, marginBottom: 12 },
});