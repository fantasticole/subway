import '@testing-library/jest-dom'

import React from "react";
import { render, cleanup, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, test } from '@jest/globals';

import App from './App';

import {
  MOCK_L_STATION,
  MOCK_G_STATION,
  MOCK_ROUTE_LIST,
  MOCK_STATION_LIST,
} from './utils/mockData';
import mockSubwayApis from './utils/mockSubwayApis';

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
    const routeList = screen.getByTestId("route-list");
    const routes = within(routeList).getAllByTestId("route");
    expect(routeList).toBeInTheDocument();
    expect(routes.length).toBe(MOCK_ROUTE_LIST.data.length);
  });
});

test('renders stations along route updated time ', async () => {
  render(<App />);

  const mockTime = MOCK_STATION_LIST.updated.toString();
  await waitFor(() => {
    const updatedTime = screen.getByText(`updated: ${mockTime}`);
    expect(updatedTime).toBeInTheDocument();
  });
});

describe('stations along route', () => {
  beforeEach(async () => {
    await waitFor(() => render(<App />));
  });

  test('renders stations', async () => {
    await waitFor(() => {
      const stations = screen.getAllByTestId("station");
      expect(stations.length).toBe(MOCK_STATION_LIST.data.length);
    });
  });

  test('renders L station', async () => {
    await waitFor(() => {
      const allStations = screen.getAllByTestId("station");
      const lStation = allStations[0];
      expect(lStation).toBeInTheDocument();
    });
  });

  describe('G Station', () => {
    let gStation: HTMLElement;

    beforeEach(async () => {
      await waitFor(() => {
        const allStations = screen.getAllByTestId("station");
        gStation = allStations[1];
      });
    });

    test('renders station names', async () => {
      const gStationName = MOCK_G_STATION.name;
      const gStationNameRegEx = new RegExp(gStationName, "i");

      const gStation = screen.getByText(gStationNameRegEx);
      expect(gStation).toBeInTheDocument();
    });

    test('renders station routes', async () => {
      const gRouteList = within(gStation).getByTestId("routes");
      const gRoutes = within(gRouteList).getAllByTestId("route");

      expect(gRoutes.length).toBe(MOCK_G_STATION.routes.length);
    });

    test('renders northbound trains', async () => {
      const northbound = within(gStation).getByTestId("north");
      const incomings = within(northbound).getAllByTestId("incoming");

      expect(incomings.length).toBe(MOCK_G_STATION.N.length);
    });

    test('renders southbound trains', async () => {
      const southbound = within(gStation).getByTestId("south");
      const incomings = within(southbound).getAllByTestId("incoming");

      expect(incomings.length).toBe(MOCK_G_STATION.S.length);
    });
  });
});

describe('Map', () => {
  beforeEach(async () => {
    await waitFor(() => render(<App />));
  });

  test('renders map', async () => {
    const map = screen.getByTestId("map");
    expect(map).toBeInTheDocument();
  });
});
