import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { theme } from '../theme';
import { SavingsResult } from '../utils/CalculateSavings';
import {
  calculateInterestOverTime,
  getChartDataPoints,
} from '../utils/calculateInterestOverTime';

interface Props {
  debtAmount: number;
  interestRate: number;
  result: SavingsResult;
}

const CHART_HORIZONTAL_PADDING = theme.spacing.lg * 2;
const CURRENT_CARD_COLOR = theme.colors.error;
const TRANSFER_COLOR = theme.colors.success;

export default function SavingsChart({
  debtAmount,
  interestRate,
  result,
}: Props) {
  const { offer } = result;

  const chartData = useMemo(() => {
    const projection = calculateInterestOverTime(
      debtAmount,
      interestRate,
      offer,
    );
    return getChartDataPoints(projection, {
      withoutTransfer: CURRENT_CARD_COLOR,
      withTransfer: TRANSFER_COLOR,
    });
  }, [debtAmount, interestRate, offer]);

  const chartWidth = Dimensions.get('window').width - CHART_HORIZONTAL_PADDING;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your savings over time</Text>

      <LineChart
        data={chartData}
        width={chartWidth}
        height={220}
        withInnerLines
        withOuterLines={false}
        withDots
        withShadow={false}
        bezier
        yAxisLabel="$"
        formatYLabel={(value) => formatCompactCurrency(Number(value))}
        xAxisLabel=""
        chartConfig={{
          backgroundColor: theme.colors.surface,
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.6})`,
          labelColor: () => theme.colors.textSecondary,
          propsForBackgroundLines: {
            stroke: 'rgba(255, 255, 255, 0.08)',
            strokeDasharray: '0',
          },
          propsForDots: {
            r: '4',
            strokeWidth: '0',
          },
        }}
        style={styles.chart}
      />

      <View style={styles.legendRow}>
        <LegendItem color={CURRENT_CARD_COLOR} label="Current card" />
        <LegendItem color={TRANSFER_COLOR} label="With transfer" />
      </View>

      <Text style={styles.caption}>
        Cumulative interest over {offer.interestFreeMonths} months (estimates
        only)
      </Text>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

// react-native-chart-kit gives us a raw axis number; condense to $1.2k style
// so the y-axis stays legible on a phone.
function formatCompactCurrency(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return `${Math.round(value)}`;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  chart: {
    marginVertical: theme.spacing.xs,
    marginLeft: -theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs + 2,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  caption: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});
