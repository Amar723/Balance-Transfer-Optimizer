import { BalanceTransferOffer } from '../data/balanceTransferOffers';

export interface SavingsResult {
  offer: BalanceTransferOffer;
  transferFee: number;
  // Gross interest delta during the promo window (current rate minus promo rate).
  interestSavedVsCurrent: number;
  // Interest accrued on the new card during the promo window (non-zero for
  // offers that aren't truly 0%).
  interestOnTransferCard: number;
  // Transfer fee + annual fees charged during the promo window.
  totalFees: number;
  // Net savings after fees and any promo-rate interest.
  totalSavings: number;
  monthlyPaymentNeeded: number;
  effectiveCost: number;
}

// Hide offers where the user's debt + transfer fee exceeds the maximum
// balance the offer can absorb — they couldn't fit their balance on the new card.
export function isOfferEligible(
  debtAmount: number,
  offer: BalanceTransferOffer,
): boolean {
  const transferFee = debtAmount * ((offer.transferFeePercent ?? 0) / 100);
  const amountNeeded = debtAmount + transferFee;
  return amountNeeded <= offer.maxBalanceTransfer;
}

// Most balance transfer providers don't let you transfer between their own
// cards, so hide the offer that matches the user's current card.
export function isCurrentCard(
  offer: BalanceTransferOffer,
  currentCard?: string,
): boolean {
  if (!currentCard || currentCard === 'Other') return false;
  const normalised = currentCard.toLowerCase();
  const bankName = offer.bank.toLowerCase();

  // Same-bank transfers are typically not allowed (picker labels start with bank name).
  if (normalised.startsWith(bankName)) return true;

  const offerName = offer.cardName.toLowerCase();
  return offerName === normalised || offerName.includes(normalised);
}

// Function is used to calculate the savings for a given debt amount, current interest rate and offers
export function calculateSavings(
  debtAmount: number,
  currentInterestRate: number,
  offers: BalanceTransferOffer[],
  currentCard?: string,
): SavingsResult[] {
  const eligibleOffers = offers
    .filter((offer) => isOfferEligible(debtAmount, offer))
    .filter((offer) => !isCurrentCard(offer, currentCard));

  const results: SavingsResult[] = eligibleOffers.map((offer) => {
    const months = offer.interestFreeMonths ?? 0;
    const currentMonthlyRate = currentInterestRate / 100 / 12;
    const promoMonthlyRate = offer.balanceTransferRate / 100 / 12;

    const interestOnCurrentCard = debtAmount * currentMonthlyRate * months;
    const interestOnTransferCard = debtAmount * promoMonthlyRate * months;
    const interestSavedVsCurrent = interestOnCurrentCard - interestOnTransferCard;

    const transferFee = debtAmount * ((offer.transferFeePercent ?? 0) / 100);

    // Charge year-two annual fee when the promo runs beyond 12 months, falling
    // back to the standard annual fee if no post-intro rate is specified.
    const yearOneFee = offer.annualFee;
    const yearTwoFee =
      months > 12 ? (offer.annualFeeAfterFirstYear ?? offer.annualFee) : 0;
    const totalFees = transferFee + yearOneFee + yearTwoFee;

    const totalSavings = interestSavedVsCurrent - totalFees;

    const monthlyPaymentNeeded =
      months > 0 ? (debtAmount + transferFee) / months : 0;

    return {
      offer,
      transferFee,
      interestSavedVsCurrent,
      interestOnTransferCard,
      totalFees,
      totalSavings,
      monthlyPaymentNeeded,
      effectiveCost: totalFees,
    };
  });

  return results.sort((a, b) => b.totalSavings - a.totalSavings);
}