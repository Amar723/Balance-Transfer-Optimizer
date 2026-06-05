export interface BalanceTransferOffer {
    id: string;
    bank: string;
    cardName: string;
    transferFeePercent: number;
    interestFreeMonths: number;
    revertRate: number;
    annualFee: number;
  }
  
  export const offers: BalanceTransferOffer[] = [
    // fill eventually fill with real data 
  ];