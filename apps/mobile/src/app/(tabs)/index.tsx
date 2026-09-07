import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth/auth-context';
import { homeContent } from '@/features/home/home-content';
import { onboardingCopy } from '@/features/onboarding/onboarding-copy';

function LinkUpMark({ small = false }: { small?: boolean }) {
  const size = small ? 48 : 76;

  return (
    <View style={[styles.mark, { width: size, height: size }]} accessibilityLabel="LinkUp">
      <View style={[styles.orbit, styles.orbitOne, small && styles.smallOrbit]} />
      <View style={[styles.orbit, styles.orbitTwo, small && styles.smallOrbit]} />
      <View style={[styles.markCore, small && styles.smallCore]} />
    </View>
  );
}

function LandingScreen() {
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
        <ThemedText type="small" themeColor="textSecondary">PRIVATE / HUMAN</ThemedText>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroGlow} />
        <LinkUpMark />
        <ThemedText style={styles.eyebrow}>{onboardingCopy.eyebrow.toUpperCase()}</ThemedText>
        <ThemedText style={styles.title}>{onboardingCopy.title}</ThemedText>
        <ThemedText style={styles.description}>{onboardingCopy.description}</ThemedText>
      </View>

      <View style={styles.signalGrid}>
        <SignalCard number="01" label="Private" detail="Your space, your control." />
        <SignalCard number="02" label="Human" detail="Built around real people." />
        <SignalCard number="03" label="Instant" detail="Fast when it matters." />
      </View>

      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel={onboardingCopy.primaryAction} onPress={() => router.push('/create-account')} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <ThemedText style={styles.primaryText}>{onboardingCopy.primaryAction}</ThemedText>
          <ThemedText style={styles.arrow}>↗</ThemedText>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={onboardingCopy.secondaryAction} onPress={() => router.push('/sign-in')} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <ThemedText style={styles.secondaryText}>{onboardingCopy.secondaryAction}</ThemedText>
        </Pressable>
      </View>

      <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>Your conversations belong to you.</ThemedText>
    </ScrollView>
  );
}

function SignalCard({ number, label, detail }: { number: string; label: string; detail: string }) {
  return (
    <View style={styles.signalCard}>
      <ThemedText style={styles.signalNumber}>{number}</ThemedText>
      <ThemedText style={styles.signalLabel}>{label}</ThemedText>
      <ThemedText themeColor="textSecondary" type="small">{detail}</ThemedText>
    </View>
  );
}

function ConversationRow({ title, preview, time, unread, accent }: { title: string; preview: string; time: string; unread?: number; accent: string }) {
  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [styles.conversation, pressed && styles.pressed]}>
      <View style={[styles.avatar, { borderColor: accent }]}>
        <ThemedText style={styles.avatarText}>{title.slice(0, 1)}</ThemedText>
      </View>
      <View style={styles.conversationCopy}>
        <View style={styles.conversationTop}>
          <ThemedText style={styles.conversationTitle}>{title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">{time}</ThemedText>
        </View>
        <View style={styles.conversationBottom}>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.preview}>{preview}</ThemedText>
          {unread ? <View style={styles.unread}><ThemedText style={styles.unreadText}>{unread}</ThemedText></View> : null}
        </View>
      </View>
    </Pressable>
  );
}

function SignedInHome() {
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.homeContent, { paddingTop: Math.max(insets.top, 22) }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.homeHeader}>
        <View>
          <ThemedText type="small" themeColor="textSecondary" style={styles.headerKicker}>LINKUP / HOME</ThemedText>
          <ThemedText style={styles.homeTitle}>{homeContent.greeting}</ThemedText>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Sign out" onPress={() => void signOut()} style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}>
          <LinkUpMark small />
        </Pressable>
      </View>

      <ThemedText themeColor="textSecondary" style={styles.homeSubtitle}>{homeContent.subtitle}</ThemedText>

      <Pressable accessibilityRole="button" accessibilityLabel={homeContent.aiPrompt} onPress={() => router.push('/explore')} style={({ pressed }) => [styles.aiCard, pressed && styles.pressed]}>
        <View style={styles.aiMark}><ThemedText style={styles.aiMarkText}>L</ThemedText></View>
        <View style={styles.aiCopy}>
          <ThemedText style={styles.aiTitle}>{homeContent.aiPrompt}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">Plan, write, calculate, find, or get something done.</ThemedText>
        </View>
        <ThemedText style={styles.aiArrow}>↗</ThemedText>
      </Pressable>

      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Recent</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">3 conversations</ThemedText>
      </View>

      <View style={styles.conversationList}>
        {homeContent.conversations.map((conversation) => (
          <ConversationRow key={conversation.title} {...conversation} />
        ))}
      </View>

      <View style={styles.quickGrid}>
        <View style={styles.quickCard}>
          <ThemedText style={styles.quickNumber}>01</ThemedText>
          <ThemedText style={styles.quickTitle}>Quiet by design</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">No noisy public feed on your home.</ThemedText>
        </View>
        <View style={styles.quickCard}>
          <ThemedText style={styles.quickNumber}>02</ThemedText>
          <ThemedText style={styles.quickTitle}>Made for you</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">Your space adapts as LinkUp grows.</ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

