import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslateText } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

export default function TranslateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const translate = useTranslateText({ mutation: { onSuccess: (data) => setResult(data.text) } });
  const submit = () => {
    if (!text.trim() || translate.isPending) return;
    translate.mutate({ data: { text: text.trim(), sourceLanguage: 'bn', targetLanguage: 'en' } });
  };
  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 22, paddingBottom: insets.bottom + 100 }}>
      <Text style={[styles.kicker, { color: colors.accent }]}>LIVE LANGUAGE BRIDGE</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Translate with Mitu</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Speak in Bengali, English, Hindi, or Spanish. Mitu prepares the translated message before it reaches your messaging app.</Text>
      <View style={[styles.languageRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <View><Text style={[styles.langKicker, { color: colors.mutedForeground }]}>FROM</Text><Text style={[styles.lang, { color: colors.foreground }]}>বাংলা · BN</Text></View>
        <Feather name="arrow-right" size={17} color={colors.accent} />
        <View><Text style={[styles.langKicker, { color: colors.mutedForeground }]}>TO</Text><Text style={[styles.lang, { color: colors.foreground }]}>English · EN</Text></View>
      </View>
      <TextInput testID="translation-input" multiline value={text} onChangeText={setText} placeholder="Type a phrase to preview the translation..." placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} />
      <Pressable testID="translate-button" onPress={submit} style={({ pressed }) => [styles.button, { backgroundColor: colors.primary, opacity: pressed || translate.isPending ? 0.75 : 1 }]}>
        {translate.isPending ? <ActivityIndicator color={colors.primaryForeground} /> : <Feather name="globe" size={17} color={colors.primaryForeground} />}
        <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>{translate.isPending ? 'Translating' : 'Translate phrase'}</Text>
      </Pressable>
      {(result || translate.isError) && <View style={[styles.result, { borderColor: translate.isError ? '#FB7185' : colors.accent, backgroundColor: colors.card }]}><Text style={[styles.resultKicker, { color: colors.mutedForeground }]}>{translate.isError ? 'TRANSLATION UNAVAILABLE' : 'TRANSLATED MESSAGE'}</Text><Text style={[styles.resultText, { color: colors.foreground }]}>{translate.isError ? 'Mitu could not reach the translation service. Try again.' : result}</Text></View>}
      <Text style={[styles.note, { color: colors.mutedForeground }]}>Automatic send remains disabled until the Accessibility Service is granted and the remote safety toggle is enabled.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  kicker: { fontSize: 10, letterSpacing: 1.4, fontWeight: '800' },
  title: { fontSize: 28, fontWeight: '800', marginTop: 8 },
  subtitle: { fontSize: 13, lineHeight: 20, marginTop: 9, marginBottom: 22 },
  languageRow: { borderWidth: 1, borderRadius: 15, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  langKicker: { fontSize: 9, letterSpacing: 1, fontWeight: '800' },
  lang: { fontSize: 13, fontWeight: '700', marginTop: 6 },
  input: { minHeight: 132, borderWidth: 1, borderRadius: 15, padding: 15, fontSize: 15, textAlignVertical: 'top', marginTop: 13 },
  button: { borderRadius: 15, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 13 },
  buttonText: { fontSize: 13, fontWeight: '800' },
  result: { borderWidth: 1, borderRadius: 15, padding: 15, marginTop: 19 },
  resultKicker: { fontSize: 9, letterSpacing: 1.1, fontWeight: '800' },
  resultText: { fontSize: 19, lineHeight: 28, fontWeight: '700', marginTop: 10 },
  note: { fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 22, paddingHorizontal: 10 },
});