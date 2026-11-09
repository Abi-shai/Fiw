import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/tokens';

// QR code factice — placeholder visuel pour le proto (pas de génération réelle).
// Motif déterministe dérivé d'un seed + 3 « finder patterns » dans les coins,
// pour que ça ressemble à un vrai QR sans dépendance externe.

const N = 17;

function hash(seed: string, i: number) {
  let h = 0;
  for (let k = 0; k < seed.length; k++) h = (h * 31 + seed.charCodeAt(k) + i * 17) % 9973;
  return h;
}

function isFinder(r: number, c: number) {
  const corner = (rr: number, cc: number) => rr < 7 && cc < 7;
  return corner(r, c) || corner(r, N - 1 - c) || corner(N - 1 - r, c);
}

export default function FauxQR({ size = 200 }: { size?: number }) {
  const cell = Math.floor(size / N);
  const dim = cell * N;

  const cells = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      let on: boolean;
      if (isFinder(r, c)) {
        // Anneau du finder pattern : bord plein + centre plein, creux entre les deux.
        const lr = Math.min(r, N - 1 - r) % 7;
        const lc = c < 7 ? c : (N - 1 - c) % 7;
        const ring = lr === 0 || lr === 6 || lc === 0 || lc === 6;
        const core = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
        on = ring || core;
      } else {
        on = hash('AWA2024', r * N + c) % 2 === 0;
      }
      cells.push(
        <View
          key={`${r}-${c}`}
          style={{ width: cell, height: cell, backgroundColor: on ? Colors.textPrimary : 'transparent' }}
        />
      );
    }
  }

  return <View style={[styles.grid, { width: dim, height: dim }]}>{cells}</View>;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
