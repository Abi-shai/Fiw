import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, TextInput, TouchableOpacity
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Radii, Poppins } from '@/constants/tokens';
import Button from '@/components/Button';
import Text from '@/components/Text';
import IconButton from '@/components/IconButton';

export default function OTPScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const digits = code.split('').concat(Array(Math.max(0, 4 - code.length)).fill(''));

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
    setCode(cleaned);
    if (cleaned.length === 4) verify(cleaned);
  };

  const verify = (finalCode?: string) => {
    if ((finalCode ?? code).length < 4) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/home');
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <IconButton name="back" variant="flat" color={Colors.textPrimary} style={styles.back} onPress={() => router.back()} />

      <View style={styles.content}>
        <Text variant="display" style={styles.title}>Code de vérification</Text>
        <Text variant="body" color={Colors.textSecondary} style={styles.subtitle}>
          Nous avons envoyé un code au{'\n'}
          <Text variant="body" style={styles.phone}>+221 77 000 00 00</Text>
        </Text>

        <TouchableOpacity
          style={styles.codeRow}
          onPress={() => inputRef.current?.focus()}
          activeOpacity={1}
        >
          {digits.map((digit, i) => (
            <View
              key={i}
              style={[
                styles.codeBox,
                code.length === i && styles.codeBoxCursor,
                digit !== '' && styles.codeBoxFilled,
              ]}
            >
              <Text color={Colors.primary} style={styles.codeDigit}>{digit}</Text>
            </View>
          ))}
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={4}
          style={styles.hiddenInput}
          autoFocus
        />

        <Button
          label="Vérifier"
          onPress={() => verify()}
          loading={loading}
          disabled={code.length < 4}
          style={styles.btn}
        />

        <TouchableOpacity style={styles.resend}>
          <Text variant="label" color={Colors.primary}>Renvoyer le code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface, paddingHorizontal: 24 },
  back: { marginTop: 60, marginBottom: 16 },
  content: { flex: 1, paddingTop: 24 },
  title: { marginBottom: 12 },
  subtitle: { lineHeight: 22, marginBottom: 40 },
  phone: { fontFamily: Poppins.semibold },
  codeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  codeBox: {
    flex: 1,
    height: 64,
    borderRadius: Radii.md,
    backgroundColor: Colors.bg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeBoxCursor: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySubtle,
  },
  codeBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySubtle,
  },
  codeDigit: {
    fontFamily: Poppins.bold,
    fontSize: 28,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  btn: {},
  resend: { marginTop: 20, alignItems: 'center' },
});
