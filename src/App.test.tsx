import '@testing-library/jest-dom'

import React from "react";
import { render, cleanup, screen, waitFor } from '@testing-library/react';
import { describe, expect, test } from '@jest/globals';

import App from './App';

import { MOCK_STATION_LIST } from './utils/mock_data';

beforeEach(() => {
  global.fetch = window.fetch;

  global.fetch = jest.fn(() => Promise.resolve({
      text: () => (JSON.stringify(MOCK_STATION_LIST)),
  })) as jest.Mock;
});

afterEach(cleanup);

test('calls nearby stations API', async () => {
  await waitFor(()=> render(<App />));
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('renders nearby stations updated time', async () => {
  await waitFor(()=> render(<App />));

  const baseApiResponse = screen.getByTestId("updated");
  expect(baseApiResponse).toBeInTheDocument();
});

test('renders nearby stations', async () => {
  await waitFor(()=> render(<App />));

  const station = screen.getByTestId("station");
  expect(station).toBeInTheDocument();
});

describe('stations', () => {
  beforeEach(async () => {
    await waitFor(()=> render(<App />));
  });

  test('renders nearby station names', async () => {
    const name = screen.getByTestId("name");
    expect(name).toBeInTheDocument();
  });

  test('renders nearby station routes', async () => {
    const routes = screen.getByTestId("routes");
    expect(routes).toBeInTheDocument();
  });


  test('renders nearby station locations', async () => {
    const location = screen.getByTestId("location");
    expect(location).toBeInTheDocument();
  });
});
