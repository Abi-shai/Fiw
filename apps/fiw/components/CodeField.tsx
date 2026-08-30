import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, type StyleProp, type ViewStyle } from 'react-native';
import { Colors, Radii, Strokes } from '@/constants/tokens';
import Text from '@/components/Text';

type Props = {
  /** Chiffres saisis (mode `saisie`) ou code à restituer (mode `lecture`). */
  code: string;
  /** Nombre de cases. 4 partout dans le produit aujourd'hui. */
  length?: number;
  /**
   * `saisie` — le Client tape le code : la case courante porte le curseur.
   * `lecture` — le code est donné à lire (code de remise d'un Colis) : cases
   * pleines, sans liseré. Ça se lit à voix haute, ça ne se remplit pas.
   */
  mode?: 'saisie' | 'lecture';
  /** Code refusé : les cases passent au liseré `error` et les chiffres à l'encre rouge. */
  error?: boolean;
  style?: StyleProp<ViewStyle>;
};

const CELL_W = 60;
const CELL_H = 68;

/**
 * Le composant code du produit — un seul objet pour les deux gestes, là où le
 * code en avait deux (les cases de `otp.tsx` / `compte/numero.tsx` d'un côté,
 * `CodePill` de l'autre). Miroir du set Figma `CodeField`.
 *
 * Trois règles, tirées du relevé mobile (Chime, Wise, State Farm, Afterpay pour
 * la banque ; Urban Company, Agoda, Tesla, Oportun pour la vérification) :
 *
 * 1. **Une case au repos garde toujours son liseré** — c'est elle qui annonce
 *    combien de chiffres on attend.
 * 2. **La case active se marque par son LISERÉ, pas par un fond teinté.** Un seul
 *    accent à l'écran, et il est là où l'on écrit.
 * 3. **Une case remplie redevient ordinaire** : seul le chiffre la distingue.
 *
 * Le chiffre est en **encre** et non en `primary` — le bleu n'appartient qu'à la
 * case active.
 */
export default function CodeField({
  code, length = 4, mode = 'saisie', error, style,
}: Props) {
  const chars = code.split('').slice(0, length);
  const activeIndex = mode === 'saisie' && !error ? chars.length : -1;

  // Le curseur clignote : la maquette ne peut pas le dire, mais un curseur figé
  // dans une app en marche se lit comme un champ bloqué.
  const blink = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (activeIndex < 0 || activeIndex >= length) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0, duration: 480, delay: 420, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 480, delay: 120, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [activeIndex, length]);

  return (
    <View style={[styles.row, style]}>
      {Array.from({ length }).map((_, i) => {
        const char = chars[i] ?? '';
        const active = i === activeIndex;
        const lecture = mode === 'lecture';
        return (
          <View
            key={i}
            style={[
              styles.cell,
              lecture ? styles.cellLecture : styles.cellRepos,
              error && styles.cellErreur,
              active && styles.cellActive,
            ]}
          >
            {active && !char ? (
              <Animated.View style={[styles.caret, { opacity: blink }]} />
            ) : (
              <Text variant="codeCell" color={error ? Colors.error : Colors.textPrimary}>{char}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  cell: {
    width: CELL_W, height: CELL_H,
    borderRadius: Radii.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  cellRepos: {
    backgroundColor: Colors.surface,
    borderWidth: Strokes.thin, borderColor: Colors.border,
  },
  // Restitution : pas un champ. Pleine, sans liseré, elle ne se touche pas.
  cellLecture: { backgroundColor: Colors.track },
  cellActive: {
    backgroundColor: Colors.surface,
    borderWidth: Strokes.thick, borderColor: Colors.primary,
  },
  cellErreur: {
    backgroundColor: Colors.surface,
    borderWidth: Strokes.thick, borderColor: Colors.error,
  },
  caret: { width: 2, height: 28, borderRadius: Radii.pill, backgroundColor: Colors.primary },
});
