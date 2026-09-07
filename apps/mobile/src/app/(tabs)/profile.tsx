import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Surface, ActionRow } from '@/components/linkup-surface';
import { useAuth } from '@/features/auth/auth-context';

export default function ProfileScreen() {
  const { tokens, signOut } = useAuth();
  if (!tokens) return <View style={styles.center}><ThemedText style={styles.title}>Your profile</ThemedText><ThemedText themeColor="textSecondary">Sign in to manage your account.</ThemedText></View>;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.kicker}>PROFILE</ThemedText>
      <View style={styles.identity}>
        <View style={styles.avatar}><ThemedText style={styles.avatarText}>L</ThemedText></View>
        <View style={styles.identityCopy}><ThemedText style={styles.title}>Your LinkUp</ThemedText><ThemedText themeColor="textSecondary" numberOfLines={1}>{tokens.accessToken ? 'Account connected' : ''}</ThemedText></View>
      </View>
      <Surface>
        <ActionRow title="Account" detail="Email, password and security" onPress={() => router.push('/settings')} />
        <ActionRow title="Privacy" detail="Control what you share and who can reach you" onPress={() => router.push('/settings')} />
        <ActionRow title="Notifications" detail="Messages, mentions and activity" onPress={() => router.push('/notifications')} />
        <ActionRow title="AI preferences" detail="Commands, confirmations and assistant behavior" onPress={() => router.push('/settings')} />
      </Surface>
      <ActionRow title="Sign out" detail="End this session on this device" onPress={() => void signOut()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05070d' },
  center: { flex: 1, backgroundColor: '#05070d', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  content: { padding: 22, paddingTop: 56, paddingBottom: 120, gap: 16, maxWidth: 760, width: '100%', alignSelf: 'center' },
  kicker: { fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14, marginVertical: 8 },
  avatar: { width: 68, height: 68, borderRadius: 24, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#07101f', fontSize: 26, fontWeight: '900' },
  identityCopy: { flex: 1, gap: 3 },
  title: { color: '#f8fafc', fontSize: 30, lineHeight: 35, fontWeight: '800', letterSpacing: -0.7 },
});
