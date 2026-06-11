/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

// Stub the navigator so this smoke test doesn't pull @react-navigation's
// ESM build through Jest, which the default RN preset can't transform.
jest.mock('../src/navigation/AppNavigator', () => {
  const ReactMock = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => ReactMock.createElement(View, { testID: 'app-navigator' }),
  };
});

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
