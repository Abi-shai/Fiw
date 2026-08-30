import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, TextInput, TouchableOpacity
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/tokens';
import Button from '@/components/Button';
import Text from '@/components/Text';
import IconButton from '@/components/IconButton';
import CodeField from '@/components/CodeField';

export default function OTPScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

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
          <Text variant="bodySemibold">+221 77 000 00 00</Text>
        </Text>

        <TouchableOpacity
          style={styles.codeRow}
          onPress={() => inputRef.current?.focus()}
          activeOpacity={1}
        >
          <CodeField code={code} />
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

        <Button label="Renvoyer le code" variant="link" size="sm" onPress={() => {}} style={styles.resend} />
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
  codeRow: { marginBottom: 40 },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  btn: {},
  resend: { alignSelf: 'center', marginTop: 20 },
});
