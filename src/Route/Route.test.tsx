import '@testing-library/jest-dom'

import React from "react";
import { render, cleanup, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test } from '@jest/globals';

import Route from './Route';

import {
	// Color,
	Route as RouteData,
	TrainColorMap,
	BlackFontRoutes
} from "../utils/interfaces";

describe('Route', () => {
	describe('without onClick', () => {
		let container: HTMLElement;

		beforeEach(async () => {
			container = render(
				<Route route={RouteData.ONE}/>
			).container;
		});

		test('renders route', async () => {
			const route = screen.getByTestId("route");
			expect(route).toBeInTheDocument();
		});

		test('renders spans', async () => {
			const spans = container.querySelectorAll('span');

			expect(spans.length).toBe(2);
		});

		test('does not render a button', async () => {
			const button = container.querySelector('button');

			expect(button).not.toBeInTheDocument();
		});
	});

	describe('with onClick', () => {
		let container: HTMLElement;
		let mockFn: jest.MockedFunction < () => {} > ;

		beforeEach(async () => {
			mockFn = jest.fn();
			container = render(
				<Route route={RouteData.ONE} onClick={mockFn}/>
			).container;
		});

		test('renders route', async () => {
			const route = screen.getByTestId("route");
			expect(route).toBeInTheDocument();
		});

		test('renders only one span', async () => {
			const spans = container.querySelectorAll('span');

			expect(spans.length).toBe(1);
		});

		test('renders a button', async () => {
			const button = container.querySelector('button');

			expect(button).toBeInTheDocument();
		});

		test('clicking button calls onClick', async () => {
			const route = screen.getByTestId("route");

			expect(mockFn.mock.calls).toHaveLength(0);
			fireEvent.click(route);
			expect(mockFn.mock.calls).toHaveLength(1);
		});
	});

	describe('styles', () => {
		for (let route of Object.values(RouteData)) {
			test('renders correct background color', async () => {
				render(<Route route={route}/>);
				const routeComponent = screen.getByTestId("route");
				const style = window.getComputedStyle(routeComponent);
				const background = style.getPropertyValue("background-color");
				const expectedHex = TrainColorMap[route];
				expect(rgbToHex(background)).toBe(`${expectedHex}`);
			});
		}

		for (let route of Object.values(RouteData)) {
			test('renders correct text color ', async () => {
				render(<Route route={route}/>);
				const routeComponent = screen.getByTestId("route");
				const style = window.getComputedStyle(routeComponent);
				const color = style.getPropertyValue("color");
				const expectedHex = BlackFontRoutes.includes(route) ? "#000000" : "#FFFFFF";
				expect(rgbToHex(color)).toBe(`${expectedHex}`);
			});
		}
	});
});

function rbgStringToValues(rgbString: string) {
	// converts 'rgb(238, 53, 46)' to [238, 53, 46]
	return rgbString.substr(4).slice(0, -1).split(", ").map(Number);
}

function componentToHex(value: number) {
	var hex = value.toString(16);
	return (hex.length == 1 ? "0" + hex : hex).toUpperCase();
}

function rgbToHex(rgb: string) {
	const [r, g, b] = rbgStringToValues(rgb);
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
