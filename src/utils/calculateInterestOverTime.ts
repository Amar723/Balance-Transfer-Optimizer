import { BalanceTransferOffer } from '../data/balanceTransferOffers';

export interface InterestOverTimeResult {
  labels: string[];
  withoutTransfer: number[];
  withTransfer: number[];
  crossoverMonth: number | null;
}

export interface ChartDataset {
  data: number[];
  color?: (opacity: number) => string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  legend?: string[];
}

// Pick ~5-7 evenly spaced sample months (always including 0 and the final month)
// so the line chart stays readable on a phone screen.
function pickSampleMonths(totalMonths: number, maxPoints = 6): number[] {
  if (totalMonths <= 0) return [0];
  if (totalMonths <= maxPoints) {
    return Array.from({ length: totalMonths + 1 }, (_, i) => i);
  }

  const step = totalMonths / maxPoints;
  const points: number[] = [];
  for (let i = 0; i <= maxPoints; i++) {
    points.push(Math.round(i * step));
  }
  points[points.length - 1] = totalMonths;
  return points;
}

/**
 * Projects cumulative interest paid month-by-month, comparing staying on the
 * current card against switching to the given balance transfer offer.
 *
 * Assumptions are intentionally aligned with `calculateSavings` so the chart
 * and the headline savings number tell the same story:
 *  - Balance is held constant over the promo window (no principal payments).
 *  - Transfer fee + year-one annual fee are charged upfront on the new card.
 *  - Year-two annual fee (if any) is charged at month 12 when the promo runs longer.
 *  - Interest may accrue on the new card at `balanceTransferRate` (zero for true 0% offers).
 */
export function calculateInterestOverTime(
  debtAmount: number,
  currentInterestRate: number,
  offer: BalanceTransferOffer,
): InterestOverTimeResult {
  const months = offer.interestFreeMonths ?? 0;
  const currentMonthlyRate = currentInterestRate / 100 / 12;
  const promoMonthlyRate = offer.balanceTransferRate / 100 / 12;

  const transferFee = debtAmount * ((offer.transferFeePercent ?? 0) / 100);
  const upfrontCost = transferFee + offer.annualFee;
  const yearTwoFee =
    months > 12 ? (offer.annualFeeAfterFirstYear ?? offer.annualFee) : 0;

  const sampleMonths = pickSampleMonths(months);

  const labels = sampleMonths.map(String);
  const withoutTransfer = sampleMonths.map(
    (m) => debtAmount * currentMonthlyRate * m,
  );
  const withTransfer = sampleMonths.map((m) => {
    if (m === 0) return 0;
    const promoInterest = debtAmount * promoMonthlyRate * m;
    const annualFeesSoFar = m >= 12 ? offer.annualFee + yearTwoFee : offer.annualFee;
    return transferFee + annualFeesSoFar + promoInterest;
  });

  let crossoverMonth: number | null = null;
  for (let i = 0; i < sampleMonths.length; i++) {
    if (withTransfer[i] < withoutTransfer[i]) {
      crossoverMonth = sampleMonths[i];
      break;
    }
  }

  return { labels, withoutTransfer, withTransfer, crossoverMonth };
}

/**
 * Shapes the projection into the structure react-native-chart-kit's LineChart
 * expects. Colors are injected by the caller so the chart component owns
 * theme concerns.
 */
export function getChartDataPoints(
  projection: InterestOverTimeResult,
  colors: { withoutTransfer: string; withTransfer: string },
): ChartData {
  const toColorFn = (hex: string) => (opacity: number) =>
    hexToRgba(hex, opacity);

  return {
    labels: projection.labels,
    datasets: [
      {
        data: projection.withoutTransfer,
        color: toColorFn(colors.withoutTransfer),
      },
      {
        data: projection.withTransfer,
        color: toColorFn(colors.withTransfer),
      },
    ],
    legend: ['Current card', 'With transfer'],
  };
}

function hexToRgba(hex: string, opacity: number): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
