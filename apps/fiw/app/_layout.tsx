import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import BrandSplash from '@/components/BrandSplash';
import {
  useFonts,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Écran de chargement de marque : reste affiché tant que l'app n'est pas
  // prête, puis se retire en fondu.
  const [splashGone, setSplashGone] = useState(false);
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync(); // masque le splash natif → on prend le relais en JS
      const t = setTimeout(() => {
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }).start(() => setSplashGone(true));
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [fontsLoaded, fontError]);

  // Garde l'écran de démarrage tant que la police n'est pas prête (évite le
  // flash en police système puis le saut vers Poppins).
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          // Geste de retour interactif (swipe bord gauche → droite), façon iOS natif.
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="home" />
        <Stack.Screen name="transport/configure" />
        <Stack.Screen name="transport/searching" />
        <Stack.Screen name="transport/course-active" />
        <Stack.Screen name="transport/cloture" />
        <Stack.Screen name="transport/call" />
        <Stack.Screen name="transport/chat" />
        <Stack.Screen name="livraison/configure" />
        <Stack.Screen name="livraison/options" />
        <Stack.Screen name="livraison/searching" />
        <Stack.Screen name="livraison/suivi" />
        <Stack.Screen name="livraison/cloture" />
        <Stack.Screen name="history/index" />
        <Stack.Screen name="history/[id]" />
      </Stack>

      {!splashGone && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: splashOpacity }]}>
          <BrandSplash />
        </Animated.View>
      )}
    </GestureHandlerRootView>
  );
}
