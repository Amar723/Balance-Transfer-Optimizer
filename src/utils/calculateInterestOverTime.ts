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
 *  - Transfer fee + annual fee are charged upfront on the new card.
 *  - No interest accrues on the new card during the 0% promo period.
 */
export function calculateInterestOverTime(
  debtAmount: number,
  currentInterestRate: number,
  offer: BalanceTransferOffer,
): InterestOverTimeResult {
  const months = offer.interestFreeMonths;
  const monthlyRate = currentInterestRate / 100 / 12;

  const transferUpfrontCost =
    debtAmount * (offer.transferFeePercent / 100) + offer.annualFee;

  const sampleMonths = pickSampleMonths(months);

  const labels = sampleMonths.map(String);
  const withoutTransfer = sampleMonths.map(
    (m) => debtAmount * monthlyRate * m,
  );
  const withTransfer = sampleMonths.map((m) =>
    m === 0 ? 0 : transferUpfrontCost,
  );

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
