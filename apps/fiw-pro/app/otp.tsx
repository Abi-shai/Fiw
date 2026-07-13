import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Poppins } from '@/constants/tokens';
import Text from '@/components/Text';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';

export default function OTPScreen() {
  const [code] = useState(['5', '3', '2', '1']);
  const [loading, setLoading] = useState(false);

  const verify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/dashboard');
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <IconButton name="back" onPress={() => router.back()} variant="flat" style={styles.back} />

      <View style={styles.content}>
        <Text variant="display" style={{ marginBottom: Spacing[3] }}>Code de vérification</Text>
        <Text variant="body" color={Colors.textSecondary} style={{ lineHeight: 24, marginBottom: 40 }}>
          Nous avons envoyé un code au{'\n'}
          <Text variant="body" style={{ fontFamily: Poppins.semibold }}>+221 77 000 00 00</Text>
        </Text>

        <View style={styles.codeRow}>
          {code.map((digit, i) => (
            <View key={i} style={styles.codeBox}>
              <Text style={{ fontFamily: Poppins.bold, fontSize: 28, color: Colors.primary }}>
                {digit}
              </Text>
            </View>
          ))}
        </View>

        <Text variant="caption" color={Colors.textTertiary} align="center" style={{ marginBottom: Spacing[8] }}>
          Code de démo pré-rempli
        </Text>

        <Button label="Vérifier" onPress={verify} loading={loading} />

        <TouchableOpacity style={styles.resend} onPress={() => {}}>
          <Text variant="label" color={Colors.primary}>Renvoyer le code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface, paddingHorizontal: Spacing[6] },
  back: { marginTop: 60, marginBottom: Spacing[4] },
  content: { flex: 1, paddingTop: Spacing[6] },
  codeRow: { flexDirection: 'row', gap: Spacing[3], marginBottom: Spacing[4] },
  codeBox: {
    flex: 1,
    height: 64,
    borderRadius: Radii.md,
    backgroundColor: Colors.primarySubtle,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resend: { marginTop: Spacing[6], alignItems: 'center' },
});
