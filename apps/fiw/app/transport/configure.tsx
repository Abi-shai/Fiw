import React, { useRef, useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Pressable, FlatList, ScrollView, Animated, Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import LeafletMap from '@/components/LeafletMap';
import { Handle, sheetSurface } from '@/components/Sheet';
import IconButton from '@/components/IconButton';
import Text from '@/components/Text';
import Icon, { type IconName } from '@/components/Icon';
import Button from '@/components/Button';
import Scrim from '@/components/Scrim';
import { Colors, Radii, Poppins } from '@/constants/tokens';
import { GAMMES, PAYMENT_METHODS, FRAIS_RAPPROCHEMENT, DAKAR_CENTER } from '@/constants/data';

type Option = 'none' | 'A' | 'B';

const SCREEN_H = Dimensions.get('window').height;
// Feuille figée au plus grand cran du design system (« full » ≈ 90 %) : ni plus
// haut ni plus bas, le contenu scrolle dans cette hauteur (jamais compressé).
const FULL_H = Math.round(SCREEN_H * 0.9);
// Même ressort que le sheet de l'accueil : vif, légèrement sous-amorti.
const SHEET_SPRING = { stiffness: 280, damping: 22, mass: 1 };

const gammeIcon = (id: string): IconName => (id === 'moto' ? 'moto' : 'car');
// Tag de mise en avant (façon Yango) sur quelques gammes seulement.
const gammeTag = (id: string): string | null =>
  id === 'moto' ? 'Le plus rapide' : id === 'prestige' ? 'Premium' : null;

// Carte gamme (langage visuel de l'accueil : fond gris, plateforme, icône bold).
function GammeCard({ gamme, selected, onPress }: {
  gamme: typeof GAMMES[number]; selected: boolean; onPress: () => void;
}) {
  const accent = selected ? Colors.primary : Colors.textTertiary;
  return (
    <TouchableOpacity
      style={[styles.gCard, selected && styles.gCardSel]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Badge ETA en haut (façon Yango) */}
      <View style={styles.gEta}>
        <Icon name="clock" size={11} weight="bold" color={accent} />
        <Text variant="caption" color={accent}>{gamme.eta}</Text>
      </View>
      <View style={[styles.gPlatform, selected && styles.gPlatformSel]}>
        <Icon name={gammeIcon(gamme.id)} size={30} weight={selected ? 'fill' : 'bold'}
          color={selected ? Colors.primary : Colors.textSecondary} />
      </View>
      <Text variant="label" color={selected ? Colors.primary : Colors.textPrimary}>{gamme.label}</Text>
      {/* Ligne tag réservée (espace insécable si absent) → cartes à hauteur égale */}
      <Text variant="caption" numberOfLines={1}
        color={gammeTag(gamme.id) ? Colors.primary : 'transparent'}>
        {gammeTag(gamme.id) ?? '·'}
      </Text>
      <Text variant="body" style={styles.gPrice} color={selected ? Colors.primary : Colors.textPrimary}>
        {gamme.basePrice.toLocaleString()} F
      </Text>
    </TouchableOpacity>
  );
}

export default function ConfigureScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    departureName: string;
    destName: string; destDetail: string; destLat: string; destLng: string;
  }>();

  const departureName = params.departureName || 'Ma position actuelle';
  const destLat = parseFloat(params.destLat || String(DAKAR_CENTER.lat));
  const destLng = parseFloat(params.destLng || String(DAKAR_CENTER.lng));

  const [selectedGamme, setSelectedGamme] = useState('simple');
  const [selectedOption, setSelectedOption] = useState<Option>('none');
  const [selectedPayment, setSelectedPayment] = useState('wave');
  const [payOpen, setPayOpen] = useState(false);

  const gamme = GAMMES.find(g => g.id === selectedGamme)!;
  const payment = PAYMENT_METHODS.find(p => p.id === selectedPayment)!;
  const needsOptionChoice = selectedGamme !== 'simple';

  const select = (fn: () => void) => { Haptics.selectionAsync(); fn(); };

  const handleGammeSelect = (id: string) =>
    select(() => { setSelectedGamme(id); setSelectedOption(id === 'simple' ? 'none' : 'B'); });

  const finalPrice = selectedOption === 'B'
    ? gamme.basePrice + FRAIS_RAPPROCHEMENT
    : gamme.basePrice;

  // Sheet posé en bas (non fermable au glissement). Entrée par le bas.
  const ty = useRef(new Animated.Value(SCREEN_H)).current;
  // Voile : carte assombrie quand la feuille est en place (full) ; suit l'entrée/sortie.
  const scrimOpacity = ty.interpolate({
    inputRange: [0, SCREEN_H],
    outputRange: [0.58, 0],
    extrapolate: 'clamp',
  });

  React.useEffect(() => {
    Animated.spring(ty, { toValue: 0, ...SHEET_SPRING, useNativeDriver: true }).start();
  }, []);

  const confirm = () => {
    Haptics.selectionAsync();
    router.push({
      pathname: '/transport/searching',
      params: {
        ...params,
        gammeId: selectedGamme,
        gammeLabel: gamme.label,
        gammePrice: gamme.basePrice,
        selectedOption,
        finalPrice,
        paymentId: selectedPayment,
      },
    });
  };

  return (
    <View style={styles.container}>
      <LeafletMap
        center={{ lat: (DAKAR_CENTER.lat + destLat) / 2, lng: (DAKAR_CENTER.lng + destLng) / 2 }}
        zoom={13}
        markers={[
          { lat: DAKAR_CENTER.lat, lng: DAKAR_CENTER.lng, type: 'origin' },
          { lat: destLat, lng: destLng, type: 'destination' },
        ]}
        route={{ from: DAKAR_CENTER, to: { lat: destLat, lng: destLng } }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Voile : assombrit la carte pour concentrer sur la feuille (full) */}
      <Scrim opacity={scrimOpacity} />

      {/* Flèche Retour flottante sur la carte (en plus du close du sheet) */}
      <View style={[styles.topRow, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <IconButton name="back" onPress={() => router.back()} />
      </View>

      <Animated.View
        style={[
          sheetSurface, styles.sheet,
          { height: FULL_H, paddingBottom: insets.bottom + 16, transform: [{ translateY: ty }] },
        ]}
      >
        {/* Poignée (visuelle — feuille figée, non déplaçable) */}
        <View style={styles.handleArea}>
          <Handle />
        </View>

        {/* Header : titre + close, comme l'étape recherche */}
        <View style={styles.header}>
          <Text variant="heading1" style={styles.headerTitle}>Votre course</Text>
          <IconButton name="close" variant="flat" color={Colors.textPrimary} onPress={() => router.back()} />
        </View>

        {/* Contenu défilant — pas de compression : si ça dépasse, on scrolle */}
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        {/* Itinéraire de bout en bout */}
        <View style={styles.routeCard}>
          <View style={styles.routeRail}>
            <View style={[styles.routeDot, { backgroundColor: Colors.success }]} />
            <View style={styles.routeLine} />
            <View style={[styles.routeDot, { backgroundColor: Colors.error }]} />
          </View>
          <View style={styles.routeCol}>
            <View>
              <Text variant="caption" color={Colors.textTertiary}>Départ</Text>
              <Text variant="label" numberOfLines={1}>{departureName}</Text>
            </View>
            <View>
              <Text variant="caption" color={Colors.textTertiary}>Arrivée</Text>
              <Text variant="label" numberOfLines={1}>{params.destName}</Text>
              {!!params.destDetail && (
                <Text variant="caption" color={Colors.textSecondary} numberOfLines={1}>{params.destDetail}</Text>
              )}
            </View>
          </View>
          {/* Modifier l'itinéraire → revient à la recherche départ/arrivée */}
          <TouchableOpacity style={styles.routeEdit} onPress={() => router.back()} hitSlop={8} activeOpacity={0.7}>
            <Icon name="edit" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Choix du véhicule */}
        <Text variant="caption" color={Colors.textTertiary} style={styles.sectionLabel}>Véhicule</Text>
        <FlatList
          data={GAMMES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={g => g.id}
          contentContainerStyle={styles.gList}
          renderItem={({ item }) => (
            <GammeCard gamme={item} selected={selectedGamme === item.id} onPress={() => handleGammeSelect(item.id)} />
          )}
        />

        {/* Frais de rapprochement — choix binaire Option A / Option B */}
        {needsOptionChoice && (
          <>
            <Text variant="caption" color={Colors.textTertiary} style={styles.sectionLabel}>Prise en charge</Text>
            <View style={styles.optRow}>
              <TouchableOpacity
                style={[styles.optCard, selectedOption === 'A' && styles.optCardSel]}
                onPress={() => select(() => setSelectedOption('A'))}
                activeOpacity={0.9}
              >
                <View style={styles.optHead}>
                  <Text variant="label" color={selectedOption === 'A' ? Colors.primary : Colors.textPrimary}>Option A</Text>
                  {selectedOption === 'A' && <Icon name="check" size={16} weight="fill" color={Colors.primary} />}
                </View>
                <Text variant="bodySmall" style={styles.optPrice}>{gamme.basePrice.toLocaleString()} F</Text>
                <Text variant="caption" color={Colors.textSecondary}>Attente ~12 min · sans frais</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optCard, selectedOption === 'B' && styles.optCardSel]}
                onPress={() => select(() => setSelectedOption('B'))}
                activeOpacity={0.9}
              >
                <View style={styles.optHead}>
                  <Text variant="label" color={selectedOption === 'B' ? Colors.primary : Colors.textPrimary}>Option B</Text>
                  {selectedOption === 'B' && <Icon name="check" size={16} weight="fill" color={Colors.primary} />}
                </View>
                <Text variant="bodySmall" style={styles.optPrice}>{(gamme.basePrice + FRAIS_RAPPROCHEMENT).toLocaleString()} F</Text>
                <Text variant="caption" color={Colors.textSecondary}>Prise en charge ~4 min · frais de rapprochement</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        </ScrollView>

        {/* Zone d'action épinglée : total + paiement compact + confirmation */}
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <View>
              <Text variant="caption" color={Colors.textTertiary}>Total estimé</Text>
              <Text variant="caption" color={Colors.textSecondary}>{gamme.label} · {payment.label}</Text>
            </View>
            <Text variant="heading1">{finalPrice.toLocaleString()} F CFA</Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.payBtn} onPress={() => setPayOpen(true)} activeOpacity={0.85}>
              <View style={[styles.payDot, { backgroundColor: payment.color }]} />
              <Icon name="chevronDown" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Button label="Confirmer la course" onPress={confirm} style={styles.cta} />
          </View>
        </View>
      </Animated.View>

      {/* Sélecteur de moyen de paiement (mini-feuille) */}
      {payOpen && (
        <View style={styles.payOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPayOpen(false)} />
          <View style={[styles.paySheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.paySheetHandle}><Handle /></View>
            <Text variant="heading2" style={styles.paySheetTitle}>Moyen de paiement</Text>
            {PAYMENT_METHODS.map((m) => {
              const sel = selectedPayment === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={styles.payRow}
                  onPress={() => { select(() => setSelectedPayment(m.id)); setPayOpen(false); }}
                  activeOpacity={0.85}
                >
                  <View style={[styles.payDot, { backgroundColor: m.color }]} />
                  <Text variant="label" style={styles.payRowLabel}
                    color={sel ? Colors.primary : Colors.textPrimary}>{m.label}</Text>
                  {sel && <Icon name="check" size={18} weight="fill" color={Colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  topRow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: { flex: 1, letterSpacing: -0.4 },

  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  handleArea: {
    paddingTop: 6,
    paddingBottom: 12,
    alignItems: 'center',
  },
  // flex: 1 → la zone défilante remplit la hauteur fixe (medium) et épingle le
  // footer en bas ; si le contenu dépasse, il scrolle au lieu d'être compressé.
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 4 },

  // Itinéraire
  routeCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F2F3F5',
    borderRadius: Radii.lg,
    padding: 14,
  },
  routeRail: { width: 12, alignItems: 'center', paddingVertical: 5, justifyContent: 'space-between' },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeLine: { flex: 1, width: 2, backgroundColor: Colors.border, marginVertical: 4, minHeight: 16 },
  routeCol: { flex: 1, justifyContent: 'space-between', gap: 14 },
  routeEdit: { alignSelf: 'flex-start', padding: 2 },

  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 22,
    marginBottom: 10,
  },

  // Cartes gamme
  gList: { gap: 10, paddingRight: 4 },
  gCard: {
    width: 130,
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 10,
    borderRadius: Radii.lg,
    backgroundColor: '#F2F3F5',
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: 6,
  },
  gCardSel: { backgroundColor: Colors.primarySubtle, borderColor: Colors.primary },
  gPlatform: {
    width: 52, height: 52,
    borderRadius: Radii.md,
    backgroundColor: '#E8EAED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  gPlatformSel: { backgroundColor: Colors.surface },
  gPrice: { fontFamily: Poppins.semibold },
  // Badge ETA : petite pastille blanche en haut à gauche du card.
  gEta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surface,
    borderRadius: Radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  // Options A / B
  optRow: { flexDirection: 'row', gap: 10 },
  optCard: {
    flex: 1,
    padding: 14,
    borderRadius: Radii.lg,
    backgroundColor: '#F2F3F5',
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 4,
  },
  optCardSel: { backgroundColor: Colors.primarySubtle, borderColor: Colors.primary },
  optHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optPrice: { fontFamily: Poppins.semibold },

  // Paiement — bouton compact (zone d'action) + mini-feuille de sélection.
  payDot: { width: 10, height: 10, borderRadius: 5 },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 56,
    paddingHorizontal: 14,
    borderRadius: Radii.pill,
    backgroundColor: '#F2F3F5',
  },
  payOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  paySheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  paySheetHandle: { alignItems: 'center', paddingBottom: 10 },
  paySheetTitle: { marginBottom: 8 },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
  },
  payRowLabel: { flex: 1 },

  // Footer
  footer: {
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cta: { flex: 1 },
});
