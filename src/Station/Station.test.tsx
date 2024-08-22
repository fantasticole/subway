import '@testing-library/jest-dom'

import React from "react";
import { render, cleanup, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, test } from '@jest/globals';

import Station from './Station';

import { MOCK_L_STATION } from '../utils/mock_data';

describe('stations along route', () => {
	let station: HTMLElement;

	beforeEach(async () => {
		await waitFor(() => render(<Station station={MOCK_L_STATION} />));
		station = screen.getByTestId("station");
	});

	test('renders stations', async () => {
		expect(station).toBeInTheDocument();
	});

	describe('L Station', () => {
		test('renders station names', async () => {
			const stationName = MOCK_L_STATION.name;
			const stationNameRegEx = new RegExp(stationName, "i");

			const station = screen.getByText(stationNameRegEx);
			expect(station).toBeInTheDocument();
		});

		test('renders station routes', async () => {
			const lRouteList = within(station).getByTestId("routes");
			const lRoutes = within(lRouteList).getAllByTestId("route");

			expect(lRoutes.length).toBe(MOCK_L_STATION.routes.length);
		});

		test('renders northbound trains', async () => {
			const northbound = within(station).getByTestId("north");
			const stops = within(northbound).getAllByTestId("stop");

			expect(stops.length).toBe(MOCK_L_STATION.N.length);
		});

		test('renders southbound trains', async () => {
			const southbound = within(station).getByTestId("south");
			const stops = within(southbound).getAllByTestId("stop");

			expect(stops.length).toBe(MOCK_L_STATION.S.length);
		});
	});
});
