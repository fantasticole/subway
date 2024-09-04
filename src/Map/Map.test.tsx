import '@testing-library/jest-dom'

import React from "react";
import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, test } from '@jest/globals';
import { Route, NextStop } from "../utils/interfaces";

import Map from './Map';

import allStations from "../utils/allStations.json";

const HIGHLIGHTS = {
	"112": "class",
	"113": "class",
	"114": "class",
	"115": "class",
}

const STOPS: NextStop[] = [{
	arrival: "2024-09-04T13:03:55-04:00",
	relative: -1,
	stop_id: "G12",
	stop_name: "Grand Av-Newtown",
	route: Route.R,
	trip_id: "071500_A..N55R",
}];

describe('Map', () => {
	beforeEach(async () => {
		await waitFor(() => render(<Map highlights={HIGHLIGHTS} incoming={STOPS}/>));
	});

	test('renders map', async () => {
		const map = screen.getByTestId("map");
		expect(map).toBeInTheDocument();
	});

	test('renders stops', async () => {
		const map = screen.getByTestId("map");
		const stops = within(map).getAllByTestId("stop");
		expect(stops.length).toBe(Object.entries(allStations).length);
	});
});
