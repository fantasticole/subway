import '@testing-library/jest-dom'

import React from "react";
import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, test } from '@jest/globals';

import Map from './Map';

import allStations from "../utils/allStations.json";

const HIGHLIGHTS = {
	"112": "class",
	"113": "class",
	"114": "class",
	"115": "class",
}

describe('Map', () => {
	beforeEach(async () => {
		await waitFor(() => render(<Map highlights ={HIGHLIGHTS}/>));
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
