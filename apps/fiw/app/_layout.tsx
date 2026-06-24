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
        <Stack.Screen name="home" />
        <Stack.Screen name="transport/destination" />
        <Stack.Screen name="transport/select-type" />
        <Stack.Screen name="transport/rapprochement" />
        <Stack.Screen name="transport/searching" />
        <Stack.Screen name="transport/driver-found" />
        <Stack.Screen name="transport/active-ride" />
        <Stack.Screen name="transport/receipt" />
        <Stack.Screen name="transport/rating" />
      </Stack>
    </GestureHandlerRootView>
  );
}
