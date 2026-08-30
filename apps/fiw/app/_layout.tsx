import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AndroidSoftInputModes, KeyboardController, KeyboardProvider } from 'react-native-keyboard-controller';
import * as SplashScreen from 'expo-splash-screen';
import BrandSplash from '@/components/BrandSplash';
import {
  useFonts,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';

SplashScreen.preventAutoHideAsync();

/**
 * Android : la fenêtre ne se redimensionne PLUS à l'ouverture du clavier.
 *
 * En `adjustResize` (le défaut), Android rétrécit la fenêtre dès que le clavier
 * monte. Deux choses bougent alors au lieu d'une : le système repositionne
 * instantanément tout ce qui est ancré en bas — la feuille modale, par exemple —
 * et par-dessus, notre propre décalage animé s'ajoute. Un saut, puis une
 * animation. C'est le shift qui subsistait sur Android.
 *
 * `adjustNothing` rend la main : le système ne touche à rien, et le seul
 * mouvement est celui qu'on anime, en synchro avec le clavier. C'est le mode
 * pour lequel `react-native-keyboard-controller` est fait.
 *
 * ⚠️ Contrepartie : plus aucun écran ne peut compter sur le système pour dégager
 * un champ. Tout écran à saisie doit porter son propre `KeyboardAvoidingView`
 * (ou vivre dans une feuille qui se décale). C'est ce qui a été complété le
 * 27 août 2026 sur les cinq écrans de formulaire qui n'avaient rien.
 *
 * Appelé sans branche `Platform` : la méthode existe aussi côté iOS, où elle ne
 * fait rien.
 */
KeyboardController.setInputMode(AndroidSoftInputModes.SOFT_INPUT_ADJUST_NOTHING);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
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
  // flash en police système puis le saut vers Outfit).
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Le clavier est piloté par `react-native-keyboard-controller` : c'est lui
          qui publie sa position image par image, ce que les événements
          `keyboardDidShow` de RN ne savent pas faire (ils ne se déclenchent
          qu'une fois le clavier posé, d'où le saut qu'on voyait).

          Les deux barres sont déclarées translucides parce que l'edge-to-edge est
          actif par défaut depuis le SDK 54 : l'app dessine derrière elles, donc
          leur hauteur ne doit pas être comptée deux fois dans la position du
          clavier. ⚠️ Si un décalage vertical valant exactement la barre de
          navigation apparaît sur Android, c'est ici qu'il faut regarder. */}
      <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
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
          <Stack.Screen name="livraison/searching" />
          <Stack.Screen name="livraison/suivi" />
          <Stack.Screen name="livraison/cloture" />
          <Stack.Screen name="history/index" />
          <Stack.Screen name="history/[id]" />
          <Stack.Screen name="affilie/presentation" />
          <Stack.Screen name="affilie/conditions" />
          <Stack.Screen name="affilie/dashboard" />
          <Stack.Screen name="affilie/reseau" />
          <Stack.Screen name="affilie/outils" />
          <Stack.Screen name="affilie/qr" />
          <Stack.Screen name="affilie/celebration" />
          <Stack.Screen name="affilie/retrait-methode" />
          <Stack.Screen name="affilie/retrait-recap" />
          <Stack.Screen name="affilie/retrait-numero" />
          <Stack.Screen name="affilie/retrait-traitement" />
          <Stack.Screen name="affilie/retrait-confirmation" />
          <Stack.Screen name="affilie/retrait-echec" />
          <Stack.Screen name="compte/index" />
          <Stack.Screen name="compte/profil" />
          <Stack.Screen name="compte/numero" />
          <Stack.Screen name="compte/paiement" />
          <Stack.Screen name="compte/lieux" />
          <Stack.Screen name="compte/lieu" />
          <Stack.Screen name="compte/securite" />
          <Stack.Screen name="compte/preferences" />
        </Stack>

        {!splashGone && (
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: splashOpacity }]}>
            <BrandSplash />
          </Animated.View>
        )}
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
