import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/tokens';
import Avatar from '@/components/Avatar';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';

const mmss = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const WHITE = Colors.textOnPrimary;
const WHITE_60 = 'rgba(255,255,255,0.6)';
const WHITE_70 = 'rgba(255,255,255,0.72)';

/** Contrôle d'appel circulaire (haut-parleur / muet / raccrocher) — repris du
 *  benchmark inDrive/Bolt : cercle neutre translucide, blanc quand actif, rouge
 *  pour raccrocher. Libellé dessous. */
function CallControl({ icon, label, active, danger, onPress }: {
  icon: IconName; label: string; active?: boolean; danger?: boolean; onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.control} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.controlCircle, active && styles.controlActive, danger && styles.controlDanger]}>
        <Icon
          name={icon}
          size={26}
          weight={danger ? 'fill' : 'bold'}
          color={danger ? WHITE : active ? Colors.textPrimary : WHITE}
        />
      </View>
      <Text variant="caption" color={active ? WHITE : WHITE_70}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Appel masqué simulé : le numéro du client (et du prestataire) reste masqué,
 *  l'appel passe par Fiw. Aucun numéro brut n'est jamais exposé. */
export default function CallScreen() {
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name: string }>();
  const driverName = name || 'Prestataire';

  const [connecting, setConnecting] = useState(true);
  const [secs, setSecs] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  // Brève phase « Connexion… » avant le démarrage du minuteur (réalisme).
  useEffect(() => {
    const c = setTimeout(() => setConnecting(false), 1800);
    return () => clearTimeout(c);
  }, []);
  useEffect(() => {
    if (connecting) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [connecting]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 28 }]}>
      {/* Indicateur de sécurité (façon « End-to-end encrypted » d'inDrive). */}
      <View style={styles.secureRow}>
        <Icon name="lock" size={13} weight="fill" color={WHITE_60} />
        <Text variant="bodySmall" color={WHITE_60}>Appel masqué · via Fiw</Text>
      </View>

      <View style={styles.center}>
        <Avatar name={driverName} size={112} bordered />
        <Text variant="heading1" color={WHITE} style={styles.name}>{driverName}</Text>
        <View style={styles.statusRow}>
          <Icon name="phone" size={15} weight="fill" color={WHITE_70} />
          <Text variant="label" color={WHITE_70}>
            {connecting ? 'Connexion…' : mmss(secs)}
          </Text>
        </View>
        <Text variant="bodySmall" color={WHITE_60} align="center" style={styles.note}>
          Votre numéro reste masqué. L'appel passe par Fiw pour votre sécurité.
        </Text>
      </View>

      <View style={styles.controls}>
        <CallControl
          icon={speaker ? 'speaker' : 'speakerOff'}
          label="Haut-parleur"
          active={speaker}
          onPress={() => setSpeaker((v) => !v)}
        />
        <CallControl
          icon={muted ? 'micOff' : 'mic'}
          label="Muet"
          active={muted}
          onPress={() => setMuted((v) => !v)}
        />
        <CallControl icon="phone" label="Raccrocher" danger onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  name: { marginTop: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  note: { maxWidth: 280, marginTop: 4 },

  controls: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 28 },
  control: { alignItems: 'center', gap: 8, width: 84 },
  controlCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  controlActive: { backgroundColor: Colors.surface },
  controlDanger: { backgroundColor: Colors.error },
});
