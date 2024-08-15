import React from "react";
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders base API response', () => {
  render(<App />);
  const baseApiResponse = screen.getByText("res:");
  expect(baseApiResponse).toBeInTheDocument();
});

test('renders nearby stations API response', () => {
  render(<App />);
  const baseApiResponse = screen.getByText("nearby:");
  expect(baseApiResponse).toBeInTheDocument();
});
