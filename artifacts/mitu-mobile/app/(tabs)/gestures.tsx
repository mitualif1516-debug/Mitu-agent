import { Feather } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CapabilityRow } from '@/components/CapabilityRow';
import { nativeCapabilities } from '@/services/nativeCapabilities';
import { useColors } from '@/hooks/useColors';

export default function GesturesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 22, paddingBottom: insets.bottom + 100 }}>
      <Text style={[styles.kicker, { color: colors.accent }]}>TOUCHLESS CONTROL</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Air gestures</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Move through your phone without touching the screen. Native camera processing stays off until you enable the sensor.</Text>
      <View style={[styles.preview, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.previewDot, { backgroundColor: colors.primary }]} />
        <Feather name="move" size={28} color={colors.accent} />
        <Text style={[styles.previewLabel, { color: colors.foreground }]}>Sensor preview paused</Text>
        <Text style={[styles.previewDetail, { color: colors.mutedForeground }]}>MediaPipe hand landmarks will appear here in a native build.</Text>
      </View>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Supported mapping</Text>
      {[
        ['arrow-left', 'Swipe right to left', 'Back navigation'],
        ['home', 'Open palm', 'Home navigation'],
        ['square', 'Fist', 'Recent apps'],
        ['mouse-pointer', 'Pinch', 'Virtual cursor click'],
      ].map(([icon, gesture, action]) => (
        <View key={gesture} style={[styles.mapping, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Feather name={icon as keyof typeof Feather.glyphMap} size={17} color={colors.accent} />
          <View style={styles.mappingCopy}><Text style={[styles.mappingTitle, { color: colors.foreground }]}>{gesture}</Text><Text style={[styles.mappingDetail, { color: colors.mutedForeground }]}>{action}</Text></View>
        </View>
      ))}
      <CapabilityRow icon="camera" {...nativeCapabilities.camera} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  kicker: { fontSize: 10, letterSpacing: 1.4, fontWeight: '800' },
  title: { fontSize: 28, fontWeight: '800', marginTop: 8 },
  subtitle: { fontSize: 13, lineHeight: 20, marginTop: 9, marginBottom: 21 },
  preview: { height: 190, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  previewDot: { position: 'absolute', width: 130, height: 130, borderRadius: 65, opacity: 0.09 },
  previewLabel: { fontSize: 15, fontWeight: '700', marginTop: 13 },
  previewDetail: { fontSize: 11, textAlign: 'center', maxWidth: 220, lineHeight: 16, marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 25, marginBottom: 12 },
  mapping: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 9 },
  mappingCopy: { marginLeft: 12 },
  mappingTitle: { fontSize: 13, fontWeight: '700' },
  mappingDetail: { fontSize: 11, marginTop: 3 },
});