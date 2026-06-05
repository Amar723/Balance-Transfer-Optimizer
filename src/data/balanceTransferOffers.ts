export interface BalanceTransferOffer {
    id: string;
    bank: string;
    cardName: string;
    transferFeePercent: number;    // one-off fee on transferred amount
    interestFreeMonths: number;    // 0% p.a. period
    revertRate: number;            // interest rate after promo ends
    annualFee: number;             // AUD
    purchaseRate: number;          // standard purchase rate
    minCreditLimit: number;        // AUD
    cardType: 'Visa' | 'Mastercard' | 'Amex';
    perks: string[];               // selling points
    applyUrl: string;
  }
  
  export const offers: BalanceTransferOffer[] = [
    {
      id: '1',
      bank: 'ANZ',
      cardName: 'ANZ Low Rate',
      transferFeePercent: 3,
      interestFreeMonths: 26,
      revertRate: 21.99,
      annualFee: 0,
      purchaseRate: 13.74,
      minCreditLimit: 1000,
      cardType: 'Visa',
      perks: ['Market-leading 26 month offer', '$0 annual fee first year'],
      applyUrl: 'https://www.anz.com.au/personal/credit-cards/low-rate/',
    },
    {
      id: '2',
      bank: 'Latitude',
      cardName: 'Latitude Low Rate Mastercard',
      transferFeePercent: 3,
      interestFreeMonths: 24,
      revertRate: 19.99,
      annualFee: 69,
      purchaseRate: 19.99,
      minCreditLimit: 1000,
      cardType: 'Mastercard',
      perks: ['24 month 0% offer', '$100 Finder reward'],
      applyUrl: 'https://www.latitudefinancial.com.au/credit-cards/low-rate/',
    },
    {
      id: '3',
      bank: 'Westpac',
      cardName: 'Westpac Low Rate',
      transferFeePercent: 2,
      interestFreeMonths: 20,
      revertRate: 20.99,
      annualFee: 59,
      purchaseRate: 13.99,
      minCreditLimit: 500,
      cardType: 'Mastercard',
      perks: ['Low 2% transfer fee', 'Low ongoing purchase rate'],
      applyUrl: 'https://www.westpac.com.au/personal-banking/credit-cards/low-rate/',
    },
    {
      id: '4',
      bank: 'NAB',
      cardName: 'NAB Low Rate',
      transferFeePercent: 3,
      interestFreeMonths: 20,
      revertRate: 21.74,
      annualFee: 59,
      purchaseRate: 13.99,
      minCreditLimit: 1000,
      cardType: 'Visa',
      perks: ['Consolidate multiple debts', 'Low ongoing purchase rate'],
      applyUrl: 'https://www.nab.com.au/personal/credit-cards/nab-low-rate-credit-card',
    },
    {
      id: '5',
      bank: 'CommBank',
      cardName: 'CommBank Low Rate',
      transferFeePercent: 3,
      interestFreeMonths: 12,
      revertRate: 21.99,
      annualFee: 59,
      purchaseRate: 13.99,
      minCreditLimit: 500,
      cardType: 'Mastercard',
      perks: ['Trusted big 4 bank', 'CommBank app integration'],
      applyUrl: 'https://www.commbank.com.au/credit-cards/low-rate.html',
    },
    {
      id: '6',
      bank: 'Heritage Bank',
      cardName: 'Heritage Bank Gold Low Rate',
      transferFeePercent: 0,
      interestFreeMonths: 12,
      revertRate: 17.99,
      annualFee: 0,
      purchaseRate: 17.99,
      minCreditLimit: 500,
      cardType: 'Visa',
      perks: ['No transfer fee', 'No annual fee', 'Best value if cleared in 12 months'],
      applyUrl: 'https://www.heritage.com.au/banking/credit-cards/gold-low-rate',
    },
    {
      id: '7',
      bank: 'Bankwest',
      cardName: 'Bankwest Breeze Platinum',
      transferFeePercent: 2,
      interestFreeMonths: 18,
      revertRate: 20.99,
      annualFee: 99,
      purchaseRate: 12.99,
      minCreditLimit: 6000,
      cardType: 'Mastercard',
      perks: ['Complimentary travel insurance', 'Low purchase rate'],
      applyUrl: 'https://www.bankwest.com.au/personal/credit-cards/breeze-platinum',
    },
    {
      id: '8',
      bank: 'Citi',
      cardName: 'Citi Clear',
      transferFeePercent: 1.5,
      interestFreeMonths: 15,
      revertRate: 22.24,
      annualFee: 99,
      purchaseRate: 14.99,
      minCreditLimit: 2000,
      cardType: 'Mastercard',
      perks: ['Low transfer fee', 'Citi Entertainment access'],
      applyUrl: 'https://www.citi.com.au/credit-cards/citi-clear-credit-card',
    },
  ];