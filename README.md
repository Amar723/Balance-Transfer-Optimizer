# Balance Transfer Optimizer

A React Native app that helps Australians carrying credit card debt find and compare balance transfer offers. Enter your current balance and interest rate, and the app ranks available offers by estimated savings — with clear fees, revert-rate warnings, and direct apply links.

Built as a take-home project for **Open** (Brief 1B — New Product Feature).

## Problem

Many Australians pay 18–22% interest on revolving credit card balances. Balance transfer promotions — often 0% for 12–26 months — can save hundreds or thousands of dollars, but offers are hard to find and even harder to compare once transfer fees, annual fees, and revert rates are factored in.

## What it does

1. **Input** — Collect current balance, interest rate, and optional current bank.
2. **Match** — Filter offers by eligibility (balance capacity, same-bank exclusion) and rank by net savings.
3. **Compare** — Sort and filter results; view a savings-over-time chart for the top offer.
4. **Act** — "Apply now" opens the provider's public application page.

## Features

- Savings calculator with transfer fees, annual fees, and non-0% promo rates
- Ranked offer cards with "Best match" badge, monthly payoff target, and revert-rate warnings
- Sort by best savings, longest promo, lowest transfer fee, or lowest revert rate
- Filter by no annual fee or 0% transfer fee
- Cumulative interest comparison chart (current card vs. transfer)
- Education screen explaining how balance transfers work and what to watch for

## Tech stack

| Layer      | Choice                                    |
| ---------- | ----------------------------------------- |
| Framework  | React Native 0.85                         |
| Language   | TypeScript                                |
| Navigation | React Navigation (native stack)           |
| Charts     | react-native-chart-kit + react-native-svg |
| Tests      | Jest                                      |

## Project structure

```
src/
├── data/balanceTransferOffers.ts   # Mock offer dataset (12 cards, 4 banks)
├── screens/
│   ├── InputScreen.tsx             # Debt/rate entry form
│   ├── ResultsScreen.tsx           # Ranked offers, sort/filter, chart
│   └── LearnScreen.tsx             # Balance transfer explainer
├── utils/
│   ├── CalculateSavings.ts         # Eligibility + savings engine
│   ├── calculateInterestOverTime.ts
│   └── sortAndFilterOffers.ts
├── components/
│   ├── SavingsChart.tsx
│   └── BankLogo.tsx
└── theme/index.ts                  # Design tokens (aligned with Open Figma reference)
```

## Getting started

### Prerequisites

- Node.js >= 22.11
- [React Native environment](https://reactnative.dev/docs/set-up-your-environment) (Xcode for iOS, Android Studio for Android)

### Install and run

```sh
npm install

# Start Metro
npm start

# In a second terminal — iOS (first time: bundle install && cd ios && bundle exec pod install)
npm run ios

# Or Android
npm run android
```

### Tests

```sh
npm test
```

## How savings are calculated

For each eligible offer, the app estimates savings over the promotional period:

```
interest avoided  = (current rate − promo rate) × balance × months
total fees        = transfer fee + year-1 annual fee + year-2 fee (if promo > 12 months)
net savings       = interest avoided − total fees
```

The chart uses the same assumptions so the headline number and graph stay consistent.

**Eligibility rules (prototype):**

- Debt + transfer fee must fit within the offer's `maxBalanceTransfer` limit
- Same-bank transfers are excluded when the user selects their current provider

## Assumptions and limitations

This is a **prototype**, not financial advice.

- **Mock data** — 12 offers across ANZ, CommBank, ING, and Unloan, based on publicly available terms. Not live or personalised.
- **Simplified model** — Assumes a flat balance with no minimum payments; does not project post-promo interest if debt isn't cleared.
- **No approval modelling** — Does not check credit score, income, or new-customer eligibility.
- **Estimates only** — Actual savings depend on spending behaviour, payment timing, and offer terms at application time.

## Author

Amarprit Singh — [Amar723](https://github.com/Amar723)
