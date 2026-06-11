import { BalanceTransferOffer, offers } from '../../data/balanceTransferOffers';
import {
  calculateSavings,
  isCurrentCard,
  isOfferEligible,
} from '../CalculateSavings';

const baseOffer: BalanceTransferOffer = {
  id: 'test',
  bank: 'Test Bank' as any,
  cardName: 'Test Card',
  transferFeePercent: 2,
  interestFreeMonths: 12,
  balanceTransferRate: 0,
  revertRate: 20,
  annualFee: 50,
  purchaseRate: 15,
  minCreditLimit: 1000,
  maxBalanceTransfer: 15000,
  cardType: 'Visa',
  category: 'Balance Transfer',
  perks: [],
  applyUrl: 'https://example.com',
  source: 'test fixture',
  lastChecked: '2026-06-11',
};

describe('calculateSavings', () => {
  it('computes totalSavings as interest avoided minus transfer and annual fees', () => {
    const debt = 5000;
    const rate = 24; // 2% per month, easy to verify by hand
    const offer = { ...baseOffer, maxBalanceTransfer: 10000 };

    const [result] = calculateSavings(debt, rate, [offer]);

    // 5000 * 0.02 * 12 = 1200 interest avoided
    // 5000 * 0.02 = 100 transfer fee
    // 50 annual fee, no year-two fee (months = 12, not > 12)
    expect(result.interestSavedVsCurrent).toBeCloseTo(1200, 6);
    expect(result.interestOnTransferCard).toBeCloseTo(0, 6);
    expect(result.transferFee).toBeCloseTo(100, 6);
    expect(result.totalFees).toBeCloseTo(150, 6);
    expect(result.totalSavings).toBeCloseTo(1050, 6);
    expect(result.effectiveCost).toBeCloseTo(150, 6);
  });

  it('subtracts promo-rate interest when balanceTransferRate is non-zero', () => {
    // 1% per month at 12% p.a. — easy to verify by hand
    const offer: BalanceTransferOffer = {
      ...baseOffer,
      id: 'non-zero-promo',
      balanceTransferRate: 12,
      transferFeePercent: 0,
      annualFee: 0,
    };

    const [result] = calculateSavings(5000, 24, [offer]);

    // current interest: 5000 * 0.02 * 12 = 1200
    // promo interest:   5000 * 0.01 * 12 =  600
    expect(result.interestOnTransferCard).toBeCloseTo(600, 6);
    expect(result.interestSavedVsCurrent).toBeCloseTo(600, 6);
    expect(result.totalFees).toBeCloseTo(0, 6);
    expect(result.totalSavings).toBeCloseTo(600, 6);
  });

  it('charges the year-two annual fee when the promo runs beyond 12 months', () => {
    const offer: BalanceTransferOffer = {
      ...baseOffer,
      id: 'long-promo',
      interestFreeMonths: 26,
      annualFee: 0,
      annualFeeAfterFirstYear: 58,
      transferFeePercent: 3,
    };

    const [result] = calculateSavings(5000, 24, [offer]);

    // transfer fee = 5000 * 0.03 = 150
    // year-one fee = 0, year-two fee = 58
    expect(result.transferFee).toBeCloseTo(150, 6);
    expect(result.totalFees).toBeCloseTo(208, 6);
  });

  it('ranks offers by total savings, highest first', () => {
    const better: BalanceTransferOffer = {
      ...baseOffer,
      id: 'better',
      cardName: 'Better Card',
      interestFreeMonths: 24,
      transferFeePercent: 1,
      annualFee: 0,
      maxBalanceTransfer: 30000,
    };
    const worse: BalanceTransferOffer = {
      ...baseOffer,
      id: 'worse',
      cardName: 'Worse Card',
      interestFreeMonths: 6,
      transferFeePercent: 3,
      annualFee: 100,
      maxBalanceTransfer: 30000,
    };

    const results = calculateSavings(5000, 20, [worse, better]);

    expect(results[0].offer.id).toBe('better');
    expect(results[1].offer.id).toBe('worse');
  });

  it('filters offers the user could not fit their balance onto', () => {
    const tightLimit: BalanceTransferOffer = {
      ...baseOffer,
      id: 'tight',
      maxBalanceTransfer: 5000,
      transferFeePercent: 3,
    };

    // 5000 * 1.03 = 5150 > 5000 → can't fit
    expect(isOfferEligible(5000, tightLimit)).toBe(false);
    // 4500 * 1.03 = 4635 ≤ 5000 → fits
    expect(isOfferEligible(4500, tightLimit)).toBe(true);

    const results = calculateSavings(5000, 20, [tightLimit]);
    expect(results).toHaveLength(0);
  });

  it('surfaces multiple offers for a $5k / 20% scenario', () => {
    // Validation target for the eligibility fix: $5k should produce
    // most of the catalogue, not only one or two cards.
    const results = calculateSavings(5000, 20, offers);
    expect(results.length).toBeGreaterThanOrEqual(8);
  });

  it('excludes the user current card and ignores "Other"', () => {
    const anz = offers.find((o) => o.bank === 'ANZ')!;

    // Both bank-level (current picker) and full card-name labels should match.
    expect(isCurrentCard(anz, 'ANZ')).toBe(true);
    expect(isCurrentCard(anz, 'ANZ Low Rate')).toBe(true);
    expect(isCurrentCard(anz, 'Other')).toBe(false);
    expect(isCurrentCard(anz, undefined)).toBe(false);

    const results = calculateSavings(5000, 20, offers, 'ANZ');
    expect(results.find((r) => r.offer.bank === 'ANZ')).toBeUndefined();
  });

  it('returns no results when debt exceeds every offer maxBalanceTransfer', () => {
    const results = calculateSavings(1_000_000, 20, offers);
    expect(results).toEqual([]);
  });
});
