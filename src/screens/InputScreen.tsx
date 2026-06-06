/**
 * InputScreen Balance Transfer Calculator entry form.
 * 
 * Collects the users current credit card balance, interest rate and their card name, 
 * then navigates to Results Screen
 */

import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { theme } from '../theme';
import type { RootStackParamList } from '../navigation/types';

// Domain constants - single source of truth

const BALANCE_TRANSFER_LIMITS = {
  MAX_DEBT_AUD: 100_000,
  MAX_INTEREST_RATE_PCT: 30,
} as const;

const COMMON_CARDS: readonly string[] = [
  'ANZ Low Rate',
  'CommBank Low Rate',
  'NAB Low Rate',
  'Westpac Low Rate',
  'Citi Clear',
  'Bankwest Breeze',
  'Other',
];

// Validation
export interface FormErrors {
  debtAmount?: string;
  interestRate?: string;
}

export interface FormValues {
  debtAmount: string;
  interestRate: string;
}


export function validateTransferForm({ debtAmount, interestRate }: FormValues): FormErrors {
  const errors: FormErrors = {};

  const debt = parseFloat(debtAmount);

  // Validate debt amount
  if (!debtAmount || isNaN(debt) || debt <= 0) {
    errors.debtAmount = 'Please enter a valid debt amount';
  } else if (debt > BALANCE_TRANSFER_LIMITS.MAX_DEBT_AUD) {
    errors.debtAmount = `Maximum balance transfer is $${BALANCE_TRANSFER_LIMITS.MAX_DEBT_AUD.toLocaleString()}`;
  }

  // Validate interest rate
  const rate = parseFloat(interestRate);
  if (!interestRate || isNaN(rate) || rate <= 0) {
    errors.interestRate = 'Please enter a valid interest rate';
  } else if (rate > BALANCE_TRANSFER_LIMITS.MAX_INTEREST_RATE_PCT) {
    errors.interestRate = `Rate above ${BALANCE_TRANSFER_LIMITS.MAX_INTEREST_RATE_PCT}% — please double-check`;
  }

  return errors;
}


// Types
type InputScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Input'>;

interface Props {
  navigation: InputScreenNavigationProp;
}


