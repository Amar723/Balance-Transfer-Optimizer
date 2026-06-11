/**
 * LearnScreen — short educational explainer for users unfamiliar with balance
 * transfers. Reached from a link on the InputScreen.
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { theme } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type LearnScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Learn'
>;

interface Props {
  navigation: LearnScreenNavigationProp;
}

interface Section {
  title: string;
  body: string;
}

const SECTIONS: readonly Section[] = [
  {
    title: 'What is a balance transfer?',
    body: 'A balance transfer moves debt from your current credit card to a new card that charges little or no interest for a fixed promotional period — often 12 to 26 months.',
  },
  {
    title: 'How it saves you money',
    body: 'During the promo period your balance accrues low or zero interest, so the repayments you make actually reduce the debt instead of mostly covering interest. Most providers charge a one-off transfer fee (typically 1–3%) and some charge an annual fee, but the interest you avoid usually more than covers them.',
  },
  {
    title: 'What to watch for',
    body: 'When the promo ends, any remaining balance flips to the card\'s revert rate, which can be 18–22% p.a. New purchases on the card are usually charged at the full purchase rate from day one. Missing a minimum payment can also cancel the 0% offer.',
  },
  {
    title: 'Before you apply',
    body: 'Plan to clear the transferred balance within the promo window — work out the monthly payment needed before you commit. You also can\'t usually transfer between cards from the same bank, so the offers shown will exclude your current provider.',
  },
];

export default function LearnScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>How balance transfers work</Text>
        <Text style={styles.subtitle}>
          A two-minute primer so the numbers on the next screen actually mean
          something.
        </Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <Text style={styles.footnote}>
          Estimates only · Based on publicly available balance transfer offers
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
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
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  sectionBody: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  footnote: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    lineHeight: 16,
  },
});
