import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Composer, Surface, ActionRow } from '@/components/linkup-surface';
import { useAuth } from '@/features/auth/auth-context';
import { executeLocalCommand, applyLocalNavigation, type AssistantResult } from '@/features/assistant/assistant-executor';

const suggestions = ['Calculate 847 × 39', 'Open my messages', 'Find my unread messages', 'Help me plan today'];

export default function AssistantScreen() {
  const { tokens } = useAuth();
  const [input, setInput] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [status, setStatus] = useState('Ready');
  const [result, setResult] = useState<AssistantResult | null>(null);

  const historyLabel = useMemo(() => lastCommand ? `Last request: “${lastCommand}”` : 'No command yet', [lastCommand]);

  const submit = (command = input) => {
    const value = command.trim();
    if (!value) return;
    setLastCommand(value);
    setInput('');
    setStatus('Thinking');
    const next = executeLocalCommand(value);
    setResult(next);
    setStatus(next.route ? 'Ready to act' : next.answer ? 'Verified' : next.requiresConfirmation ? 'Needs confirmation' : 'Planned');
  };

  if (!tokens) {
    return <View style={styles.center}><ThemedText style={styles.title}>LinkUp AI</ThemedText><ThemedText themeColor="textSecondary">Sign in to use your private assistant.</ThemedText></View>;
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.kicker}>LINKUP AI</ThemedText>
        <ThemedText style={styles.title}>Tell me what you want done.</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.description}>Natural language first. LinkUp plans the request, performs safe local actions, and shows you what happened.</ThemedText>

        <Surface style={styles.statusCard}>
          <View style={styles.statusLine}><View style={styles.statusDot} /><ThemedText style={styles.statusText}>{status}</ThemedText><ThemedText type="small" themeColor="textSecondary" style={styles.statusHint}>local command layer</ThemedText></View>
          {result ? <View style={styles.result}>
            <ThemedText type="small" themeColor="textSecondary">{historyLabel}</ThemedText>
            <ThemedText style={styles.resultTitle}>{result.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">{result.detail}</ThemedText>
            {result.answer ? <View style={styles.answer}><ThemedText style={styles.answerLabel}>RESULT</ThemedText><ThemedText style={styles.answerText}>{result.answer}</ThemedText></View> : null}
            {result.route ? <Pressable accessibilityRole="button" onPress={() => applyLocalNavigation(result)} style={styles.actionButton}><ThemedText style={styles.actionText}>Open destination ↗</ThemedText></Pressable> : null}
          </View> : null}
        </Surface>

        <Composer value={input} onChangeText={setInput} placeholder="Ask LinkUp anything…" onSubmit={() => submit()} multiline />
        <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>Try a command</ThemedText>
        <Surface>{suggestions.map((item) => <ActionRow key={item} title={item} onPress={() => submit(item)} />)}</Surface>
        <View style={styles.pipeline}>
          {['Thinking', 'Planning', 'Acting', 'Verifying'].map((step, index) => <View key={step} style={styles.pipelineStep}><ThemedText style={styles.pipelineIndex}>0{index + 1}</ThemedText><ThemedText type="small">{step}</ThemedText></View>)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05070d' },
  center: { flex: 1, backgroundColor: '#05070d', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  content: { padding: 22, paddingTop: 56, paddingBottom: 120, gap: 14, maxWidth: 760, width: '100%', alignSelf: 'center' },
  kicker: { fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#f8fafc', fontSize: 35, lineHeight: 40, fontWeight: '800', letterSpacing: -0.8, marginTop: 6 },
  description: { fontSize: 15, lineHeight: 23, maxWidth: 600 },
  statusCard: { padding: 16, overflow: 'visible' },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#93c5fd' },
  statusText: { color: '#f8fafc', fontSize: 13, fontWeight: '800' },
  statusHint: { marginLeft: 'auto' },
  result: { marginTop: 15, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#1d2738', gap: 5 },
  resultTitle: { color: '#f8fafc', fontSize: 17, fontWeight: '750' },
  answer: { marginTop: 8, padding: 14, borderRadius: 17, backgroundColor: '#0b1424', borderWidth: 1, borderColor: '#29456f' },
  answerLabel: { color: '#93c5fd', fontSize: 9, fontWeight: '900', letterSpacing: 1.6 },
  answerText: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 5 },
  actionButton: { marginTop: 7, minHeight: 46, borderRadius: 15, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  actionText: { color: '#07101f', fontWeight: '800' },
  sectionLabel: { marginTop: 8, textTransform: 'uppercase', letterSpacing: 1.5 },
  pipeline: { flexDirection: 'row', gap: 8, marginTop: 8 },
  pipelineStep: { flex: 1, minHeight: 78, padding: 12, borderRadius: 18, backgroundColor: '#0b101b', borderWidth: 1, borderColor: '#1d2738', gap: 10 },
  pipelineIndex: { color: '#64748b', fontSize: 10, fontWeight: '900' },
});
