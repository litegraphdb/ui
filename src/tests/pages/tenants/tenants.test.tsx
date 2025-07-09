import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TenantPage from '../../../page/tenants/TenantPage';
import { Provider } from 'react-redux';
import { createMockInitialState } from '../../store/mockStore';
import { mockTenantData } from '../mockData';
import { handlers } from './handler';
import { setupServer } from 'msw/node';
import { setTenant } from '@/lib/sdk/litegraph.service';
import { mockTenantGUID } from '../mockData';
import { commonHandlers } from '@/tests/handler';
import { renderWithRedux } from '@/tests/store/utils';
import AddEditTenant from '@/page/tenants/components/AddEditTenant';
import DeleteTenant from '@/page/tenants/components/DeleteTenant';

const server = setupServer(...handlers, ...commonHandlers);
// setTenant(mockTenantGUID);


describe('TenantsPage', () => {
  beforeAll(() => server.listen());
  beforeEach(() => {
    setTenant(mockTenantGUID); // ensure it's reset before every test
  });
  afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
    jest.clearAllTimers();
  });
  afterAll(() => server.close());

  it('renders the tenants page', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<TenantPage />, initialState, undefined, true);

    await waitFor(() => {
      expect(screen.getAllByText(mockTenantData[0].Name).length).toBe(1);
    });
    expect(container).toMatchSnapshot('initial table state');
  });

  it('should display Create Tenant button', () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<TenantPage />, initialState, undefined, true);

    const createButton = screen.getByRole('button', { name: /create tenant/i });
    expect(createButton).toBeVisible();
    expect(createButton).toMatchSnapshot();
  });

  it('should create a tenant and should be visible in the table', async () => {
    const initialState = createMockInitialState();
    // Increase timeout for this test
    jest.setTimeout(15000);

    const { container } = renderWithRedux(<TenantPage />, initialState, undefined, true);

    // Take initial table snapshot
    // const initialTable = container.querySelector('.ant-table');
    // expect(initialTable).toMatchSnapshot('initial table state');

    // Create a new tenant
    const createButton = screen.getByRole('button', { name: /create tenant/i });
    expect(createButton).toMatchSnapshot('create tenant button');
    fireEvent.click(createButton);

    // Take snapshot of create modal
    // const createModal = screen.getByRole('dialog');
    // expect(createModal).toMatchSnapshot('create tenant modal');

    // Fill in form fields using mock data
    const nameInput = screen.getByPlaceholderText(/enter name/i);
    const activeInput = screen.getByRole('switch');

    fireEvent.change(nameInput, { target: { value: mockTenantData[0].Name } });
    fireEvent.click(activeInput);

    // Take snapshot of filled form
    // expect(createModal).toMatchSnapshot('create tenant form with values');

    const submitButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText(mockTenantData[0].Name).length).toBe(1);
    });

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state');
  }, 15000); // Add timeout to the test itself

  it('should update tenant successfully', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(
      <AddEditTenant
        isAddEditTenantVisible={true}
        setIsAddEditTenantVisible={() => {}}
        tenant={mockTenantData[0]}
      />,
      initialState,
      undefined,
      true
    );

    // // Take initial table snapshot
    // const initialTable = container.querySelector('.ant-table');
    // expect(initialTable).toMatchSnapshot('initial table state before update');

    // // Find and click the menu button in the Actions column
    // const menuButtons = screen.getByRole('tenant-action-menu');
    // expect(menuButtons[0]).toBeVisible();
    // fireEvent.click(menuButtons[0]);

    // // Wait for dropdown menu and click Edit
    // await waitFor(() => {
    //   const editOption = screen.getByText('Edit');
    //   expect(editOption).toBeVisible();
    //   fireEvent.click(editOption);
    // });

    // Wait for the update modal to appear and verify it's visible
    // const updateModal = await screen.findByRole('dialog');
    // expect(updateModal).toBeVisible();
    // expect(updateModal).toMatchSnapshot('update tenant modal');

    // Find and update the form fields
    const nameInput = screen.getByPlaceholderText(/enter name/i);
    const activeInput = screen.getByRole('switch');

    // Use hardcoded values
    const updatedName = 'Updated Tenant Name';
    const updatedActive = false;

    fireEvent.change(nameInput, { target: { value: updatedName } });
    fireEvent.click(activeInput); // Toggle active status

    // Take snapshot of filled form
    // expect(updateModal).toMatchSnapshot('update tenant form with values');

    // Find and click the update button in the modal
    const submitButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(submitButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after update');
  });

  it('should delete tenant successfully', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(
      <DeleteTenant
        isDeleteModelVisible={true}
        setIsDeleteModelVisible={() => {}}
        selectedTenant={mockTenantData[0]}
        setSelectedTenant={() => {}}
        title="Delete Tenant"
        paragraphText="Are you sure you want to delete this tenant?"
        onTenantDeleted={async () => {}}
      />,
      initialState,
      undefined,
      true
    );

    // // Take initial table snapshot
    // const initialTable = container.querySelector('.ant-table');
    // expect(initialTable).toMatchSnapshot('initial table state before delete');

    // // Find and click the menu button in the Actions column
    // const menuButtons = screen.getAllByTestId('tenant-action-menu');
    // expect(menuButtons[0]).toBeVisible();
    // fireEvent.click(menuButtons[0]);

    // // Wait for dropdown menu and click Delete
    // await waitFor(() => {
    //   const deleteOption = screen.getByText('Delete');
    //   expect(deleteOption).toBeVisible();
    //   fireEvent.click(deleteOption);
    // });

    // Wait for the confirmation modal and take snapshot
    const confirmModal = await screen.findByTestId('delete-tenant-modal');
    expect(confirmModal).toBeVisible();
    expect(confirmModal).toMatchSnapshot('delete confirmation modal');

    // Find and click the delete button in the confirmation modal
    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after deletion');
  });
});
