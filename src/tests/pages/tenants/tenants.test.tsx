import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TenantPage from '../../../page/tenants/TenantPage';
import { Provider } from 'react-redux';
import { createMockStore, mockInitialState } from '../../store/mockStore';
import { mockTenantData } from '../mockData';
import { handlers } from './handler';
import { setupServer } from 'msw/node';
import { setTenant } from '@/lib/sdk/litegraph.service';
import { mockTenantGUID } from '../mockData';
import { commonHandlers } from '@/tests/handler';
import { renderWithRedux } from '@/tests/store/utils';

const server = setupServer(...handlers, ...commonHandlers);
setTenant(mockTenantGUID);

describe('TenantsPage', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it.only('renders the tenants page', async () => {
    const { container } = renderWithRedux(<TenantPage />, mockInitialState, undefined, true);

    await waitFor(() => {
      expect(screen.getAllByText(mockTenantData[0].Name).length).toBe(1);
    });
    expect(container).toMatchSnapshot('initial table state');
  });

  it('should display Create Tenant button', () => {
    const { container } = renderWithRedux(<TenantPage />, mockInitialState, undefined, true);

    const createButton = screen.getByRole('button', { name: /create tenant/i });
    expect(createButton).toBeInTheDocument();
    expect(createButton).toBeVisible();
    expect(createButton).toMatchSnapshot();
  });

  it('should create a tenant and should be visible in the table', async () => {
    // Increase timeout for this test
    jest.setTimeout(15000);

    const { container } = renderWithRedux(<TenantPage />, mockInitialState, undefined, true);

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state');

    // Create a new tenant
    const createButton = screen.getByRole('button', { name: /create tenant/i });
    expect(createButton).toMatchSnapshot('create tenant button');
    fireEvent.click(createButton);

    // Take snapshot of create modal
    const createModal = screen.getByRole('dialog');
    expect(createModal).toMatchSnapshot('create tenant modal');

    // Fill in form fields using mock data
    const nameInput = screen.getByPlaceholderText(/enter name/i);
    const activeInput = screen.getByRole('switch');

    fireEvent.change(nameInput, { target: { value: mockTenantData[0].Name } });
    fireEvent.click(activeInput);

    // Take snapshot of filled form
    expect(createModal).toMatchSnapshot('create tenant form with values');

    const submitButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(submitButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state');
  }, 15000); // Add timeout to the test itself

  it('should update tenant successfully', async () => {
    const { container } = renderWithRedux(<TenantPage />, mockInitialState, undefined, true);

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state before update');

    // Find and click the menu button in the Actions column
    const menuButtons = screen.getAllByRole('tenant-action-menu');
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
    expect(updateModal).toMatchSnapshot('update tenant modal');

    // Find and update the form fields
    const nameInput = screen.getByPlaceholderText(/enter name/i);
    const activeInput = screen.getByRole('switch');

    // Use hardcoded values
    const updatedName = 'Updated Tenant Name';
    const updatedActive = false;

    fireEvent.change(nameInput, { target: { value: updatedName } });
    fireEvent.click(activeInput); // Toggle active status

    // Take snapshot of filled form
    expect(updateModal).toMatchSnapshot('update tenant form with values');

    // Find and click the update button in the modal
    const submitButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(submitButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after update');
  });

  it('should delete tenant successfully', async () => {
    const { container } = renderWithRedux(<TenantPage />, mockInitialState, undefined, true);

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state before delete');

    // Find and click the menu button in the Actions column
    const menuButtons = screen.getAllByRole('tenant-action-menu');
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
