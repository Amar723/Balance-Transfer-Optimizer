import { BalanceTransferOffer } from '../data/balanceTransferOffers';

export interface SavingsResult {
  offer: BalanceTransferOffer;
  transferFee: number;
  interestSavedVsCurrent: number;
  totalSavings: number;
  monthlyPaymentNeeded: number;
  effectiveCost: number;
}

// Function is used to calculate the savings for a given debt amount, current interest rate and offers
export function calculateSavings(
  debtAmount: number,
  currentInterestRate: number,
  offers: BalanceTransferOffer[]
): SavingsResult[] {
  // map over the offers and calculate the savings for each offer
  const results: SavingsResult[] = offers.map((offer) => {
    // calculate the interest you'd pay staying on current card over the promo period
    // Interest you'd pay staying on current card over the promo period
    const months = offer.interestFreeMonths;
    const monthlyRate = currentInterestRate / 100 / 12;
    const interestOnCurrentCard = debtAmount * monthlyRate * months;

    // one-off transfer fee
    const transferFee = debtAmount * (offer.transferFeePercent / 100);

    // net savings = interest avoided minus transfer fee minus annual fee
    const totalSavings = interestOnCurrentCard - transferFee - offer.annualFee;

    // monthly payment needed to clear debt within promo period
    const monthlyPaymentNeeded = (debtAmount + transferFee) / months;

    // effective cost of this offer
    const effectiveCost = transferFee + offer.annualFee;

    return {
      offer, // the offer that was used to calculate the savings
      transferFee, // the transfer fee for the offer
      interestSavedVsCurrent: interestOnCurrentCard, // the interest saved vs the current card
      totalSavings, // the total savings for the offer
      monthlyPaymentNeeded, // the monthly payment needed to clear debt within promo period
      effectiveCost, // the effective cost of this offer
    };
  });

  // rank by total savings, highest first
  return results.sort((a, b) => b.totalSavings - a.totalSavings);
}