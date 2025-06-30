import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserPage from '../../../page/users/UserPage';
import { Provider } from 'react-redux';
import { createMockStore } from '../../store/mockStore';
import { mockTenantData, mockUserData } from '../mockData';

jest.mock('@/hooks/entityHooks', () => ({
  useSelectedTenant: () => ({
    tenant: mockTenantData[0],
  }),
  useUsers: () => ({
    usersList: mockUserData,
    isLoading: false,
    error: null,
    fetchUsersList: jest.fn(),
  }),
}));

describe('UsersPage', () => {
  const store = createMockStore();

  it('renders the users page', () => {
    render(
      <Provider store={store}>
        <UserPage />
      </Provider>
    );

    const titleElement = screen.getByText('Users');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toMatchSnapshot();
  });

  // it('displays a list of users', async () => {

  // });

  it('should create a user and should be visible in the table', async () => {
    const { container } = render(
      <Provider store={store}>
        <UserPage />
      </Provider>
    );

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state');

    // Create a new user
    const createButton = screen.getByRole('button', { name: /create user/i });
    expect(createButton).toMatchSnapshot('create user button');
    fireEvent.click(createButton);

    // Take snapshot of create modal
    const createModal = screen.getByRole('dialog');
    expect(createModal).toMatchSnapshot('create user modal');

    // Fill in form fields using mock data
    const nameInput = screen.getByPlaceholderText(/enter first name/i);
    const lastNameInput = screen.getByPlaceholderText(/enter last name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/enter password/i);
    const activeInput = screen.getByRole('switch');

    fireEvent.change(nameInput, { target: { value: mockUserData[0].FirstName } });
    fireEvent.change(lastNameInput, { target: { value: mockUserData[0].LastName } });
    fireEvent.change(emailInput, { target: { value: mockUserData[0].Email } });
    fireEvent.change(passwordInput, { target: { value: mockUserData[0].Password } });
    fireEvent.click(activeInput);

    // Take snapshot of filled form
    expect(createModal).toMatchSnapshot('create user form with values');

    const submitButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(submitButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state');
  });

  it('should update user successfully', async () => {
    const { container } = render(
      <Provider store={store}>
        <UserPage />
      </Provider>
    );

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state before update');

    // Find and click the menu button in the Actions column
    const menuButtons = screen.getAllByRole('user-action-menu');
    expect(menuButtons[0]).toBeInTheDocument();
    fireEvent.click(menuButtons[0]);

    // Wait for dropdown menu and click Edit
    await waitFor(() => {
      const editOption = screen.getByText('Edit');
      expect(editOption).toBeInTheDocument();
      fireEvent.click(editOption);
    });

    // Wait for the update modal to appear and verify it's visible
    const updateModal = await screen.findByRole('dialog');
    expect(updateModal).toBeInTheDocument();
    expect(updateModal).toMatchSnapshot('update user modal');

    // Find and update the form fields
    const nameInput = screen.getByPlaceholderText(/enter first name/i);
    const lastNameInput = screen.getByPlaceholderText(/enter last name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/enter password/i);
    const activeInput = screen.getByRole('switch');

    // Use hardcoded values
    const updatedName = 'Updated User Name';
    const updatedLastName = 'Updated Last Name';
    const updatedEmail = 'updated@example.com';
    const updatedPassword = 'updatedpassword';

    fireEvent.change(nameInput, { target: { value: updatedName } });
    fireEvent.change(lastNameInput, { target: { value: updatedLastName } });
    fireEvent.change(emailInput, { target: { value: updatedEmail } });
    fireEvent.change(passwordInput, { target: { value: updatedPassword } });
    fireEvent.click(activeInput); // Toggle active status

    expect(updateModal).toMatchSnapshot('update user form with values');

    const submitButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(submitButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after update');
  });

  it('should delete user successfully', async () => {
    const { container } = render(
      <Provider store={store}>
        <UserPage />
      </Provider>
    );

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state before delete');

    // Find and click the menu button in the Actions column
    const menuButtons = screen.getAllByRole('user-action-menu');
    expect(menuButtons[0]).toBeInTheDocument();
    fireEvent.click(menuButtons[0]);

    // Wait for dropdown menu and click Delete
    await waitFor(() => {
      const deleteOption = screen.getByText('Delete');
      expect(deleteOption).toBeInTheDocument();
      fireEvent.click(deleteOption);
    });

    // Wait for the confirmation modal and take snapshot
    const confirmModal = await screen.findByRole('dialog');
    expect(confirmModal).toBeInTheDocument();
    expect(confirmModal).toMatchSnapshot('delete confirmation modal');

    // Find and click the delete button in the confirmation modal
    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after deletion');
  });
});
