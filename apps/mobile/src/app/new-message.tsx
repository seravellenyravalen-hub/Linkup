import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Composer, Surface, ActionRow } from '@/components/linkup-surface';

const people = [
  ['Amina', 'Available now'],
  ['David', 'Active 8m ago'],
  ['Maya', 'Active today'],
];

export default function NewMessageScreen() {
  const [query, setQuery] = useState('');
  const filtered = people.filter(([name]) => name.toLowerCase().includes(query.toLowerCase()));
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ThemedText type="small" themeColor="textSecondary" onPress={() => router.back()} style={styles.back}>‹ Back</ThemedText>
      <ThemedText style={styles.title}>New conversation.</ThemedText>
      <ThemedText themeColor="textSecondary">Choose a person. Group conversations can be added without changing this flow.</ThemedText>
      <Composer value={query} onChangeText={setQuery} placeholder="Search people…" />
      <Surface>{filtered.map(([name, detail]) => <ActionRow key={name} title={name} detail={detail} onPress={() => router.push(`/chat/${name.toLowerCase()}`)} />)}</Surface>
      {filtered.length === 0 ? <View style={styles.empty}><ThemedText style={styles.emptyTitle}>No match yet</ThemedText><ThemedText type="small" themeColor="textSecondary">Try another name.</ThemedText></View> : null}
    </ScrollView>
  );
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#05070d'},content:{padding:22,paddingTop:56,paddingBottom:100,gap:14,maxWidth:760,width:'100%',alignSelf:'center'},back:{color:'#93c5fd',fontWeight:'700'},title:{color:'#f8fafc',fontSize:36,lineHeight:41,fontWeight:'800',letterSpacing:-.8},empty:{padding:20,borderRadius:22,backgroundColor:'#0b101b',borderWidth:1,borderColor:'#1d2738',gap:4},emptyTitle:{color:'#f8fafc',fontSize:15,fontWeight:'750'}});
