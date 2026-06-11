import { BalanceTransferOffer, offers } from '../../data/balanceTransferOffers';
import {
  calculateSavings,
  isCurrentCard,
  isOfferEligible,
} from '../CalculateSavings';

const baseOffer: BalanceTransferOffer = {
  id: 'test',
  bank: 'Test Bank',
  cardName: 'Test Card',
  transferFeePercent: 2,
  interestFreeMonths: 12,
  revertRate: 20,
  annualFee: 50,
  purchaseRate: 15,
  minCreditLimit: 1000,
  cardType: 'Visa',
  perks: [],
  applyUrl: 'https://example.com',
};

describe('calculateSavings', () => {
  it('computes totalSavings as interest avoided minus transfer and annual fees', () => {
    const debt = 5000;
    const rate = 24; // 2% per month, easy to verify by hand
    const offer = { ...baseOffer, minCreditLimit: 10000 };

    const [result] = calculateSavings(debt, rate, [offer]);

    // 5000 * 0.02 * 12 = 1200 interest avoided
    // 5000 * 0.02 = 100 transfer fee
    // 50 annual fee
    expect(result.interestSavedVsCurrent).toBeCloseTo(1200, 6);
    expect(result.transferFee).toBeCloseTo(100, 6);
    expect(result.totalSavings).toBeCloseTo(1050, 6);
    expect(result.effectiveCost).toBeCloseTo(150, 6);
  });

  it('ranks offers by total savings, highest first', () => {
    const better: BalanceTransferOffer = {
      ...baseOffer,
      id: 'better',
      cardName: 'Better Card',
      interestFreeMonths: 24,
      transferFeePercent: 1,
      annualFee: 0,
      minCreditLimit: 10000,
    };
    const worse: BalanceTransferOffer = {
      ...baseOffer,
      id: 'worse',
      cardName: 'Worse Card',
      interestFreeMonths: 6,
      transferFeePercent: 3,
      annualFee: 100,
      minCreditLimit: 10000,
    };

    const results = calculateSavings(5000, 20, [worse, better]);

    expect(results[0].offer.id).toBe('better');
    expect(results[1].offer.id).toBe('worse');
  });

  it('filters offers the user could not fit their balance onto', () => {
    const tightLimit: BalanceTransferOffer = {
      ...baseOffer,
      id: 'tight',
      minCreditLimit: 6000,
      transferFeePercent: 3,
    };

    expect(isOfferEligible(7000, tightLimit)).toBe(false);
    expect(isOfferEligible(5000, tightLimit)).toBe(true);

    const results = calculateSavings(7000, 20, [tightLimit]);
    expect(results).toHaveLength(0);
  });

  it('excludes the user current card and ignores "Other"', () => {
    const anz = offers.find((o) => o.bank === 'ANZ')!;

    expect(isCurrentCard(anz, 'ANZ Low Rate')).toBe(true);
    expect(isCurrentCard(anz, 'Other')).toBe(false);
    expect(isCurrentCard(anz, undefined)).toBe(false);

    const results = calculateSavings(5000, 20, offers, 'ANZ Low Rate');
    expect(results.find((r) => r.offer.bank === 'ANZ')).toBeUndefined();
  });

  it('returns no results when debt exceeds every offer credit limit', () => {
    const results = calculateSavings(1_000_000, 20, offers);
    expect(results).toEqual([]);
  });
});
