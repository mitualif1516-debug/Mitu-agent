import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { getCapabilityStatusLabel, type CapabilityStatus } from '@/services/nativeCapabilities';

export function CapabilityRow({ icon, label, detail, status }: { icon: keyof typeof Feather.glyphMap; label: string; detail: string; status: CapabilityStatus }) {
  const colors = useColors();
  const statusColor = status === 'ready' ? colors.accent : status === 'permission-needed' ? '#FBBF24' : colors.primary;
  return (
    <View style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <View style={[styles.iconBox, { backgroundColor: colors.muted }]}>
        <Feather name={icon} size={17} color={colors.accent} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.detail, { color: colors.mutedForeground }]}>{detail}</Text>
      </View>
      <View style={styles.status}>
        <View style={[styles.dot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>{getCapabilityStatusLabel(status)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 15, padding: 12, marginBottom: 10 },
  iconBox: { width: 35, height: 35, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, marginLeft: 11 },
  label: { fontSize: 13, fontWeight: '700' },
  detail: { fontSize: 11, marginTop: 3 },
  status: { alignItems: 'flex-end', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '700' },
});