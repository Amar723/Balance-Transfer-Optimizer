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

  it('matches calculateSavings interestSavedVsCurrent at the final sampled month', () => {
    const result = calculateInterestOverTime(debt, rate, topOffer.offer);
    const lastIdx = result.labels.length - 1;

    expect(result.withoutTransfer[lastIdx]).toBeCloseTo(
      topOffer.interestSavedVsCurrent,
      6,
    );
  });

  it('reports cumulative transfer cost equal to transferFee + annualFee at the final sampled month', () => {
    const result = calculateInterestOverTime(debt, rate, topOffer.offer);
    const lastIdx = result.labels.length - 1;
    const expected = topOffer.transferFee + topOffer.offer.annualFee;

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
});
