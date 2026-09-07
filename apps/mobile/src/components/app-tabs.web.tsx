import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { Pressable, View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return <Tabs><TabSlot style={{ height: '100%' }} /><TabList asChild><CustomTabList>
    <TabTrigger name="home" href="/" asChild><TabButton>Home</TabButton></TabTrigger>
    <TabTrigger name="messages" href="/messages" asChild><TabButton>Messages</TabButton></TabTrigger>
    <TabTrigger name="assistant" href="/assistant" asChild><TabButton>AI</TabButton></TabTrigger>
    <TabTrigger name="explore" href="/explore" asChild><TabButton>Discover</TabButton></TabTrigger>
    <TabTrigger name="profile" href="/profile" asChild><TabButton>Profile</TabButton></TabTrigger>
  </CustomTabList></TabList></Tabs>;
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return <Pressable {...props} style={({ pressed }) => [pressed && styles.pressed]}><ThemedView type={isFocused ? 'backgroundSelected' : 'backgroundElement'} style={styles.tabButtonView}><ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>{children}</ThemedText></ThemedView></Pressable>;
}
export function CustomTabList(props: TabListProps) {
  return <View {...props} style={styles.tabListContainer}><ThemedView type="backgroundElement" style={styles.innerContainer}><ThemedText type="smallBold" style={styles.brandText}>LINKUP</ThemedText>{props.children}<ThemedText type="small" themeColor="textSecondary" style={styles.footerText}>Private by design</ThemedText></ThemedView></View>;
}
const styles=StyleSheet.create({tabListContainer:{position:'absolute',width:'100%',padding:Spacing.three,justifyContent:'center',alignItems:'center',flexDirection:'row'},innerContainer:{paddingVertical:Spacing.two,paddingHorizontal:Spacing.five,borderRadius:Spacing.five,flexDirection:'row',alignItems:'center',flexGrow:1,gap:Spacing.two,maxWidth:MaxContentWidth},brandText:{marginRight:'auto',letterSpacing:2},footerText:{marginLeft:'auto'},pressed:{opacity:.7},tabButtonView:{paddingVertical:Spacing.one,paddingHorizontal:Spacing.three,borderRadius:Spacing.three}});
