import React, { useRef, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, FlatList, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radii, Shadows, Poppins } from '@/constants/tokens';
import LeafletMap, { type LeafletMapHandle } from '@/components/LeafletMap';
import ScreenHeader from '@/components/ScreenHeader';
import IconButton from '@/components/IconButton';
import PlaceRow from '@/components/PlaceRow';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import Text from '@/components/Text';
import { DAKAR_CENTER, SUGGESTIONS } from '@/constants/data';
import { getPlace, savePlace, removePlace, clearAddress, newPlaceId } from '@/stores/places';

/**
 * Fiche d'un Lieu enregistré — création et édition par le même écran.
 *
 * Trois temps, dans l'ordre que suivent Bolt, Careem, Grab et Zomato : on
 * cherche l'adresse, on ajuste le pin, on nomme en dernier. Le nom vient
 * toujours après parce qu'on ne sait pas comment appeler un lieu qu'on n'a pas
 * encore choisi — et l'étape carte existe parce qu'à Dakar la recherche tombe
 * rarement pile sur la bonne porte.
 *
 * Sans paramètre → création d'un lieu libre. Avec `?id=` → édition, et on entre
 * directement à l'étape « nom », l'adresse étant déjà connue.
 */
type Step = 'search' | 'pin' | 'name';

export default function LieuScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = getPlace(id);
  // Maison et Travail sont des emplacements permanents : leur adresse se change,
  // pas leur nom, et ils ne se suppriment pas (cf. CONTEXT.md « Lieu enregistré »).
  const isFixed = existing?.kind === 'home' || existing?.kind === 'work';

  const mapRef = useRef<LeafletMapHandle>(null);
  // On entre par le nom quand l'adresse est déjà connue ; un emplacement vidé
  // (Maison sans adresse) ouvre directement sur la recherche — c'est ce qu'on
  // vient y faire.
  const [step, setStep] = useState<Step>(existing?.detail ? 'name' : 'search');
  const [query, setQuery] = useState('');
  const [address, setAddress] = useState(existing?.detail ?? '');
  const [coords, setCoords] = useState({
    lat: existing?.lat ?? DAKAR_CENTER.lat,
    lng: existing?.lng ?? DAKAR_CENTER.lng,
  });
  const [label, setLabel] = useState(existing?.label ?? '');
  // Tant que le Client n'a pas écrit lui-même, le nom suit le lieu choisi ; dès
  // qu'il tape, il reprend la main et le pin ne l'écrase plus.
  const [labelTouched, setLabelTouched] = useState(Boolean(existing));

  // `mapCenter` est figé à l'entrée dans l'étape carte (il pilote le centrage
  // initial) ; `pinCenter` suit ensuite chaque déplacement de la carte.
  const [mapCenter, setMapCenter] = useState(coords);
  const [pinCenter, setPinCenter] = useState(coords);

  const openPin = (c: { lat: number; lng: number }) => {
    setMapCenter(c);
    setPinCenter(c);
    setStep('pin');
  };

  // --- Recherche ---
  const matches = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());
  const results = query.trim()
    ? SUGGESTIONS.filter((s) => matches(s.name) || matches(s.detail))
    : SUGGESTIONS;

  // --- Ajustement du pin ---
  // Faute de géocodage inverse dans le proto, on rattache le pin au lieu connu le
  // plus proche (même approche que `home.tsx`).
  const nearestPlace = (c: { lat: number; lng: number }) =>
    SUGGESTIONS.reduce((best, s) => {
      const d = (s.lat - c.lat) ** 2 + (s.lng - c.lng) ** 2;
      const bd = (best.lat - c.lat) ** 2 + (best.lng - c.lng) ** 2;
      return d < bd ? s : best;
    }, SUGGESTIONS[0]);
  const pinPlace = nearestPlace(pinCenter);

  const confirmPin = () => {
    setAddress(`${pinPlace.name}, ${pinPlace.detail}`);
    setCoords(pinCenter);
    if (!labelTouched) setLabel(pinPlace.name);
    setStep('name');
  };

  // --- Enregistrement ---
  // Entrer dans un lieu sans y toucher ne doit pas donner un CTA actif : le
  // bouton ne s'allume qu'une fois quelque chose réellement changé (style-guide
  // — la validation passe par le CTA désactivé, pas par un message d'erreur).
  const dirty =
    !existing ||
    label.trim() !== existing.label ||
    address !== existing.detail ||
    coords.lat !== existing.lat ||
    coords.lng !== existing.lng;

  const save = () => {
    savePlace({
      id: existing?.id ?? newPlaceId(),
      kind: existing?.kind ?? 'custom',
      label: label.trim(),
      detail: address,
      ...coords,
    });
    router.back();
  };

  const confirmRemove = () => {
    if (!existing) return;
    Alert.alert(
      `Supprimer « ${existing.label} » ?`,
      'Ce lieu ne sera plus proposé dans la recherche.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => { removePlace(existing.id); router.back(); },
        },
      ],
    );
  };

  // Maison et Travail ne se suppriment pas — leur adresse s'efface. L'emplacement
  // reste dans la liste, prêt à être rempli à nouveau.
  const confirmClear = () => {
    if (!existing) return;
    Alert.alert(
      `Effacer l'adresse de « ${existing.label} » ?`,
      `${existing.label} restera dans vos lieux enregistrés, sans adresse.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: () => { clearAddress(existing.id); router.back(); },
        },
      ],
    );
  };

  // --- 2. Ajustement du pin sur la carte (plein écran) ---
  if (step === 'pin') {
    return (
      <View style={styles.container}>
        <LeafletMap
          ref={mapRef}
          center={mapCenter}
          zoom={16}
          mapStyle="mapbox://styles/mapbox/light-v11"
          tintWater
          declutter
          onCenterChange={setPinCenter}
          style={styles.map}
        />

        {/* Pin fixe — décalé pour que la pointe vise le centre exact */}
        <View pointerEvents="none" style={styles.pinWrap}>
          <View style={styles.pinIcon}>
            <Icon name="pin" size={44} color={Colors.primary} weight="fill" />
          </View>
          <View style={styles.pinDot} />
        </View>

        <View style={[styles.topRow, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
          {/* La carte s'atteint toujours depuis la recherche — le retour y ramène. */}
          <IconButton name="back" onPress={() => setStep('search')} />
        </View>

        <View style={styles.pickDock} pointerEvents="box-none">
          <View style={styles.recenterPick}>
            <IconButton name="navigate" onPress={() => mapRef.current?.recenter(DAKAR_CENTER, 15)} />
          </View>
          <View style={[styles.pickCard, { paddingBottom: insets.bottom + 16 }]}>
            <Text variant="caption" color={Colors.textTertiary} style={styles.pickKicker}>
              Déplacez la carte pour ajuster
            </Text>
            <View style={styles.pickRow}>
              <Icon name="location" size={22} color={Colors.primary} />
              <View style={styles.flex1}>
                <Text variant="label" numberOfLines={1}>{pinPlace.name}</Text>
                <Text variant="caption" color={Colors.textSecondary} numberOfLines={1}>{pinPlace.detail}</Text>
              </View>
            </View>
            <Button label="Valider l'emplacement" onPress={confirmPin} />
          </View>
        </View>
      </View>
    );
  }

  // --- 1. Recherche de l'adresse ---
  if (step === 'search') {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title={!existing ? 'Nouveau lieu' : existing.detail ? "Modifier l'adresse" : 'Ajouter une adresse'}
          onBack={() => (address ? setStep('name') : router.back())}
        />

        <View style={styles.searchWrap}>
          <View style={[styles.field, styles.fieldActive]}>
            <View style={styles.fieldIcon}>
              <Icon name="search" size={20} color={Colors.textSecondary} />
            </View>
            <View style={styles.fieldBody}>
              <TextInput
                style={styles.fieldInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Rechercher une adresse"
                placeholderTextColor={Colors.textTertiary}
                autoFocus
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.mapPickRow}
            activeOpacity={0.7}
            onPress={() => openPin(coords)}
          >
            <View style={styles.mapPickIcon}>
              <Icon name="pin" size={20} color={Colors.primary} />
            </View>
            <Text variant="body" style={styles.mapPickLabel}>Choisir sur la carte</Text>
            <Icon name="chevronRight" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.results, { paddingBottom: insets.bottom + 24 }]}
          renderItem={({ item }) => (
            <PlaceRow
              icon="location"
              title={item.name}
              subtitle={item.detail}
              onPress={() => openPin({ lat: item.lat, lng: item.lng })}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    );
  }

  // --- 3. Nommage ---
  return (
    <View style={styles.container}>
      <ScreenHeader
        title={existing ? 'Modifier le lieu' : 'Nommer ce lieu'}
        onBack={() => (existing ? router.back() : setStep('pin'))}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* L'adresse validée, avec le retour en arrière d'un tap */}
        <View style={styles.addressCard}>
          <Icon name="location" size={22} color={Colors.primary} />
          <View style={styles.flex1}>
            <Text variant="caption" color={Colors.textTertiary}>Adresse</Text>
            <Text variant="body" style={styles.addressText}>{address}</Text>
          </View>
          {/* Retour à la recherche, pas à la carte : déménager à l'autre bout de
              Dakar se fait au clavier. La carte reste à un tap, pour le cas
              inverse — corriger de quelques rues. */}
          <Button label="Modifier" variant="link" onPress={() => { setQuery(''); setStep('search'); }} />
        </View>

        <Text variant="caption" color={Colors.textTertiary} style={styles.label}>Nom du lieu</Text>

        {isFixed ? (
          <>
            <View style={[styles.field, styles.fieldLocked]}>
              <View style={styles.fieldIcon}>
                <Icon name={existing?.kind === 'home' ? 'home' : 'work'} size={20} color={Colors.textSecondary} />
              </View>
              <View style={styles.fieldBody}>
                <Text variant="body" style={styles.fieldValue}>{label}</Text>
              </View>
              {/* Le cadenas suffit à dire que le nom ne se change pas — pas de
                  phrase d'explication sous le champ. */}
              <Icon name="lock" size={18} color={Colors.textTertiary} />
            </View>
          </>
        ) : (
          <>
            <View style={[styles.field, styles.fieldActive]}>
              <View style={styles.fieldBody}>
                <TextInput
                  style={styles.fieldInput}
                  value={label}
                  onChangeText={(t) => { setLabel(t); setLabelTouched(true); }}
                  placeholder="Ex. Salle de sport"
                  placeholderTextColor={Colors.textTertiary}
                  autoFocus={!existing}
                  maxLength={30}
                />
              </View>
            </View>
            <Text variant="caption" color={Colors.textTertiary} style={styles.hint}>
              Ce nom n'apparaît que pour vous, dans la recherche d'itinéraire.
            </Text>
          </>
        )}

        <Button
          label={existing ? 'Enregistrer' : 'Enregistrer le lieu'}
          onPress={save}
          disabled={!dirty || !label.trim() || !address}
          style={styles.cta}
        />

        {existing && (isFixed ? Boolean(existing.detail) : true) && (
          <Button
            label={isFixed ? "Effacer l'adresse" : 'Supprimer ce lieu'}
            variant="linkDestructive"
            onPress={isFixed ? confirmClear : confirmRemove}
            style={styles.remove}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  map: { flex: 1 },
  flex1: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8 },

  // --- Recherche ---
  searchWrap: { paddingHorizontal: 20 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bg,
    borderRadius: Radii.lg,
    paddingLeft: 16,
    paddingRight: 16,
    minHeight: 60,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  fieldActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  fieldLocked: { backgroundColor: Colors.surface, borderColor: Colors.border },
  fieldIcon: { width: 28, alignItems: 'center' },
  fieldBody: { flex: 1, paddingVertical: 10 },
  fieldInput: { fontSize: 15, color: Colors.textPrimary, fontFamily: Poppins.medium, padding: 0 },
  fieldValue: { fontFamily: Poppins.medium },

  mapPickRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  mapPickIcon: {
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPickLabel: { flex: 1, fontFamily: Poppins.medium },

  results: { paddingHorizontal: 20 },
  separator: { height: 1, backgroundColor: Colors.borderSubtle, marginLeft: 56 },

  // --- Ajustement du pin (calqué sur home.tsx) ---
  topRow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  pinWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinIcon: { marginBottom: 44 }, // remonte la pointe du pin sur le centre exact
  pinDot: {
    position: 'absolute',
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: 'rgba(17, 24, 39, 0.25)',
  },
  pickDock: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  recenterPick: { alignSelf: 'flex-end', marginRight: 16, marginBottom: 12 },
  pickCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 14,
    ...Shadows.sheet,
  },
  pickKicker: { textTransform: 'uppercase', letterSpacing: 0.8 },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  // --- Nommage ---
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 28,
  },
  addressText: { fontFamily: Poppins.medium, marginTop: 1 },
  label: { marginBottom: 8, marginLeft: 4 },
  hint: { marginTop: 8, marginLeft: 4, lineHeight: 16 },
  cta: { marginTop: 28 },
  remove: { marginTop: 20, alignSelf: 'center' },
});
