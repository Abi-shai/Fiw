import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Radii, Shadows } from '@/constants/tokens';

export const SHEET_RADIUS = Radii.xl;

const HAIRLINE = StyleSheet.hairlineWidth;

export const sheetSurface: ViewStyle = {
  backgroundColor: Colors.surface,
  borderTopLeftRadius: SHEET_RADIUS,
  borderTopRightRadius: SHEET_RADIUS,
  borderTopWidth: HAIRLINE,
  borderColor: Colors.hairline,
  ...Shadows.sheet,
};

export function Handle({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.handle, style]} />;
}

type SheetProps = {
  children: React.ReactNode;
  floating?: boolean;
  handle?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Sheet({ children, floating, handle, style }: SheetProps) {
  return (
    <View style={[sheetSurface, floating && styles.floating, style]}>
      {handle && (
        <View style={styles.handleArea}>
          <Handle />
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  floating: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
  },
  handleArea: {
    paddingTop: 10,
    paddingBottom: 14,
    alignItems: 'center',
  },
  handle: {
    width: 40, height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
    alignSelf: 'center',
  },
});
