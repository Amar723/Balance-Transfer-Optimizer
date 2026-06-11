import { BalanceTransferOffer } from '../data/balanceTransferOffers';

export interface SavingsResult {
  offer: BalanceTransferOffer;
  transferFee: number;
  interestSavedVsCurrent: number;
  totalSavings: number;
  monthlyPaymentNeeded: number;
  effectiveCost: number;
}

// Hide offers where the user's debt + transfer fee exceeds the card's
// minimum credit limit — they couldn't fit their balance on the new card.
export function isOfferEligible(
  debtAmount: number,
  offer: BalanceTransferOffer,
): boolean {
  const transferFee = debtAmount * (offer.transferFeePercent / 100);
  const amountNeeded = debtAmount + transferFee;
  return amountNeeded <= offer.minCreditLimit;
}

// Most balance transfer providers don't let you transfer between their own
// cards, so hide the offer that matches the user's current card.
export function isCurrentCard(
  offer: BalanceTransferOffer,
  currentCard?: string,
): boolean {
  if (!currentCard || currentCard === 'Other') return false;
  const normalised = currentCard.toLowerCase();
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

  // map over the offers and calculate the savings for each offer
  const results: SavingsResult[] = eligibleOffers.map((offer) => {
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