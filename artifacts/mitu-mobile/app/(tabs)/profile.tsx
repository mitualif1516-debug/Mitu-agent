import { Feather } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CapabilityRow } from '@/components/CapabilityRow';
import { nativeCapabilities } from '@/services/nativeCapabilities';
import { useColors } from '@/hooks/useColors';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 22, paddingBottom: insets.bottom + 100 }}>
      <Text style={[styles.kicker, { color: colors.accent }]}>YOUR MITU PROFILE</Text>
      <View style={styles.identity}><View style={[styles.avatar, { backgroundColor: colors.primary }]}><Text style={[styles.avatarText, { color: colors.primaryForeground }]}>N</Text></View><View><Text style={[styles.name, { color: colors.foreground }]}>Nabila Rahman</Text><Text style={[styles.email, { color: colors.mutedForeground }]}>nabila@mitu.app</Text></View></View>
      <View style={[styles.proCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.proIcon, { backgroundColor: 'rgba(168,85,247,0.18)' }]}><Feather name="zap" size={17} color={colors.primary} /></View><View style={styles.proCopy}><Text style={[styles.proTitle, { color: colors.foreground }]}>Mitu Free</Text><Text style={[styles.proDetail, { color: colors.mutedForeground }]}>3 lock-screen activations left today</Text></View><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></View>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Permissions & services</Text>
      <CapabilityRow icon="radio" {...nativeCapabilities.wakeWord} />
      <CapabilityRow icon="unlock" {...nativeCapabilities.accessibility} />
      <CapabilityRow icon="camera" {...nativeCapabilities.camera} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  kicker: { fontSize: 10, letterSpacing: 1.4, fontWeight: '800' },
  identity: { flexDirection: 'row', alignItems: 'center', marginTop: 21, marginBottom: 22 },
  avatar: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  avatarText: { fontSize: 21, fontWeight: '800' },
  name: { fontSize: 18, fontWeight: '800' },
  email: { fontSize: 12, marginTop: 4 },
  proCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, padding: 14 },
  proIcon: { width: 35, height: 35, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  proCopy: { flex: 1, marginLeft: 11 },
  proTitle: { fontSize: 13, fontWeight: '800' },
  proDetail: { fontSize: 11, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 26, marginBottom: 12 },
});