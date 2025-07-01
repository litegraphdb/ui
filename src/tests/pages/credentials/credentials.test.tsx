import '@testing-library/jest-dom';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import CredentialPage from '../../../page/credentials/CredentialPage';
import { mockInitialState } from '../../store/mockStore';
import { mockCredentialData, mockUserData } from '../mockData';
import { commonHandlers } from '@/tests/handler';
import { handlers } from './handler';
import { handlers as usersHandlers } from '../users/handler';
import { setupServer } from 'msw/node';
import { setTenant } from '@/lib/sdk/litegraph.service';
import { mockTenantGUID } from '../mockData';
import { renderWithRedux } from '@/tests/store/utils';

const server = setupServer(...handlers, ...commonHandlers, ...usersHandlers);
setTenant(mockTenantGUID);

describe('CredentialsPage', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it.only('renders the credentials page', async () => {
    const { container } = renderWithRedux(<CredentialPage />, mockInitialState, undefined, true);

    await waitFor(() => {
      expect(screen.getAllByText(mockCredentialData[0].Name).length).toBe(1);
    });
    expect(container).toMatchSnapshot('initial table state');
  });

  it('should display Create Credential button', async () => {
    const { container } = renderWithRedux(<CredentialPage />, mockInitialState, undefined, true);

    const createButton = screen.getByRole('button', { name: /create credential/i });
    expect(createButton).toBeInTheDocument();
    expect(createButton).toBeVisible();
    ``;
    expect(createButton).toMatchSnapshot();
  });

  it('should create a credential and should be visible in the table', async () => {
    // Increase timeout for this test
    jest.setTimeout(15000);

    const { container } = renderWithRedux(<CredentialPage />, mockInitialState, undefined, true);

    // Click create button
    const createButton = screen.getByRole('button', { name: /create credential/i });
    await fireEvent.click(createButton);

    // Wait for modal to appear
    const modal = await screen.findByRole('dialog');
    expect(modal).toBeInTheDocument();

    // Fill in the form
    const nameInput = screen.getByTestId('name-input');
    const userSelect = screen.getByTestId('user-select');

    await fireEvent.change(nameInput, { target: { value: 'Test Credential' } });
    await fireEvent.change(userSelect, { target: { value: mockUserData[0].GUID } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /ok/i });
    await fireEvent.click(submitButton);
  });

  it('should update credential successfully', async () => {
    const { container } = renderWithRedux(<CredentialPage />, mockInitialState, undefined, true);

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state before update');

    // Find and click the menu button in the Actions column
    const menuButtons = screen.getAllByRole('credential-action-menu');
    expect(menuButtons[0]).toBeInTheDocument();
    await fireEvent.click(menuButtons[0]);

    // Wait for dropdown menu and click Edit
    await waitFor(() => {
      const editOption = screen.getByText('Edit');
      expect(editOption).toBeInTheDocument();
      fireEvent.click(editOption);
    });

    // Wait for the update modal to appear and verify it's visible
    const updateModal = await screen.findByRole('dialog');
    expect(updateModal).toBeInTheDocument();
    expect(updateModal).toMatchSnapshot('update credential modal');

    // Find and update the form fields
    const nameInput = screen.getByTestId('name-input');
    const activeInput = screen.getByTestId('active-switch');

    // Use hardcoded values
    const updatedName = 'Updated Credential Name';
    await fireEvent.change(nameInput, { target: { value: updatedName } });
    await fireEvent.click(activeInput); // Toggle active status

    // Take snapshot of filled form
    expect(updateModal).toMatchSnapshot('update credential form with values');

    // Find and click the update button in the modal
    const submitButton = screen.getByRole('button', { name: /ok/i });
    await fireEvent.click(submitButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after update');
  }, 15000);

  it('should delete credential successfully', async () => {
    const { container } = renderWithRedux(<CredentialPage />, mockInitialState, undefined, true);

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state before delete');

    // Find and click the menu button in the Actions column
    const menuButtons = screen.getAllByRole('credential-action-menu');
    expect(menuButtons[0]).toBeInTheDocument();
    await fireEvent.click(menuButtons[0]);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after deletion');
  });
});
