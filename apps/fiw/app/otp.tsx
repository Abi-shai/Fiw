import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import Button from '@/components/Button';

export default function OTPScreen() {
  const [code, setCode] = useState(['5', '3', '2', '1']);
  const [loading, setLoading] = useState(false);

  const verify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/home');
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Code de vérification</Text>
        <Text style={styles.subtitle}>
          Nous avons envoyé un code au{'\n'}
          <Text style={styles.phone}>+221 77 000 00 00</Text>
        </Text>

        <View style={styles.codeRow}>
          {code.map((digit, i) => (
            <View key={i} style={styles.codeBox}>
              <Text style={styles.codeDigit}>{digit}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.hint}>Code de démo pré-rempli</Text>

        <Button
          label="Vérifier"
          onPress={verify}
          loading={loading}
          style={styles.btn}
        />

        <TouchableOpacity style={styles.resend}>
          <Text style={styles.resendText}>Renvoyer le code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, paddingHorizontal: 24 },
  back: { paddingTop: 60, paddingBottom: 16 },
  backIcon: { fontSize: 24, color: Colors.black },
  content: { flex: 1, paddingTop: 24 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.black, marginBottom: 12 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 40 },
  phone: { fontWeight: '600', color: Colors.black },
  codeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  codeBox: {
    flex: 1,
    height: 64,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeDigit: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  hint: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: 32,
  },
  btn: {},
  resend: { marginTop: 20, alignItems: 'center' },
  resendText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});
