import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { offers } from '../data/balanceTransferOffers';
import { calculateSavings, SavingsResult } from '../utils/CalculateSavings';
import {
  applySortAndFilter,
  FILTER_OPTIONS,
  FilterOption,
  getFilterLabel,
  getSortLabel,
  SORT_OPTIONS,
  SortOption,
} from '../utils/sortAndFilterOffers';
import BankLogo from '../components/BankLogo';
import SavingsChart from '../components/SavingsChart';

export default function ResultsScreen({ route, navigation }: any) {
  const { debtAmount, interestRate, currentCard } = route.params;
  const [results, setResults] = useState<SavingsResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>('best_savings');
  const [filters, setFilters] = useState<FilterOption[]>([]);

  const displayedResults = useMemo(
    () => applySortAndFilter(results, sort, filters),
    [results, sort, filters],
  );

  const toggleFilter = useCallback((filter: FilterOption) => {
    setFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    );
  }, []);

  useEffect(() => {
    // Simulate brief loading for UX
    setTimeout(() => {
      const calculated = calculateSavings(
        debtAmount,
        interestRate,
        offers,
        currentCard,
      );
      setResults(calculated);
      setLoading(false);
    }, 800);
  }, [debtAmount, interestRate, currentCard]);

  const formatCurrency = (amount: number) =>
    `$${Math.abs(amount).toLocaleString('en-AU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  const handleApply = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {
      // Silently ignore — opening external URLs can fail on simulators
      // without browsers and we don't want to crash the results flow.
    });
  }, []);

  const renderCard = ({
    item,
    index,
  }: {
    item: SavingsResult;
    index: number;
  }) => {
    const revertRate = item.offer.revertRate;
    const revertHigherThanCurrent =
      revertRate != null && revertRate > interestRate;

    return (
    <View style={[styles.card, index === 0 && styles.topCard]}>
      {index === 0 && (
        <View style={styles.bestBadge}>
          <Text style={styles.bestBadgeText}>⭐ Best match</Text>
        </View>
      )}

      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <BankLogo bank={item.offer.bank} />
          <View style={styles.cardTitleText}>
            <Text style={styles.bankName}>{item.offer.bank}</Text>
            <Text style={styles.cardName}>{item.offer.cardName}</Text>
          </View>
        </View>
        <View style={styles.savingsContainer}>
          <Text style={styles.savingsAmount}>
            {formatCurrency(item.totalSavings)}
          </Text>
          <Text style={styles.savingsLabel}>saved</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {item.offer.interestFreeMonths} mo
          </Text>
          <Text style={styles.statLabel}>0% period</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.offer.transferFeePercent}%</Text>
          <Text style={styles.statLabel}>Transfer fee</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.offer.revertRate}%</Text>
          <Text style={styles.statLabel}>Revert rate</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {formatCurrency(item.offer.annualFee)}
          </Text>
          <Text style={styles.statLabel}>Annual fee</Text>
        </View>
      </View>

      <View style={styles.paymentHint}>
        <Text style={styles.paymentHintText}>
          Pay {formatCurrency(item.monthlyPaymentNeeded)}/mo to clear debt in{' '}
          {item.offer.interestFreeMonths} months
        </Text>
      </View>

      {revertRate != null && (
        <View
          style={[
            styles.revertHint,
            revertHigherThanCurrent && styles.revertHintCaution,
          ]}
        >
          <Text
            style={[
              styles.revertHintText,
              revertHigherThanCurrent && styles.revertHintTextCaution,
            ]}
          >
            {revertHigherThanCurrent
              ? `Heads up: any balance left after ${item.offer.interestFreeMonths} months reverts to ${revertRate}% p.a. — higher than your current ${interestRate}%.`
              : `If you don't clear the balance in ${item.offer.interestFreeMonths} months, the revert rate is ${revertRate}% p.a.`}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => handleApply(item.offer.applyUrl)}
        accessibilityRole="link"
        accessibilityLabel={`Apply for ${item.offer.bank} ${item.offer.cardName}`}
      >
        <Text style={styles.applyButtonText}>Apply now →</Text>
      </TouchableOpacity>
    </View>
  );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Finding your best offers...</Text>
      </SafeAreaView>
    );
  }

  if (results.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>No eligible offers</Text>
          <Text style={styles.emptyText}>
            We couldn't match your balance to any of the offers we track.
            Try adjusting your debt amount and search again.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Adjust your details"
          >
            <Text style={styles.emptyButtonText}>Adjust details</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const topSaving = results[0]?.totalSavings ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={displayedResults}
        keyExtractor={item => item.offer.id}
        renderItem={renderCard}
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Your Results</Text>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>You could save up to</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrency(topSaving)}
              </Text>
              <Text style={styles.summarySubtext}>
                based on {formatCurrency(debtAmount)} at {interestRate}% p.a.
              </Text>
            </View>

            {results[0] && (
              <SavingsChart
                debtAmount={debtAmount}
                interestRate={interestRate}
                result={results[0]}
              />
            )}

            <Text style={styles.chipGroupLabel}>Sort by</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {SORT_OPTIONS.map(option => {
                const active = sort === option;
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setSort(option)}
                    style={[styles.chip, active && styles.chipActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`Sort by ${getSortLabel(option)}`}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active && styles.chipTextActive,
                      ]}
                    >
                      {getSortLabel(option)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.chipGroupLabel}>Filter</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {FILTER_OPTIONS.map(option => {
                const active = filters.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => toggleFilter(option)}
                    style={[styles.chip, active && styles.chipActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`Filter by ${getFilterLabel(option)}`}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active && styles.chipTextActive,
                      ]}
                    >
                      {getFilterLabel(option)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.noFilterMatch}>
            No offers match your current filters. Try removing one to see more
            results.
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  emptyText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: '#FFFFFF',
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    marginBottom: theme.spacing.md,
  },
  backText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  summaryBox: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: theme.spacing.xs,
  },
  summaryAmount: {
    fontSize: 48,
    fontWeight: theme.typography.weights.bold,
    color: '#FFFFFF',
  },
  summarySubtext: {
    fontSize: theme.typography.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: theme.spacing.xs,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  topCard: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  bestBadge: {
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  bestBadgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  cardTitleText: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  bankName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  cardName: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  savingsContainer: {
    alignItems: 'flex-end',
  },
  savingsAmount: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.success,
  },
  savingsLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  paymentHint: {
    backgroundColor: '#F0FDF4',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  paymentHintText: {
    fontSize: theme.typography.sizes.xs,
    color: '#166534',
    textAlign: 'center',
  },
  revertHint: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  revertHintCaution: {
    backgroundColor: 'rgba(255, 68, 68, 0.12)',
  },
  revertHintText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  revertHintTextCaution: {
    color: theme.colors.error,
  },
  chipGroupLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.lg,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: theme.typography.weights.semibold,
  },
  noFilterMatch: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    lineHeight: 20,
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  applyButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: '#FFFFFF',
  },
});
