import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Surface, ActionRow } from '@/components/linkup-surface';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}><ThemedText style={styles.back}>‹  Back</ThemedText></Pressable>
      <ThemedText type="small" themeColor="textSecondary" style={styles.kicker}>SETTINGS</ThemedText>
      <ThemedText style={styles.title}>Control your space.</ThemedText>
      <Surface>
        <ActionRow title="Privacy & safety" detail="Who can find, message or interact with you" />
        <ActionRow title="Notifications" detail="Choose what deserves your attention" onPress={() => router.push('/notifications')} />
        <ActionRow title="AI confirmations" detail="Require approval before external or message actions" badge="ON" />
        <ActionRow title="Appearance" detail="Theme, motion and display preferences" />
        <ActionRow title="Data & storage" detail="Media, cache and local data controls" />
      </Surface>
      <View style={styles.version}><ThemedText type="small" themeColor="textSecondary">LINKUP · 1.0.0</ThemedText><ThemedText type="small" themeColor="textSecondary">Private by design</ThemedText></View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({ screen:{flex:1,backgroundColor:'#05070d'}, content:{padding:22,paddingTop:56,paddingBottom:100,gap:14,maxWidth:760,width:'100%',alignSelf:'center'}, back:{color:'#93c5fd',fontSize:15,fontWeight:'700',marginBottom:10}, kicker:{fontSize:10,fontWeight:'800',letterSpacing:2}, title:{color:'#f8fafc',fontSize:36,lineHeight:41,fontWeight:'800',letterSpacing:-.8,marginBottom:8}, version:{paddingTop:18,flexDirection:'row',justifyContent:'space-between'} });
