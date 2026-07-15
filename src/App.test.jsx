import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

let originalFetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  window.location.hash = '#/';
  globalThis.fetch = vi.fn().mockResolvedValue({
    json: vi.fn().mockResolvedValue({
      results: {
        bindings: [],
      },
    }),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  globalThis.fetch = originalFetch;
  window.location.hash = '#/';
});

it('starts up and renders the main navigation', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /reconciliation service test bench/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /services/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /test bench 1.0/i })).toBeInTheDocument();
});

it('renders services table content on the default route', () => {
  render(<App />);

  expect(screen.getByText(/this table lists reconciliation services known to/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /add a service/i })).toBeInTheDocument();
});

it('renders the client endpoint form when navigating to test bench route', () => {
  window.location.hash = '#/client/';

  render(<App />);

  expect(screen.getByLabelText(/endpoint:/i)).toBeInTheDocument();
  expect(screen.getByText(/this form lets you test a reconciliation endpoint interactively/i)).toBeInTheDocument();
});
