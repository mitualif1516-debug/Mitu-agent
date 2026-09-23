import { Feather } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export default function RulesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 22, paddingBottom: insets.bottom + 100 }}>
      <Text style={[styles.kicker, { color: colors.accent }]}>AUTOMATION RULES</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>WhatsApp actions</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Mitu can prepare the full flow, then wait for your confirmation before sending anything.</Text>
      <View style={[styles.warning, { backgroundColor: 'rgba(251,191,36,0.1)', borderColor: '#FBBF24' }]}>
        <Feather name="shield" size={16} color="#FBBF24" />
        <Text style={[styles.warningText, { color: colors.foreground }]}>Auto-send is off by default for safety.</Text>
      </View>
      <RuleRow title="Open a WhatsApp conversation" detail="Find a contact from a compound voice command" enabled colors={colors} />
      <RuleRow title="Draft translated replies" detail="Prepare a message in the recipient’s language" enabled colors={colors} />
      <RuleRow title="Send without confirmation" detail="Requires Pro and Accessibility Service access" colors={colors} />
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Example command</Text>
      <View style={[styles.example, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.exampleQuote, { color: colors.foreground }]}>“Mitu, open Arif’s inbox and translate hello into Bengali.”</Text>
        <Text style={[styles.exampleHint, { color: colors.mutedForeground }]}>Listen → find contact → translate → preview → confirm</Text>
      </View>
    </ScrollView>
  );
}

function RuleRow({ title, detail, enabled = false, colors }: { title: string; detail: string; enabled?: boolean; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.rule, { borderColor: colors.border, backgroundColor: colors.card }]}><View style={styles.ruleCopy}><Text style={[styles.ruleTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.ruleDetail, { color: colors.mutedForeground }]}>{detail}</Text></View><Switch value={enabled} disabled={!enabled} trackColor={{ false: colors.muted, true: colors.primary }} thumbColor={colors.foreground} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  kicker: { fontSize: 10, letterSpacing: 1.4, fontWeight: '800' },
  title: { fontSize: 28, fontWeight: '800', marginTop: 8 },
  subtitle: { fontSize: 13, lineHeight: 20, marginTop: 9, marginBottom: 21 },
  warning: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, padding: 13, gap: 9, marginBottom: 13 },
  warningText: { fontSize: 12, fontWeight: '600', flex: 1 },
  rule: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 15, padding: 14, marginBottom: 9 },
  ruleCopy: { flex: 1, paddingRight: 10 },
  ruleTitle: { fontSize: 13, fontWeight: '700' },
  ruleDetail: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 11 },
  example: { borderWidth: 1, borderRadius: 16, padding: 16 },
  exampleQuote: { fontSize: 16, lineHeight: 23, fontWeight: '700' },
  exampleHint: { fontSize: 11, marginTop: 11 },
});