// Component
export default function InputScreen({ navigation }: Props) {
  const [debtAmount, setDebtAmount] = useState(''); // current debt amount
  const [interestRate, setInterestRate] = useState(''); // current interest rate
  const [selectedCard, setSelectedCard] = useState<string | undefined>(undefined); // which card the user selected
  const [showCardPicker, setShowCardPicker] = useState(false); // whether or not we show the card picker
  const [errors, setErrors] = useState<FormErrors>({}); // any errors that occur during validation

  // strip anything that isn't a digit or a single decimal point
  const sanitiseNumeric = (text: string): string =>
    text.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

  // clear the error for a given field
  const clearFieldError = useCallback(
    (field: keyof FormErrors) => {
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [errors],
  );


  // handle debt amount change
  const handleDebtChange = useCallback(
    (text: string) => {
      setDebtAmount(sanitiseNumeric(text));
      clearFieldError('debtAmount');
    },
    [clearFieldError],
  );

  // handle interest rate change
  const handleRateChange = useCallback(
    (text: string) => {
      setInterestRate(sanitiseNumeric(text));
      clearFieldError('interestRate');
    },
    [clearFieldError],
  );

  // handle card select
  const handleCardSelect = useCallback((card: string) => {
    setSelectedCard(card);
    setShowCardPicker(false);
  }, []);

  // handle form submission
  const handleSubmit = useCallback(() => {
    const validationErrors = validateTransferForm({ debtAmount, interestRate });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    navigation.navigate('Results', {
      debtAmount: parseFloat(debtAmount),
      interestRate: parseFloat(interestRate),
      currentCard: selectedCard,
    });
  }, [debtAmount, interestRate, selectedCard, navigation]);


  // render the input screen
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.heroGlowOuter} />
            <View style={styles.heroGlowInner} />

            <View style={styles.heroContent}>
              <View style={styles.badge}>
                <Text style={styles.badgeIcon}>◆</Text>
                <Text style={styles.badgeText}>BALANCE TRANSFER ENGINE</Text>
              </View>

              <Text style={styles.heroTitle}>
                We'll start by asking a few questions about your credit card
              </Text>
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Current balance owing</Text>
              <View style={[styles.inputWrapper, errors.debtAmount ? styles.inputError : null]}>
                <Text style={styles.prefix} accessibilityElementsHidden>
                  $
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 5000"
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                  value={debtAmount}
                  onChangeText={handleDebtChange}
                  placeholderTextColor={theme.colors.textMuted}
                  accessibilityLabel="Current balance owing in dollars"
                  accessibilityHint="Enter the amount you currently owe on your credit card"
                />
              </View>
              {errors.debtAmount ? (
                <Text style={styles.errorText} accessibilityLiveRegion="polite">
                  {errors.debtAmount}
                </Text>
              ) : null}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Current interest rate</Text>
              <View style={[styles.inputWrapper, errors.interestRate ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 20.99"
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  value={interestRate}
                  onChangeText={handleRateChange}
                  placeholderTextColor={theme.colors.textMuted}
                  accessibilityLabel="Current annual interest rate as a percentage"
                  accessibilityHint="Enter the percentage interest rate shown on your credit card statement"
                />
                <Text style={styles.suffix} accessibilityElementsHidden>
                  % p.a.
                </Text>
              </View>
              {errors.interestRate ? (
                <Text style={styles.errorText} accessibilityLiveRegion="polite">
                  {errors.interestRate}
                </Text>
              ) : null}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Current card <Text style={styles.optional}>(optional)</Text>
              </Text>
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setShowCardPicker((prev) => !prev)}
                accessibilityRole="combobox"
                accessibilityLabel="Select your current card"
                accessibilityState={{ expanded: showCardPicker }}
              >
                <Text
                  style={[styles.pickerText, !selectedCard && styles.pickerPlaceholder]}
                  numberOfLines={1}
                >
                  {selectedCard ?? 'Select your current card'}
                </Text>
                <Text style={styles.suffix} accessibilityElementsHidden>
                  {showCardPicker ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {showCardPicker && (
                <View style={styles.dropdown}>
                  {COMMON_CARDS.map((card) => (
                    <TouchableOpacity
                      key={card}
                      style={styles.dropdownItem}
                      onPress={() => handleCardSelect(card)}
                      accessibilityRole="menuitem"
                      accessibilityLabel={card}
                    >
                      <Text style={styles.dropdownText}>{card}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <Text style={styles.disclaimer}>
              The average Australian carries $3,200 in credit card debt at ~20% interest — that's
              $640/year in unnecessary interest charges.
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmit}
              accessibilityRole="button"
              accessibilityLabel="Find my savings"
            >
              <Text style={styles.primaryButtonText}>Find my savings (2 mins)</Text>
            </TouchableOpacity>

            <View style={styles.orDivider}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSubmit}
              accessibilityRole="button"
              accessibilityLabel="Skip card selection and find savings"
            >
              <Text style={styles.secondaryButtonText}>Skip card selection (30s)</Text>
            </TouchableOpacity>

            <Text style={styles.footerNote}>
              Estimates only · Based on publicly available balance transfer offers
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


// Styles
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },

  hero: {
    height: 300,
    backgroundColor: theme.colors.heroDark,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroGlowOuter: {
    position: 'absolute',
    bottom: -80,
    right: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: theme.colors.heroGlow,
    opacity: 0.35,
  },
  heroGlowInner: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.colors.primaryLight,
    opacity: 0.5,
  },
  heroContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.buttonPrimary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs + 2,
    marginBottom: theme.spacing.md,
    gap: 6,
  },
  badgeIcon: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.buttonPrimaryText,
  },
  badgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.buttonPrimaryText,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
    lineHeight: 28,
    maxWidth: 320,
  },

  formSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  fieldContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  optional: {
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textMuted,
    textTransform: 'none',
    letterSpacing: 0,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.button,
    paddingHorizontal: theme.spacing.md,
    height: 52,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  prefix: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  suffix: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },

  pickerText: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  pickerPlaceholder: {
    color: theme.colors.textMuted,
  },
  dropdown: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.button,
    marginTop: theme.spacing.xs,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dropdownText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },

  disclaimer: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginTop: theme.spacing.sm,
  },

  footer: {
    marginTop: 'auto',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  primaryButton: {
    backgroundColor: theme.colors.buttonPrimary,
    borderRadius: theme.borderRadius.button,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.buttonPrimaryText,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  orText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.md,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.borderRadius.button,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
  footerNote: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    lineHeight: 16,
  },
});
