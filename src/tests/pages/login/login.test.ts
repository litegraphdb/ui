import '@testing-library/jest-dom';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { createMockInitialState } from '../../store/mockStore';
import { mockTenantData } from '../mockData';
import { renderWithRedux } from '@/tests/store/utils';
import { getServer } from '@/tests/server';
import { handlers } from './handler';
import { commonHandlers } from '@/tests/handler';
import LoginPageComponent from '@/page/login/LoginPage';

const server = getServer([...commonHandlers, ...handlers]);
const LoginPage = () => React.createElement(LoginPageComponent);

describe('LoginPage', () => {
  beforeAll(() => {
    server.listen();
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render the LoginPage', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(LoginPage(), initialState, undefined, true);

    await waitFor(() => {
      expect(screen.getByText('LiteGraph Server URL')).toBeVisible();
      expect(screen.getByPlaceholderText('https://your-litegraph-server.com')).toBeVisible();
    });
    expect(container).toMatchSnapshot('initial login step');

    const nextButton = screen.getByRole('button', { name: /next/i });
    await waitFor(() => {
      expect(nextButton).toBeVisible();
    });
  });

  it('should display server URL input field', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(LoginPage(), initialState, undefined, true);

    const urlInput = screen.getByPlaceholderText('https://your-litegraph-server.com');
    await waitFor(() => {
      expect(urlInput).toBeVisible();
    });
    expect(urlInput).toMatchSnapshot();
  });
});
