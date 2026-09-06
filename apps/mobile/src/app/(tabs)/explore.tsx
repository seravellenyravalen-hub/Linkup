import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

const topics = ['Close friends', 'Communities', 'People nearby', 'Shared interests'];

export default function ExploreScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.screen} contentContainerStyle={styles.content}>
      <ThemedText type="small" themeColor="textSecondary">DISCOVER</ThemedText>
      <ThemedText style={styles.title}>Find your next connection.</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.description}>
        Explore people, spaces, and conversations without turning your social life into a feed of noise.
      </ThemedText>
      <View style={styles.list}>
        {topics.map((topic, index) => (
          <View key={topic} style={styles.card}>
            <View style={styles.index}><ThemedText style={styles.indexText}>0{index + 1}</ThemedText></View>
            <View style={styles.copy}>
              <ThemedText style={styles.cardTitle}>{topic}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">A quieter way to discover.</ThemedText>
            </View>
            <ThemedText style={styles.arrow}>↗</ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05070d' },
  content: { padding: 22, paddingTop: 56, paddingBottom: 120, gap: 12, maxWidth: 760, width: '100%', alignSelf: 'center' },
  title: { fontSize: 38, lineHeight: 43, fontWeight: '800', color: '#f8fafc', marginTop: 8 },
  description: { fontSize: 16, lineHeight: 24, maxWidth: 580, marginBottom: 18 },
  list: { gap: 10 },
  card: { minHeight: 88, borderRadius: 22, borderWidth: 1, borderColor: '#1d2738', backgroundColor: '#0b101b', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 },
  index: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#111a2b', alignItems: 'center', justifyContent: 'center' },
  indexText: { fontSize: 11, fontWeight: '800', color: '#93c5fd' },
  copy: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: '750', color: '#f8fafc' },
  arrow: { fontSize: 22, color: '#94a3b8' },
});
