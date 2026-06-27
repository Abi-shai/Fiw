import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

// Stub Expo Go — react-native-webview non disponible dans Expo Go.
// Remplacer par l'implémentation WebView complète pour un Development Build.
interface Props {
  style?: ViewStyle;
  [key: string]: unknown;
}

export default function LeafletMap({ style }: Props) {
  return (
    <View style={[styles.placeholder, style]}>
      <Text style={styles.label}>Carte (Development Build uniquement)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
});
