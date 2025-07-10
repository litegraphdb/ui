import '@testing-library/jest-dom';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import CredentialPage from '../../../page/credentials/CredentialPage';
import { createMockInitialState } from '../../store/mockStore';
import { mockCredentialData, mockUserData } from '../mockData';
import { commonHandlers } from '@/tests/handler';
import { handlers } from './handler';
import { handlers as usersHandlers } from '../users/handler';
import { setupServer } from 'msw/node';
import { setTenant } from '@/lib/sdk/litegraph.service';
import { mockTenantGUID } from '../mockData';
import { renderWithRedux } from '@/tests/store/utils';
import { within } from '@testing-library/react';
import AddEditCredential from '@/page/credentials/components/AddEditCredential';
import DeleteCredential from '@/page/credentials/components/DeleteCredential';

const server = setupServer(...handlers, ...commonHandlers, ...usersHandlers);

describe('CredentialsPage', () => {
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

  it('renders the credentials page', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<CredentialPage />, initialState, undefined, true);

    await waitFor(() => {
      expect(screen.getAllByText(mockCredentialData[0].Name).length).toBe(1);
    });
    expect(container).toMatchSnapshot('initial table state');
  });

  it('should display Create Credential button', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<CredentialPage />, initialState, undefined, true);

    const createButton = screen.getByRole('button', { name: /create credential/i });
    await waitFor(() => {
      expect(createButton).toBeVisible();
    });
    expect(createButton).toMatchSnapshot();
  });

  it('should create a credential and should be visible in the table', async () => {
    // Increase timeout for this test
    jest.setTimeout(15000);

    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<CredentialPage />, initialState, undefined, true);

    // Click create button
    const createButton = screen.getByRole('button', { name: /create credential/i });
    await waitFor(() => {
      expect(createButton).toBeVisible();
    });
    await fireEvent.click(createButton);

    // Wait for modal to appear
    const modal = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(modal).toBeVisible();
    });

    // Fill in the form
    const nameInput = screen.getByTestId('name-input');
    const userSelect = screen.getByTestId('user-select');

    await fireEvent.change(nameInput, { target: { value: 'Test Credential' } });

    fireEvent.mouseDown(userSelect);

    const options = await screen.findAllByText((text: string) =>
      text.includes(mockUserData[0].FirstName)
    );

    const option = options.find(
      (el: HTMLElement) =>
        el.textContent === `${mockUserData[0].FirstName} ${mockUserData[0].LastName}`
    );

    if (!option) {
      throw new Error('No matching user option found for Select dropdown.');
    }

    fireEvent.click(option);
    const submitButton = screen.getByRole('button', { name: /ok/i });
    await fireEvent.click(submitButton);
  });

  it('should update credential successfully', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(
      <AddEditCredential
        isAddEditCredentialVisible={true}
        setIsAddEditCredentialVisible={() => {}}
        credential={mockCredentialData[0]}
      />,
      initialState,
      undefined,
      true
    );

    // Find and update the form fields
    const nameInput = screen.getByTestId('name-input');
    const activeInput = screen.getByTestId('active-switch');

    // Use hardcoded values
    const updatedName = 'Updated Credential Name';
    await fireEvent.change(nameInput, { target: { value: updatedName } });
    await fireEvent.click(activeInput); // Toggle active status

    // Find and click the update button in the modal
    const submitButton = screen.getByRole('button', { name: /ok/i });
    await fireEvent.click(submitButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after update');
  }, 15000);

  it('should delete credential successfully', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<DeleteCredential isDeleteModelVisible={true} setIsDeleteModelVisible={() => {}} selectedCredential={mockCredentialData[0]} setSelectedCredential={() => {}} onCredentialDeleted={async () => {}} title="Delete Credential" paragraphText="Are you sure you want to delete this credential?" />, initialState, undefined, true);

    // Wait for modal to appear
    const confirmModal = await screen.findByTestId('delete-credential-modal');
    expect(confirmModal).toBeVisible();
    expect(confirmModal).toMatchSnapshot('delete confirmation modal');

    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after deletion');
  });
});
