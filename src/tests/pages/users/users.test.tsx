import '@testing-library/jest-dom';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import UserPage from '@/app/admin/dashboard/users/page';
import { createMockInitialState } from '../../store/mockStore';
import { mockTenantGUID, mockUserData } from '../mockData';
import { handlers } from './handler';
import { setupServer } from 'msw/node';
import { setTenant } from '@/lib/sdk/litegraph.service';
import { commonHandlers } from '@/tests/handler';
import { renderWithRedux } from '@/tests/store/utils';
import AddEditUser from '@/page/users/components/AddEditUser';

const server = setupServer(...handlers, ...commonHandlers);
setTenant(mockTenantGUID);

describe('UsersPage', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
  });
  afterAll(() => server.close());

  it('renders the users page', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<UserPage />, initialState, undefined, true);

    await waitFor(() => {
      expect(screen.getAllByText(mockUserData[0].FirstName).length).toBe(2);
    });
    expect(container).toMatchSnapshot('initial table state');
  });

  it('should display Create User button', () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<UserPage />, initialState, undefined, true);

    const createButton = screen.getByRole('button', { name: /create user/i });
    expect(createButton).toBeVisible();
    expect(createButton).toMatchSnapshot();
  });

  it('should create a user and should be visible in the table', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<UserPage />, initialState, undefined, true);

    await waitFor(() => {
      expect(screen.getAllByText(mockUserData[0].FirstName).length).toBe(2);
    });

    const createButton = screen.getByRole('button', { name: /create user/i });
    expect(createButton).toMatchSnapshot('create user button');
    fireEvent.click(createButton);

    const createModal = screen.getByRole('dialog');
    expect(createModal).toMatchSnapshot('create user modal');

    const nameInput = screen.getByPlaceholderText(/enter first name/i);
    const lastNameInput = screen.getByPlaceholderText(/enter last name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/enter password/i);
    const activeInput = screen.getByTestId('active-switch');

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(lastNameInput, { target: { value: 'Test Last Name' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(activeInput);

    const submitButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(submitButton);

    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after creation');
  });

  it('should update user successfully', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<AddEditUser isAddEditUserVisible={true} setIsAddEditUserVisible={() => {}} user={mockUserData[0]} />, initialState, undefined, true);

    const nameInput = screen.getByPlaceholderText(/enter first name/i);
    const lastNameInput = screen.getByPlaceholderText(/enter last name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/enter password/i);
    const activeInput = screen.getByTestId('active-switch');

    fireEvent.change(nameInput, { target: { value: 'Updated User Name' } });
    fireEvent.change(lastNameInput, { target: { value: 'Updated Last Name' } });
    fireEvent.change(emailInput, { target: { value: 'updated@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'updatedpassword' } });
    fireEvent.click(activeInput);

    const submitButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(submitButton);

    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after update');
  });

  it('should delete user successfully', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<UserPage />, initialState, undefined, true);

    await waitFor(() => {
      expect(screen.getAllByText(mockUserData[0].FirstName).length).toBe(2);
    });

    const menuButtons = screen.getAllByRole('user-action-menu');
    expect(menuButtons[0]).toBeInTheDocument();
    fireEvent.click(menuButtons[0]);

    const deleteOption = screen.getByText('Delete');
    expect(deleteOption).toBeInTheDocument();
    fireEvent.click(deleteOption);

    const confirmModal = screen.getByRole('dialog');
    expect(confirmModal).toMatchSnapshot('delete confirmation modal');

    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after deletion');
  });
});