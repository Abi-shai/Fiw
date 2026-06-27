import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, StyleSheet, Animated, TouchableOpacity, Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import LeafletMap, { LeafletMapHandle } from '@/components/LeafletMap';
import Text from '@/components/Text';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import RapprochementChoice, { type OptId } from '@/components/RapprochementChoice';
import { Handle, sheetSurface } from '@/components/Sheet';
import { Colors, Poppins } from '@/constants/tokens';
import { DAKAR_CENTER, FRAIS_RAPPROCHEMENT } from '@/constants/data';
import { gammeIllustration, type IlluKey } from '@/constants/illustrations';

// Phases : on cherche un prestataire → s'il n'y en a pas tout près, on propose
// le choix frais de rapprochement → mise en relation → course active.
type Phase = 'searching' | 'choice' | 'matching';

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/[\s  ]/g, '.');

export default function SearchingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    destName: string; gammePrice: string; gammeId: string; gammeLabel: string;
    gammeIllu: string; paymentId: string; destLat: string; destLng: string;
  }>();

  const base = parseInt(params.gammePrice || '0', 10);
  const frais = FRAIS_RAPPROCHEMENT;

  const [phase, setPhase] = useState<Phase>('searching');
  const [option, setOption] = useState<OptId>('A');
  const finalPrice = option === 'B' ? base + frais : base;

  // Prestataires aux alentours, illustrés selon le moyen de transport choisi.
  const mapRef = useRef<LeafletMapHandle>(null);
  const providers = useMemo(() => {
    const o = DAKAR_CENTER;
    return [
      [0.0065, -0.0042], [-0.0048, 0.0060], [0.0030, 0.0072],
      [-0.0070, -0.0030], [0.0052, 0.0020], [-0.0024, -0.0066],
    ].map(([dlat, dlng]) => ({ lat: o.lat + dlat, lng: o.lng + dlng }));
  }, []);
  const providerIcon = useMemo(
    () => Image.resolveAssetSource(gammeIllustration((params.gammeIllu || 'auto') as IlluKey)).uri,
    [params.gammeIllu],
  );

  const dotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 0.25, duration: 700, useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    // Proto : on simule l'absence de prestataire tout près → on présente le choix.
    const timer = setTimeout(() => setPhase('choice'), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Choix validé → mise en relation puis course active.
  const proceed = () => {
    Haptics.selectionAsync();
    setPhase('matching');
    setTimeout(() => {
      router.replace({
        pathname: '/transport/course-active',
        params: { ...params, selectedOption: option, finalPrice: String(finalPrice) },
      });
    }, 2400);
  };

  const cancel = () => router.replace('/home');

  return (
    <View style={styles.container}>
      <LeafletMap
        ref={mapRef}
        center={DAKAR_CENTER}
        zoom={14}
        markers={[{ lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'origin' }]}
        mapStyle="mapbox://styles/mapbox/light-v11"
        tintWater
        declutter
        providers={providers}
        providerIcon={providerIcon}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={[sheetSurface, styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.handleArea}>
            <Handle />
          </View>

          {phase === 'choice' ? (
            <>
              <Text variant="heading2">Pas de prestataire tout près</Text>
              <Text variant="bodySmall" color={Colors.textSecondary} style={styles.choiceSub}>
                Choisissez comment être pris en charge :
              </Text>

              <RapprochementChoice base={base} frais={frais} value={option} onChange={setOption} />

              <Button label="Continuer" onPress={proceed} style={styles.cta} />
              <TouchableOpacity style={styles.cancelBtn} onPress={cancel} activeOpacity={0.7}>
                <Text variant="label" color={Colors.error}>Annuler</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.statusRow}>
                <Animated.View style={[styles.dot, { opacity: dotOpacity }]} />
                <View style={styles.flex1}>
                  <Text variant="heading2">
                    {phase === 'matching' ? 'Mise en relation…' : 'Recherche en cours…'}
                  </Text>
                  <Text variant="caption" color={Colors.textSecondary}>
                    {phase === 'matching'
                      ? 'Un prestataire a accepté votre course'
                      : `Recherche d’un ${params.gammeLabel || 'véhicule'} aux alentours`}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Destination + tarif */}
              <View style={styles.tripRow}>
                <View style={styles.flagTile}>
                  <Icon name="flag" size={20} weight="bold" color={Colors.textPrimary} />
                </View>
                <Text variant="body" style={styles.destName} numberOfLines={1}>{params.destName}</Text>
                <Text variant="body" style={styles.price}>
                  {fmt(phase === 'matching' ? finalPrice : base)} FCFA
                </Text>
              </View>

              {phase === 'searching' && (
                <TouchableOpacity style={styles.cancelBtn} onPress={cancel} activeOpacity={0.7}>
                  <Text variant="label" color={Colors.error}>Annuler</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  flex1: { flex: 1 },

  sheet: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  handleArea: {
    paddingTop: 6,
    paddingBottom: 16,
    alignItems: 'center',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  dot: {
    width: 12, height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginBottom: 16,
  },

  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  flagTile: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: '#F2F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destName: { flex: 1 },
  price: { fontFamily: Poppins.semibold },

  // Phase choix frais de rapprochement
  choiceSub: { marginTop: 4, marginBottom: 16 },
  cta: { marginTop: 8 },

  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
});
