import React, { useRef, useState } from 'react';
import {
  View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors, Radii, Poppins } from '@/constants/tokens';
import ScreenHeader from '@/components/ScreenHeader';
import Text from '@/components/Text';
import IconButton from '@/components/IconButton';

type Msg = { id: string; from: 'me' | 'driver'; text: string };

const INITIAL: Msg[] = [
  { id: 'm1', from: 'driver', text: 'Bonjour, je suis en route vers vous.' },
  { id: 'm2', from: 'me', text: "D'accord, merci beaucoup." },
  { id: 'm3', from: 'driver', text: 'Je serai là dans quelques minutes.' },
];

const REPLY = 'Bien reçu, à tout de suite.';

/** Chat in-app mocké (retour léger mais réel) : messages pré-remplis + réponse
 *  simulée du prestataire à l'envoi. Aucun back-end. */
export default function ChatScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [messages, setMessages] = useState<Msg[]>(INITIAL);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const counter = useRef(INITIAL.length);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    counter.current += 1;
    setMessages((prev) => [...prev, { id: `m${counter.current}`, from: 'me', text }]);
    setDraft('');
    setTimeout(() => {
      counter.current += 1;
      setMessages((prev) => [...prev, { id: `m${counter.current}`, from: 'driver', text: REPLY }]);
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title={name || 'Prestataire'} />

      <ScrollView
        ref={scrollRef}
        style={styles.flex1}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m) => (
          <View key={m.id} style={[styles.bubble, m.from === 'me' ? styles.bubbleMe : styles.bubbleDriver]}>
            <Text variant="body" color={m.from === 'me' ? Colors.textOnPrimary : Colors.textPrimary}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Votre message…"
          placeholderTextColor={Colors.textTertiary}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <IconButton name="navigate" variant="flat" onPress={send} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  flex1: { flex: 1 },
  messages: { padding: 16, gap: 8 },
  bubble: { maxWidth: '78%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: Radii.lg },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: Colors.primary, borderBottomRightRadius: Radii.sm },
  bubbleDriver: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderBottomLeftRadius: Radii.sm,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: Colors.borderSubtle,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1, height: 44,
    backgroundColor: Colors.bg,
    borderRadius: Radii.pill,
    paddingHorizontal: 16,
    fontFamily: Poppins.regular, fontSize: 15, color: Colors.textPrimary,
  },
});
