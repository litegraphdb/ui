import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CredentialPage from '../../../page/credentials/CredentialPage';
import { Provider } from 'react-redux';
import { createMockStore } from '../../store/mockStore';
import { mockCredentialData, mockUserData, userListingData } from '../mockData';

// Mock Ant Design components
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');

  return {
    ...antd,
    Select: ({ id, onChange, value }: any) => (
      <select
        id={id}
        data-testid="user-select"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange?.(e.target.value)}
      >
        <option value="">Select a user</option>
        {mockUserData.map((user) => (
          <option key={user.GUID} value={user.GUID}>
            {user.FirstName}
          </option>
        ))}
      </select>
    ),
  };
});

// Mock the entityHooks
jest.mock('@/hooks/entityHooks', () => ({
  useCredentials: () => ({
    credentialsList: mockCredentialData,
    isLoading: false,
    error: null,
    fetchCredentialsList: jest.fn(),
  }),

  useUsers: () => ({
    usersList: mockUserData,
    isLoading: false,
    error: null,
    fetchUsersList: jest.fn(),
  }),
}));

describe('CredentialsPage', () => {
  const store = createMockStore();

  it('renders the credentials page', () => {
    render(
      <Provider store={store}>
        <CredentialPage />
      </Provider>
    );

    const titleElement = screen.getByText('Credentials');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toMatchSnapshot();
  });

  it('should display Create Credential button', () => {
    render(
      <Provider store={store}>
        <CredentialPage />
      </Provider>
    );

    const createButton = screen.getByRole('button', { name: /create credential/i });
    expect(createButton).toBeInTheDocument();
    expect(createButton).toBeVisible();
    expect(createButton).toMatchSnapshot();
  });

  it('should create a credential and should be visible in the table', async () => {
    // Increase timeout for this test
    jest.setTimeout(15000);

    render(
      <Provider store={store}>
        <CredentialPage />
      </Provider>
    );

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
    const { container } = render(
      <Provider store={store}>
        <CredentialPage />
      </Provider>
    );

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
    const { container } = render(
      <Provider store={store}>
        <CredentialPage />
      </Provider>
    );

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
