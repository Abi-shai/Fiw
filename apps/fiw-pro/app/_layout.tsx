import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', gestureEnabled: true }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="choix-compte" />
        <Stack.Screen name="(partenaire)" />
        <Stack.Screen name="commander/nouveau" />
        <Stack.Screen name="commander/confirmation" />
        <Stack.Screen name="commander/recherche" />
        <Stack.Screen name="commander/en-cours" />
        <Stack.Screen name="wallet/recapitulatif" />
        <Stack.Screen name="wallet/succes" />
        <Stack.Screen name="qrcode" />
        {/* Flow Prestataire */}
        <Stack.Screen name="otp" />
        <Stack.Screen name="accueil" />
        <Stack.Screen name="menu" />
        <Stack.Screen name="wallet/index" />
        <Stack.Screen name="gains" />
        <Stack.Screen name="statut" />
        <Stack.Screen name="bloque" />
        <Stack.Screen name="activation/index" />
        <Stack.Screen name="activation/services" />
        <Stack.Screen name="activation/piece" />
        <Stack.Screen name="mission/appel" />
        <Stack.Screen name="mission/chat" />
        <Stack.Screen name="mission/navigating" />
        <Stack.Screen name="mission/arrived" />
        <Stack.Screen name="mission/in-progress" />
        <Stack.Screen name="mission/complete" />
      </Stack>
    </GestureHandlerRootView>
  );
}
