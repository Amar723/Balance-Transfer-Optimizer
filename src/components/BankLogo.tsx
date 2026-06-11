import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import type { BankName } from '../data/balanceTransferOffers';
import { getBankLogo } from '../utils/bankLogos';

type BankLogoProps = {
  bank: BankName;
  size?: number;
};

export default function BankLogo({ bank, size = 48 }: BankLogoProps) {
  const padding = Math.round(size * 0.12);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
      accessibilityRole="image"
      accessibilityLabel={`${bank} logo`}
    >
      <Image
        source={getBankLogo(bank)}
        style={{
          width: size - padding * 2,
          height: size - padding * 2,
        }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECECEC',
    overflow: 'hidden',
  },
});
