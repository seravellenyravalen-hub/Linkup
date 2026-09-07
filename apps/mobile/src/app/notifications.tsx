import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Surface, ActionRow } from '@/components/linkup-surface';

const alerts = [
  ['Amina sent you a message', '2 unread messages · 11:42'],
  ['The Core Team mentioned you', 'New direction feels right · 10:18'],
  ['Your account is protected', 'Security check completed · Today'],
];

export default function NotificationsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.top}><ThemedText type="small" themeColor="textSecondary" style={styles.kicker}>ACTIVITY</ThemedText><ThemedText style={styles.clear}>Mark all read</ThemedText></View>
      <ThemedText style={styles.title}>Notifications.</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.description}>Only useful signals. No engagement traps.</ThemedText>
      <Surface>{alerts.map(([title, detail]) => <ActionRow key={title} title={title} detail={detail} />)}</Surface>
      <View style={styles.empty}><ThemedText style={styles.emptyTitle}>That’s the signal.</ThemedText><ThemedText type="small" themeColor="textSecondary">LinkUp keeps the rest quiet.</ThemedText></View>
      <ThemedText type="small" themeColor="textSecondary" onPress={() => router.back()} style={styles.back}>‹ Back</ThemedText>
    </ScrollView>
  );
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#05070d'},content:{padding:22,paddingTop:56,paddingBottom:100,gap:14,maxWidth:760,width:'100%',alignSelf:'center'},top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},kicker:{fontSize:10,fontWeight:'800',letterSpacing:2},clear:{color:'#93c5fd',fontSize:12,fontWeight:'700'},title:{color:'#f8fafc',fontSize:38,lineHeight:43,fontWeight:'800',letterSpacing:-.8,marginTop:4},description:{fontSize:15,lineHeight:23},empty:{padding:20,borderRadius:22,borderWidth:1,borderColor:'#1d2738',backgroundColor:'#0b101b',gap:5},emptyTitle:{color:'#f8fafc',fontSize:15,fontWeight:'750'},back:{marginTop:6,color:'#93c5fd',fontWeight:'700'}});
