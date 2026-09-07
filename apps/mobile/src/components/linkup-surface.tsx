import { Pressable, StyleSheet, TextInput, View, type PressableProps, type TextInputProps } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export function Surface({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.surface, style]}>{children}</View>;
}

export function ActionRow({ title, detail, onPress, badge }: { title: string; detail?: string; onPress?: PressableProps['onPress']; badge?: string }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.rowCopy}>
        <ThemedText style={styles.rowTitle}>{title}</ThemedText>
        {detail ? <ThemedText type="small" themeColor="textSecondary">{detail}</ThemedText> : null}
      </View>
      {badge ? <View style={styles.badge}><ThemedText style={styles.badgeText}>{badge}</ThemedText></View> : <ThemedText style={styles.chevron}>›</ThemedText>}
    </Pressable>
  );
}

export function Composer({ value, onChangeText, placeholder, onSubmit, multiline = false }: TextInputProps & { onSubmit?: () => void }) {
  return (
    <View style={styles.composer}>
      <TextInput
        {...{ value, onChangeText, placeholder, multiline }}
        placeholderTextColor="#64748b"
        onSubmitEditing={onSubmit}
        style={styles.input}
        selectionColor="#dbeafe"
      />
      <Pressable accessibilityRole="button" accessibilityLabel="Send" onPress={onSubmit} style={({ pressed }) => [styles.send, pressed && styles.pressed]}>
        <ThemedText style={styles.sendText}>↗</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: { backgroundColor: '#090e18', borderWidth: 1, borderColor: '#1d2738', borderRadius: 24, overflow: 'hidden' },
  row: { minHeight: 74, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#151d2b' },
  rowCopy: { flex: 1, gap: 4 },
  rowTitle: { color: '#f8fafc', fontSize: 15, fontWeight: '750' },
  chevron: { color: '#64748b', fontSize: 25 },
  badge: { minWidth: 28, height: 24, borderRadius: 12, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  badgeText: { color: '#0b1220', fontSize: 10, fontWeight: '900' },
  composer: { minHeight: 58, borderRadius: 20, borderWidth: 1, borderColor: '#263246', backgroundColor: '#0b101b', paddingLeft: 16, paddingRight: 7, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, color: '#f8fafc', fontSize: 15, paddingVertical: 12, maxHeight: 120 },
  send: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#05070d', fontSize: 20, fontWeight: '900' },
  pressed: { opacity: 0.7 },
});
