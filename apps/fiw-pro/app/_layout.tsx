import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="mission/navigating" />
        <Stack.Screen name="mission/arrived" />
        <Stack.Screen name="mission/in-progress" />
        <Stack.Screen name="mission/complete" />
      </Stack>
    </GestureHandlerRootView>
  );
}
