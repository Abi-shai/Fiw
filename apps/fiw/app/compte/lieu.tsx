import React, { useRef, useState } from 'react';
import {
  View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Keyboard, Alert,
} from 'react-native';
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
 * Deux temps : on montre, puis on écrit.
 *
 * 1. LA CARTE porte sa propre loupe. Chercher « Mermoz » y amène la carte, le
 *    pin s'ajuste ensuite à la ruelle près. Un écran de recherche séparé ne
 *    ferait rien que la carte ne sache faire.
 * 2. LES DÉTAILS regroupent ce qui se tape au clavier — le Repère, qui
 *    s'adresse au Prestataire, et le Nom, qui ne regarde que le Client.
 *
 * Sans paramètre → création d'un lieu libre. Avec `?id=` → édition, et on entre
 * directement aux détails (sauf emplacement vidé de son adresse : retour carte).
 */
type Step = 'map' | 'details';

export default function LieuScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = getPlace(id);
  // Maison et Travail sont des emplacements permanents : leur adresse se change,
  // pas leur nom, et ils ne se suppriment pas (cf. CONTEXT.md « Lieu enregistré »).
  const isFixed = existing?.kind === 'home' || existing?.kind === 'work';

  const mapRef = useRef<LeafletMapHandle>(null);
  const [step, setStep] = useState<Step>(existing?.detail ? 'details' : 'map');
  const [query, setQuery] = useState('');
  const [address, setAddress] = useState(existing?.detail ?? '');
  const [repere, setRepere] = useState(existing?.repere ?? '');
  const [coords, setCoords] = useState({
    lat: existing?.lat ?? DAKAR_CENTER.lat,
    lng: existing?.lng ?? DAKAR_CENTER.lng,
  });
  // Le nom n'est jamais pré-rempli depuis le lieu choisi : ça produisait un
  // écran qui affichait deux fois « Almadies » (une fois comme adresse, une fois
  // comme nom) et faisait passer le champ pour une redondance à valider. Comme
  // pour le Repère, c'est un exemple en placeholder qui montre quoi écrire.
  const [label, setLabel] = useState(existing?.label ?? '');

  // Le centre de départ de la carte est figé une fois pour toutes : le prop
  // `center` est recompilé dans le HTML de la webview, en changer la rechargerait
  // à chaque recherche. Les déplacements passent donc par `recenter()`.
  const [initialCenter] = useState(coords);
  const [pinCenter, setPinCenter] = useState(coords);

  // --- Recherche, posée sur la carte ---
  const searching = query.trim().length > 0;
  const matches = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());
  const results = SUGGESTIONS.filter((s) => matches(s.name) || matches(s.detail));

  const goTo = (c: { lat: number; lng: number }) => {
    Keyboard.dismiss();
    setQuery('');
    setPinCenter(c);
    mapRef.current?.recenter(c, 16);
  };

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
    setStep('details');
  };

  // --- Enregistrement ---
  // Entrer dans un lieu sans y toucher ne doit pas donner un CTA actif : le
  // bouton ne s'allume qu'une fois quelque chose réellement changé (style-guide
  // — la validation passe par le CTA désactivé, pas par un message d'erreur).
  const dirty =
    !existing ||
    label.trim() !== existing.label ||
    address !== existing.detail ||
    repere.trim() !== existing.repere ||
    coords.lat !== existing.lat ||
    coords.lng !== existing.lng;

  const save = () => {
    savePlace({
      id: existing?.id ?? newPlaceId(),
      kind: existing?.kind ?? 'custom',
      label: label.trim(),
      detail: address,
      repere: repere.trim(),
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

  const confirmClear = () => {
    if (!existing) return;
    Alert.alert(
      `Effacer l'adresse de « ${existing.label} » ?`,
      `${existing.label} restera dans vos lieux, sans adresse ni repère.`,
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

  // --- 1. La carte, avec sa loupe ---
  if (step === 'map') {
    return (
      <View style={styles.container}>
        <LeafletMap
          ref={mapRef}
          center={initialCenter}
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

        {/* Barre de recherche posée sur la carte (Bolt, Zomato) : chercher un
            quartier y amène la carte, l'ajustement fin se fait au doigt. */}
        <View style={[styles.searchDock, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
          <View style={styles.searchRow}>
            <IconButton
              name="back"
              onPress={() => (address ? setStep('details') : router.back())}
            />
            <View style={styles.searchField}>
              <Icon name="search" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Adresse, quartier ou code (GY 182)"
                placeholderTextColor={Colors.textTertiary}
                returnKeyType="search"
              />
              {searching ? (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
                  <Icon name="close" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {searching ? (
            <View style={styles.resultsCard}>
              <ScrollView keyboardShouldPersistTaps="handled" style={styles.resultsScroll}>
                {results.length ? (
                  results.map((s) => (
                    <PlaceRow
                      key={s.id}
                      icon="location"
                      title={s.name}
                      subtitle={s.detail}
                      onPress={() => goTo({ lat: s.lat, lng: s.lng })}
                      style={styles.resultRow}
                    />
                  ))
                ) : (
                  <Text variant="bodySmall" color={Colors.textSecondary} style={styles.noResult}>
                    Aucun quartier ne correspond. Placez le pin à la main.
                  </Text>
                )}
              </ScrollView>
            </View>
          ) : null}
        </View>

        {/* Le dock du bas s'efface pendant la recherche : la liste a besoin de
            la hauteur, et il n'y a rien à valider tant qu'on cherche. */}
        {!searching && (
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
        )}
      </View>
    );
  }

  // --- 2. Les détails : ce qui se tape au clavier ---
  return (
    <View style={styles.container}>
      <ScreenHeader
        title={existing ? 'Modifier le lieu' : 'Nouveau lieu'}
        onBack={() => (existing ? router.back() : setStep('map'))}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* L'emplacement validé, avec le retour à la carte d'un tap */}
        <View style={styles.addressCard}>
          <Icon name="location" size={22} color={Colors.primary} />
          <View style={styles.flex1}>
            <Text variant="caption" color={Colors.textTertiary}>Adresse</Text>
            <Text variant="body" style={styles.addressText}>{address}</Text>
          </View>
          <Button label="Modifier" variant="link" onPress={() => { setQuery(''); setStep('map'); }} />
        </View>

        {/* Le nom avant le Repère : requis avant facultatif (style-guide), et le
            champ long et multiligne se retrouve collé au CTA. */}
        <Text variant="caption" color={Colors.textTertiary} style={styles.label}>
          Nom du lieu
        </Text>

        {isFixed ? (
          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <Icon name={existing?.kind === 'home' ? 'home' : 'work'} size={20} color={Colors.textSecondary} />
            </View>
            <View style={styles.fieldBody}>
              <Text variant="body" style={styles.fieldValue}>{label}</Text>
            </View>
            {/* Le cadenas suffit à dire que le nom ne se change pas. */}
            <Icon name="lock" size={18} color={Colors.textTertiary} />
          </View>
        ) : (
          // Pas de note sous ce champ : « Nom du lieu » et l'exemple en
          // placeholder se suffisent. Le Repère, lui, garde la sienne — c'est le
          // seul champ dont l'usage n'est pas devinable.
          <View style={styles.field}>
            <View style={styles.fieldBody}>
              <TextInput
                style={styles.fieldInput}
                value={label}
                onChangeText={setLabel}
                placeholder="Ex. Salle de sport"
                placeholderTextColor={Colors.textTertiary}
                maxLength={30}
              />
            </View>
          </View>
        )}

        {/* Le Repère (cf. CONTEXT.md) — le seul champ de cet écran que quelqu'un
            d'autre lira. Une ligne libre, jamais des champs structurés : ni le
            chauffeur ni le livreur ne montent, l'étage n'intéresse personne. */}
        <Text variant="caption" color={Colors.textTertiary} style={[styles.label, styles.labelSpaced]}>
          Repère
        </Text>
        <View style={styles.repereField}>
          <TextInput
            style={styles.repereInput}
            value={repere}
            onChangeText={setRepere}
            placeholder="Ex. Villa 214, portail vert en face de la boutique"
            placeholderTextColor={Colors.textTertiary}
            multiline
            maxLength={120}
          />
        </View>
        {/* Motif `infoRow` (cf. profil.tsx, numero.tsx) : dans ce DS, ce qui
            distingue une note d'un libellé de champ, c'est l'icône — les deux
            partagent la même taille et la même couleur. */}
        <View style={styles.infoRow}>
          <Icon name="info" size={13} color={Colors.textTertiary} />
          <Text variant="caption" color={Colors.textTertiary} style={styles.flex1}>
            Ce que le prestataire lira pour vous trouver.
          </Text>
        </View>

        <Button
          label={existing ? 'Enregistrer' : 'Enregistrer le lieu'}
          onPress={save}
          disabled={!dirty || !label.trim() || !address}
          style={styles.cta}
        />

        {existing && (isFixed ? (
          <Button
            label="Effacer l'adresse"
            variant="linkDestructive"
            onPress={confirmClear}
            style={styles.remove}
          />
        ) : (
          <Button
            label="Supprimer ce lieu"
            variant="linkDestructive"
            onPress={confirmRemove}
            style={styles.remove}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  map: { flex: 1 },
  flex1: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8 },

  // --- Carte : recherche posée dessus ---
  searchDock: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingHorizontal: 16,
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: Radii.pill,
    backgroundColor: Colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.hairline,
    ...Shadows.float,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: Poppins.medium,
    padding: 0,
  },
  resultsCard: {
    marginTop: 10,
    marginLeft: 56, // aligné sur le champ, pas sur le bouton retour
    borderRadius: Radii.lg,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    ...Shadows.float,
  },
  resultsScroll: { maxHeight: 288 },
  resultRow: { paddingHorizontal: 4 },
  noResult: { paddingVertical: 18, paddingHorizontal: 4, lineHeight: 20 },

  // --- Carte : pin + dock de validation (calqué sur home.tsx) ---
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

  // --- Détails ---
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    // Même liseré que les deux champs : les trois blocs de l'écran partagent
    // une seule grammaire, au lieu de trois bordures différentes.
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 28,
  },
  addressText: { fontFamily: Poppins.medium, marginTop: 1 },
  label: { marginBottom: 8, marginLeft: 4 },
  labelSpaced: { marginTop: 28 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },

  // Le bleu ne sert qu'aux actions sur cet écran (« Modifier », « Enregistrer ») :
  // un champ au repos ne marque aucun état, il n'a rien à faire en bleu.
  repereField: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 76,
  },
  repereInput: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: Poppins.medium,
    padding: 0,
    lineHeight: 21,
    textAlignVertical: 'top',
  },

  // Un seul traitement de champ sur l'écran — verrouillé ou non, c'est le même
  // bloc ; seul le cadenas distingue le nom figé de Maison / Travail.
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radii.lg,
    paddingHorizontal: 16,
    minHeight: 60,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  fieldIcon: { width: 28, alignItems: 'center' },
  fieldBody: { flex: 1, paddingVertical: 10 },
  fieldInput: { fontSize: 15, color: Colors.textPrimary, fontFamily: Poppins.medium, padding: 0 },
  fieldValue: { fontFamily: Poppins.medium },

  cta: { marginTop: 32 },
  remove: { marginTop: 20, alignSelf: 'center' },
});
