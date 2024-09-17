import '@testing-library/jest-dom'

import React from "react";
import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, test } from '@jest/globals';
import { Socket } from "socket.io-client";

import { Route, NextStop } from "../utils/interfaces";
import { MOCK_TRAIN } from '../utils/mock_data';
import allStations from "../utils/allStations.json";

import Map from './Map';

const HIGHLIGHTS = {
	"112": "class",
	"113": "class",
	"114": "class",
	"115": "class",
}

describe('Map', () => {
	beforeEach(async () => {
		await waitFor(() => render(<Map highlights={HIGHLIGHTS}
																		selectedRoute={Route.A} />));
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
