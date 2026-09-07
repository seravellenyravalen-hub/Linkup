import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Surface, ActionRow } from '@/components/linkup-surface';

const conversations = [
  { id: 'amina', title: 'Amina', detail: 'I’ll send the details tonight.', time: '11:42', badge: '2' },
  { id: 'core-team', title: 'The Core Team', detail: 'The new direction feels right.', time: '10:18' },
  { id: 'david', title: 'David', detail: 'Perfect. See you soon.', time: 'Yesterday' },
  { id: 'maya', title: 'Maya', detail: 'Voice note · 0:18', time: 'Mon' },
];

export default function MessagesScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View><ThemedText type="small" themeColor="textSecondary" style={styles.kicker}>MESSAGES</ThemedText><ThemedText style={styles.title}>Your conversations.</ThemedText></View>
        <Pressable accessibilityRole="button" onPress={() => router.push('/new-message')} style={styles.newButton}><ThemedText style={styles.newText}>＋</ThemedText></Pressable>
      </View>
      <ThemedText themeColor="textSecondary" style={styles.description}>Private conversations, organized around people rather than noise.</ThemedText>
      <Surface>{conversations.map((item) => <ActionRow key={item.id} title={item.title} detail={item.detail} badge={item.badge} onPress={() => router.push(`/chat/${item.id}`)} />)}</Surface>
      <View style={styles.note}><ThemedText style={styles.noteTitle}>Start something new</ThemedText><ThemedText type="small" themeColor="textSecondary">Search for a person or create a private group from the new-message flow.</ThemedText></View>
    </ScrollView>
  );
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#05070d'},content:{padding:22,paddingTop:56,paddingBottom:120,gap:14,maxWidth:760,width:'100%',alignSelf:'center'},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},kicker:{fontSize:10,fontWeight:'800',letterSpacing:2},title:{color:'#f8fafc',fontSize:34,lineHeight:39,fontWeight:'800',letterSpacing:-.8,marginTop:6},description:{fontSize:15,lineHeight:23,maxWidth:580,marginBottom:6},newButton:{width:48,height:48,borderRadius:17,backgroundColor:'#dbeafe',alignItems:'center',justifyContent:'center'},newText:{color:'#07101f',fontSize:26,fontWeight:'700'},note:{padding:18,borderRadius:22,backgroundColor:'#0b101b',borderWidth:1,borderColor:'#1d2738',gap:6},noteTitle:{color:'#f8fafc',fontSize:15,fontWeight:'750'}});
