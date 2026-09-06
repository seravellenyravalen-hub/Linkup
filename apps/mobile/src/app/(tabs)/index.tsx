import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { onboardingCopy } from '@/features/onboarding/onboarding-copy';

function LinkUpMark() {
  return (
    <View style={styles.mark} accessibilityLabel="LinkUp">
      <View style={[styles.orbit, styles.orbitOne]} />
      <View style={[styles.orbit, styles.orbitTwo]} />
      <View style={styles.markCore} />
    </View>
  );
}

function SignalCard({ number, label, detail }: { number: string; label: string; detail: string }) {
  return (
    <View style={styles.signalCard}>
      <ThemedText style={styles.signalNumber}>{number}</ThemedText>
      <ThemedText style={styles.signalLabel}>{label}</ThemedText>
      <ThemedText themeColor="textSecondary" type="small">
        {detail}
      </ThemedText>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 18) }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <ThemedText style={styles.brand}>LINKUP</ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">01 / 04</ThemedText>
      </View>

      <LinearGradient
        colors={['#172554', '#0b1120', '#05070d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}>
        <View style={styles.heroGlow} />
        <LinkUpMark />
        <ThemedText style={styles.eyebrow}>{onboardingCopy.eyebrow.toUpperCase()}</ThemedText>
        <ThemedText style={styles.title}>{onboardingCopy.title}</ThemedText>
        <ThemedText style={styles.description}>{onboardingCopy.description}</ThemedText>
      </LinearGradient>

      <View style={styles.signalGrid}>
        <SignalCard number="01" label="Private" detail="Your space, your control." />
        <SignalCard number="02" label="Human" detail="Built around real people." />
        <SignalCard number="03" label="Instant" detail="Fast when it matters." />
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={onboardingCopy.primaryAction}
          onPress={() => router.push('/create-account')}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <ThemedText style={styles.primaryText}>{onboardingCopy.primaryAction}</ThemedText>
          <ThemedText style={styles.arrow}>↗</ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={onboardingCopy.secondaryAction}
          onPress={() => router.push('/sign-in')}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <ThemedText style={styles.secondaryText}>{onboardingCopy.secondaryAction}</ThemedText>
        </Pressable>
      </View>

      <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
        Your conversations belong to you.
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05070d' },
  content: { paddingHorizontal: 20, paddingBottom: 36, gap: 18, maxWidth: 760, alignSelf: 'center', width: '100%' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#dbeafe' },
  brand: { fontSize: 13, fontWeight: '800', letterSpacing: 2.8, color: '#f8fafc' },
  hero: { minHeight: 430, borderRadius: 34, overflow: 'hidden', padding: 28, justifyContent: 'flex-end', borderWidth: 1, borderColor: '#24304a' },
  heroGlow: { position: 'absolute', width: 230, height: 230, borderRadius: 115, backgroundColor: '#1d4ed8', opacity: 0.16, top: -80, right: -70 },
  mark: { width: 76, height: 76, marginBottom: 34, position: 'relative' },
  orbit: { position: 'absolute', borderWidth: 2, borderColor: '#dbeafe', borderRadius: 999 },
  orbitOne: { width: 58, height: 58, left: 0, top: 9, transform: [{ rotate: '-24deg' }] },
  orbitTwo: { width: 58, height: 58, left: 18, top: 9, transform: [{ rotate: '24deg' }] },
  markCore: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff', position: 'absolute', left: 32, top: 33 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 2.2, color: '#93c5fd', marginBottom: 12 },
  title: { fontSize: 43, lineHeight: 47, fontWeight: '800', letterSpacing: -1.5, color: '#fff', maxWidth: 520 },
  description: { fontSize: 16, lineHeight: 25, color: '#cbd5e1', maxWidth: 510, marginTop: 16 },
  signalGrid: { flexDirection: 'row', gap: 10 },
  signalCard: { flex: 1, minHeight: 112, padding: 16, borderRadius: 22, backgroundColor: '#0b101b', borderWidth: 1, borderColor: '#1d2738' },
  signalNumber: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: '#64748b' },
  signalLabel: { fontSize: 17, fontWeight: '750', color: '#f8fafc', marginTop: 18, marginBottom: 5 },
  actions: { gap: 10, marginTop: 4 },
  primaryButton: { minHeight: 58, borderRadius: 18, backgroundColor: '#f8fafc', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  primaryText: { color: '#05070d', fontSize: 16, fontWeight: '800' },
  arrow: { color: '#05070d', fontSize: 23 },
  secondaryButton: { minHeight: 54, borderRadius: 18, borderWidth: 1, borderColor: '#263246', alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#e2e8f0', fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  footer: { textAlign: 'center', marginTop: 2 },
});
