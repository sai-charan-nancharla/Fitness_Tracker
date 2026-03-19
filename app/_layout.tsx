import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppProvider, useAppContext } from '../src/store/AppContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootDrawer() {
  const { getCurrentStreak } = useAppContext();
  const streak = getCurrentStreak();

  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#0f0f0f' },
        headerTintColor: '#f0f0f0',
        drawerStyle: { backgroundColor: '#181818' },
        drawerActiveTintColor: '#0f0f0f',
        drawerActiveBackgroundColor: '#a8ff78',
        drawerInactiveTintColor: '#888',
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, backgroundColor: 'rgba(255,100,0,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, borderWidth: 1, borderColor: 'rgba(255,100,0,0.2)' }}>
            <Text style={{ fontSize: 12, marginRight: 4 }}>🔥</Text>
            <Text style={{ color: '#ff8c42', fontWeight: '800', fontSize: 13 }}>{streak}</Text>
          </View>
        )
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{ drawerLabel: 'Home', title: 'Macro Tracker', headerShown: true }}
      />
      <Drawer.Screen
        name="reminders"
        options={{ drawerLabel: 'Reminders', title: 'Reminders' }}
      />
      <Drawer.Screen
        name="routine"
        options={{ drawerLabel: 'Edit Routine', title: 'Routine Editor' }}
      />
      <Drawer.Screen
        name="modal"
        options={{ drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen
        name="+not-found"
        options={{ drawerItemStyle: { display: 'none' } }}
      />
    </Drawer>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
      <AppProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootDrawer />
          <StatusBar style="light" />
        </ThemeProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
