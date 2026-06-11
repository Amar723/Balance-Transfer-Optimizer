import { offers } from '../../data/balanceTransferOffers';
import { calculateSavings } from '../CalculateSavings';
import { calculateInterestOverTime } from '../calculateInterestOverTime';

describe('calculateInterestOverTime', () => {
  const debt = 5000;
  const rate = 20.99;
  const topOffer = calculateSavings(debt, rate, offers)[0];

  it('reports zero interest at month 0 for both scenarios', () => {
    const result = calculateInterestOverTime(debt, rate, topOffer.offer);

    expect(result.withoutTransfer[0]).toBe(0);
    expect(result.withTransfer[0]).toBe(0);
  });

  it('matches the current-card interest at the final sampled month', () => {
    const result = calculateInterestOverTime(debt, rate, topOffer.offer);
    const lastIdx = result.labels.length - 1;
    const months = topOffer.offer.interestFreeMonths ?? 0;
    const expected = debt * (rate / 100 / 12) * months;

    expect(result.withoutTransfer[lastIdx]).toBeCloseTo(expected, 6);
  });

  it('reports cumulative transfer cost equal to totalFees + promo interest at the final sampled month', () => {
    const result = calculateInterestOverTime(debt, rate, topOffer.offer);
    const lastIdx = result.labels.length - 1;
    const expected = topOffer.totalFees + topOffer.interestOnTransferCard;

    expect(result.withTransfer[lastIdx]).toBeCloseTo(expected, 6);
  });

  it('shows the transfer line below the current-card line at the final month when the offer is the top match', () => {
    const result = calculateInterestOverTime(debt, rate, topOffer.offer);
    const lastIdx = result.labels.length - 1;

    expect(result.withTransfer[lastIdx]).toBeLessThan(
      result.withoutTransfer[lastIdx],
    );
  });

  it('always includes month 0 and the final promo month in labels', () => {
    const result = calculateInterestOverTime(debt, rate, topOffer.offer);

    expect(result.labels[0]).toBe('0');
    expect(result.labels[result.labels.length - 1]).toBe(
      String(topOffer.offer.interestFreeMonths),
    );
  });

  it('accrues interest on the new card when balanceTransferRate is non-zero', () => {
    const nonZeroOffer = offers.find((o) => o.balanceTransferRate > 0);
    if (!nonZeroOffer) {
      throw new Error('Expected at least one non-zero promo offer in fixture');
    }

    const result = calculateInterestOverTime(debt, rate, nonZeroOffer);
    const lastIdx = result.labels.length - 1;
    const months = nonZeroOffer.interestFreeMonths ?? 0;

    const transferFee = debt * ((nonZeroOffer.transferFeePercent ?? 0) / 100);
    const promoInterest =
      debt * (nonZeroOffer.balanceTransferRate / 100 / 12) * months;
    const expected = transferFee + nonZeroOffer.annualFee + promoInterest;

    expect(result.withTransfer[lastIdx]).toBeCloseTo(expected, 6);
    expect(result.withTransfer[lastIdx]).toBeGreaterThan(
      transferFee + nonZeroOffer.annualFee,
    );
  });
});
