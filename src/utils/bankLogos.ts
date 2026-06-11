import { ImageSourcePropType } from 'react-native';

import type { BankName } from '../data/balanceTransferOffers';

const bankLogos: Record<BankName, ImageSourcePropType> = {
  ANZ: require('../assets/banks/anz.png'),
  CommBank: require('../assets/banks/commbank.png'),
  ING: require('../assets/banks/ing.png'),
  Unloan: require('../assets/banks/unloan.png'),
};

export function getBankLogo(bank: BankName): ImageSourcePropType {
  return bankLogos[bank];
}
