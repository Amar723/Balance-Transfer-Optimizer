import { SavingsResult } from './CalculateSavings';

export type SortOption =
  | 'best_savings'
  | 'longest_promo'
  | 'lowest_transfer_fee'
  | 'lowest_revert_rate';

export type FilterOption = 'no_annual_fee' | 'zero_transfer_fee';

const SORT_LABELS: Record<SortOption, string> = {
  best_savings: 'Best savings',
  longest_promo: 'Longest 0% period',
  lowest_transfer_fee: 'Lowest transfer fee',
  lowest_revert_rate: 'Lowest revert rate',
};

const FILTER_LABELS: Record<FilterOption, string> = {
  no_annual_fee: 'No annual fee',
  zero_transfer_fee: '0% transfer fee',
};

export function getSortLabel(option: SortOption): string {
  return SORT_LABELS[option];
}

export function getFilterLabel(option: FilterOption): string {
  return FILTER_LABELS[option];
}

export const SORT_OPTIONS: readonly SortOption[] = [
  'best_savings',
  'longest_promo',
  'lowest_transfer_fee',
  'lowest_revert_rate',
];

export const FILTER_OPTIONS: readonly FilterOption[] = [
  'no_annual_fee',
  'zero_transfer_fee',
];

function passesFilter(result: SavingsResult, filter: FilterOption): boolean {
  const { offer } = result;
  switch (filter) {
    case 'no_annual_fee':
      return offer.annualFee === 0;
    case 'zero_transfer_fee':
      return (offer.transferFeePercent ?? 0) === 0;
  }
}

function sortKey(result: SavingsResult, sort: SortOption): number {
  const { offer } = result;
  switch (sort) {
    case 'best_savings':
      return -result.totalSavings;
    case 'longest_promo':
      return -(offer.interestFreeMonths ?? 0);
    case 'lowest_transfer_fee':
      return offer.transferFeePercent ?? Number.POSITIVE_INFINITY;
    case 'lowest_revert_rate':
      return offer.revertRate ?? Number.POSITIVE_INFINITY;
  }
}

export function applySortAndFilter(
  results: SavingsResult[],
  sort: SortOption,
  filters: FilterOption[],
): SavingsResult[] {
  const filtered = results.filter((result) =>
    filters.every((filter) => passesFilter(result, filter)),
  );
  return [...filtered].sort((a, b) => sortKey(a, sort) - sortKey(b, sort));
}