export default function HomeScreen() {
  const { tokens, hydrated } = useAuth();

  if (!hydrated) {
    return (
      <View style={styles.loadingScreen}>
        <LinkUpMark small />
        <ThemedText type="small" themeColor="textSecondary">Preparing LinkUp…</ThemedText>
      </View>
    );
  }

  return tokens ? <SignedInHome /> : <LandingScreen />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05070d' },
  loadingScreen: { flex: 1, backgroundColor: '#05070d', alignItems: 'center', justifyContent: 'center', gap: 14 },
  content: { paddingHorizontal: 20, paddingBottom: 36, gap: 18, maxWidth: 760, alignSelf: 'center', width: '100%' },
  homeContent: { paddingHorizontal: 20, paddingBottom: 110, gap: 18, maxWidth: 760, alignSelf: 'center', width: '100%' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#dbeafe' },
  brand: { fontSize: 13, fontWeight: '800', letterSpacing: 2.8, color: '#f8fafc' },
  hero: { minHeight: 430, borderRadius: 34, overflow: 'hidden', padding: 28, justifyContent: 'flex-end', backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#24304a' },
  heroGlow: { position: 'absolute', width: 230, height: 230, borderRadius: 115, backgroundColor: '#1d4ed8', opacity: 0.16, top: -80, right: -70 },
  mark: { marginBottom: 34, position: 'relative' },
  orbit: { position: 'absolute', width: 58, height: 58, borderWidth: 2, borderColor: '#dbeafe', borderRadius: 999 },
  orbitOne: { left: 0, top: 9, transform: [{ rotate: '-24deg' }] },
  orbitTwo: { left: 18, top: 9, transform: [{ rotate: '24deg' }] },
  smallOrbit: { width: 37, height: 37, top: 5 },
  markCore: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff', position: 'absolute', left: 32, top: 33 },
  smallCore: { width: 7, height: 7, borderRadius: 4, left: 20, top: 21 },
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
  homeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerKicker: { fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  homeTitle: { fontSize: 30, lineHeight: 35, fontWeight: '800', letterSpacing: -0.7, color: '#f8fafc', marginTop: 5, maxWidth: 500 },
  homeSubtitle: { fontSize: 15, lineHeight: 23, maxWidth: 560 },
  profileButton: { width: 52, height: 52, borderRadius: 18, borderWidth: 1, borderColor: '#263246', backgroundColor: '#0b101b', alignItems: 'center', justifyContent: 'center' },
  aiCard: { minHeight: 92, borderRadius: 24, borderWidth: 1, borderColor: '#29456f', backgroundColor: '#0b1424', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13 },
  aiMark: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  aiMarkText: { color: '#07101f', fontSize: 19, fontWeight: '900' },
  aiCopy: { flex: 1, gap: 4 },
  aiTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '800' },
  aiArrow: { color: '#93c5fd', fontSize: 22 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 },
  sectionTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '800' },
  conversationList: { borderRadius: 24, borderWidth: 1, borderColor: '#1d2738', backgroundColor: '#090e18', overflow: 'hidden' },
  conversation: { minHeight: 82, paddingHorizontal: 15, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 13, borderBottomWidth: 1, borderBottomColor: '#151d2b' },
  avatar: { width: 48, height: 48, borderRadius: 17, borderWidth: 2, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#f8fafc', fontSize: 17, fontWeight: '800' },
  conversationCopy: { flex: 1, gap: 5 },
  conversationTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  conversationBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  conversationTitle: { color: '#f8fafc', fontSize: 15, fontWeight: '750' },
  preview: { flex: 1 },
  unread: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  unreadText: { color: '#0b1220', fontSize: 10, fontWeight: '900' },
  quickGrid: { flexDirection: 'row', gap: 10 },
  quickCard: { flex: 1, minHeight: 122, padding: 16, borderRadius: 22, borderWidth: 1, borderColor: '#1d2738', backgroundColor: '#0b101b' },
  quickNumber: { color: '#64748b', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  quickTitle: { color: '#f8fafc', fontSize: 15, fontWeight: '750', marginTop: 22, marginBottom: 6 },
});
