import '@testing-library/jest-dom'

import React from "react";
import { render, cleanup, screen, waitFor } from '@testing-library/react';
import { describe, expect, test } from '@jest/globals';

import App from './App';

import {
  fetchRoute,
  fetchRoutes,
} from "./utils/subway_apis";
import { MOCK_STATION_LIST, MOCK_ROUTE_LIST } from './utils/mock_data';
import mockSubwayApis from './utils/mock_subway_apis';

beforeEach(() => {
  const spy = jest.spyOn(global, 'fetch').mockImplementation(mockSubwayApis);
});

afterEach(cleanup);

test('calls routes API', async () => {
  await waitFor(() => render(<App />));

  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test('renders route list', async () => {
  render(<App />)

  await waitFor(() => {
    const stations = screen.getAllByTestId("route");
    expect(stations.length).toBe(MOCK_ROUTE_LIST.data.length);
  });
});

test('renders stations along route updated time ', async () => {
  await waitFor(() => render(<App />));

  const mockTime = MOCK_STATION_LIST.updated.toString();
  const updatedTime = screen.getByText(`updated: ${mockTime}`);
  expect(updatedTime).toBeInTheDocument();
});

describe('stations', () => {
  beforeEach(async () => {
    await waitFor(() => render(<App />));
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
