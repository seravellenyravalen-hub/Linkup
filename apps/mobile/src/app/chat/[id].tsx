import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Composer } from '@/components/linkup-surface';

const people: Record<string, string> = { amina: 'Amina', 'core-team': 'The Core Team', david: 'David', maya: 'Maya' };

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const name = people[id ?? ''] ?? 'Conversation';
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([
    { from: 'them', text: 'Hey — are we still on for today?' },
    { from: 'me', text: 'Yes. I’ll keep you posted.' },
  ]);
  const send = () => { const value = draft.trim(); if (!value) return; setMessages((current) => [...current, { from: 'me', text: value }]); setDraft(''); };
  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}><View><ThemedText type="small" themeColor="textSecondary">CONVERSATION</ThemedText><ThemedText style={styles.name}>{name}</ThemedText></View><View style={styles.presence}><View style={styles.dot} /><ThemedText type="small" themeColor="textSecondary">Available</ThemedText></View></View>
      <ScrollView contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>{messages.map((message, index) => <View key={`${message.text}-${index}`} style={[styles.bubble, message.from === 'me' ? styles.mine : styles.theirs]}><ThemedText style={message.from === 'me' ? styles.mineText : styles.theirText}>{message.text}</ThemedText></View>)}</ScrollView>
      <View style={styles.composer}><Composer value={draft} onChangeText={setDraft} placeholder={`Message ${name}…`} onSubmit={send} /></View>
      <ThemedText type="small" themeColor="textSecondary" onPress={() => router.back()} style={styles.back}>‹ Back to messages</ThemedText>
    </KeyboardAvoidingView>
  );
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#05070d'},header:{paddingHorizontal:20,paddingTop:56,paddingBottom:16,flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderBottomWidth:1,borderBottomColor:'#151d2b'},name:{color:'#f8fafc',fontSize:22,fontWeight:'800',marginTop:4},presence:{flexDirection:'row',gap:7,alignItems:'center'},dot:{width:7,height:7,borderRadius:4,backgroundColor:'#a7f3d0'},messages:{padding:20,gap:10,flexGrow:1,justifyContent:'flex-end'},bubble:{maxWidth:'82%',paddingHorizontal:15,paddingVertical:11,borderRadius:19},mine:{alignSelf:'flex-end',backgroundColor:'#dbeafe',borderBottomRightRadius:5},theirs:{alignSelf:'flex-start',backgroundColor:'#0b101b',borderWidth:1,borderColor:'#1d2738',borderBottomLeftRadius:5},mineText:{color:'#07101f',fontSize:15,lineHeight:22},theirText:{color:'#f8fafc',fontSize:15,lineHeight:22},composer:{paddingHorizontal:16,paddingTop:8},back:{paddingHorizontal:20,paddingBottom:14,paddingTop:7,color:'#93c5fd',fontWeight:'700'}});
