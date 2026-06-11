import { offers } from '../../data/balanceTransferOffers';
import { calculateSavings, SavingsResult } from '../CalculateSavings';
import { applySortAndFilter } from '../sortAndFilterOffers';

const debt = 5000;
const rate = 20.99;

function results(): SavingsResult[] {
  return calculateSavings(debt, rate, offers);
}

describe('applySortAndFilter', () => {
  it('defaults to ordering by best savings (highest first)', () => {
    const sorted = applySortAndFilter(results(), 'best_savings', []);

    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].totalSavings).toBeGreaterThanOrEqual(
        sorted[i].totalSavings,
      );
    }
  });

  it('orders by longest 0% period when sort is longest_promo', () => {
    const sorted = applySortAndFilter(results(), 'longest_promo', []);

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].offer.interestFreeMonths ?? 0;
      const curr = sorted[i].offer.interestFreeMonths ?? 0;
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });

  it('orders by ascending transfer fee when sort is lowest_transfer_fee', () => {
    const sorted = applySortAndFilter(results(), 'lowest_transfer_fee', []);

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].offer.transferFeePercent ?? Infinity;
      const curr = sorted[i].offer.transferFeePercent ?? Infinity;
      expect(prev).toBeLessThanOrEqual(curr);
    }
  });

  it('orders by ascending revert rate when sort is lowest_revert_rate', () => {
    const sorted = applySortAndFilter(results(), 'lowest_revert_rate', []);

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].offer.revertRate ?? Infinity;
      const curr = sorted[i].offer.revertRate ?? Infinity;
      expect(prev).toBeLessThanOrEqual(curr);
    }
  });

  it('returns only offers with no annual fee when filter is no_annual_fee', () => {
    const filtered = applySortAndFilter(results(), 'best_savings', [
      'no_annual_fee',
    ]);

    expect(filtered.length).toBeGreaterThan(0);
    for (const result of filtered) {
      expect(result.offer.annualFee).toBe(0);
    }
  });

  it('returns only offers with a zero transfer fee when filter is zero_transfer_fee', () => {
    const filtered = applySortAndFilter(results(), 'best_savings', [
      'zero_transfer_fee',
    ]);

    for (const result of filtered) {
      expect(result.offer.transferFeePercent ?? 0).toBe(0);
    }
  });

  it('AND-combines multiple filters', () => {
    const filtered = applySortAndFilter(results(), 'best_savings', [
      'no_annual_fee',
      'zero_transfer_fee',
    ]);

    for (const result of filtered) {
      expect(result.offer.annualFee).toBe(0);
      expect(result.offer.transferFeePercent ?? 0).toBe(0);
    }
  });

  it('returns an empty array when filters match nothing without throwing', () => {
    const empty = applySortAndFilter([], 'best_savings', ['no_annual_fee']);
    expect(empty).toEqual([]);
  });

  it('does not mutate the input results array', () => {
    const raw = results();
    const snapshot = raw.map((r) => r.offer.id);

    applySortAndFilter(raw, 'longest_promo', ['no_annual_fee']);

    expect(raw.map((r) => r.offer.id)).toEqual(snapshot);
  });
});
