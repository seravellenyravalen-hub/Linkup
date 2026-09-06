import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth/auth-context';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }

    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in right now.');
    }
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 28) }]} keyboardShouldPersistTaps="handled">
      <Pressable onPress={() => router.back()} style={styles.back}><ThemedText style={styles.backText}>← Back</ThemedText></Pressable>
      <View style={styles.mark}><View style={styles.markCore} /></View>
      <ThemedText type="small" themeColor="textSecondary">WELCOME BACK</ThemedText>
      <ThemedText style={styles.title}>Good to see you.</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.description}>Sign in to return to your conversations and your people.</ThemedText>

      <View style={styles.form}>
        <TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="Email address" placeholderTextColor="#64748b" value={email} onChangeText={setEmail} style={styles.input} editable={!loading} />
        <TextInput autoComplete="password" placeholder="Password" placeholderTextColor="#64748b" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} editable={!loading} />
        {!!error && <ThemedText style={styles.error}>{error}</ThemedText>}
        <Pressable style={({ pressed }) => [styles.primary, pressed && styles.pressed, loading && styles.disabled]} onPress={submit} disabled={loading}>
          <ThemedText style={styles.primaryText}>{loading ? 'Signing in…' : 'Sign in'}</ThemedText>
          <ThemedText style={styles.arrow}>↗</ThemedText>
        </Pressable>
      </View>

      <Pressable onPress={() => router.push('/create-account')}><ThemedText style={styles.switchText}>New to LinkUp? <ThemedText style={styles.switchStrong}>Create an account</ThemedText></ThemedText></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05070d' },
  content: { paddingHorizontal: 22, paddingBottom: 44, gap: 12, maxWidth: 620, width: '100%', alignSelf: 'center' },
  back: { alignSelf: 'flex-start', paddingVertical: 10 },
  backText: { color: '#94a3b8', fontSize: 14, fontWeight: '700' },
  mark: { width: 54, height: 54, borderRadius: 18, backgroundColor: '#111a2b', borderWidth: 1, borderColor: '#293a58', marginTop: 34, marginBottom: 20, alignItems: 'center', justifyContent: 'center' },
  markCore: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#dbeafe' },
  title: { fontSize: 42, lineHeight: 46, fontWeight: '800', color: '#f8fafc', marginTop: 4 },
  description: { fontSize: 16, lineHeight: 24, marginBottom: 18 },
  form: { gap: 10 },
  input: { minHeight: 58, borderRadius: 17, borderWidth: 1, borderColor: '#263246', backgroundColor: '#0b101b', paddingHorizontal: 17, color: '#f8fafc', fontSize: 16 },
  error: { color: '#fca5a5', fontSize: 14, lineHeight: 20, paddingHorizontal: 4 },
  primary: { minHeight: 58, borderRadius: 17, backgroundColor: '#f8fafc', paddingHorizontal: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  primaryText: { color: '#05070d', fontSize: 16, fontWeight: '800' },
  arrow: { color: '#05070d', fontSize: 22 },
  switchText: { textAlign: 'center', color: '#94a3b8', marginTop: 16 },
  switchStrong: { color: '#e2e8f0', fontWeight: '800' },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.55 },
});
