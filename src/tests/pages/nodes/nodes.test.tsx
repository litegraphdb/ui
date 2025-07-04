import '@testing-library/jest-dom';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import NodePage from '../../../page/nodes/NodePage';
import { mockInitialState } from '../../store/mockStore';
import { mockNodeData } from '../mockData';
import { setupServer } from 'msw/node';
import { handlers } from './handler';
import { commonHandlers } from '@/tests/handler';
import { setTenant } from '@/lib/sdk/litegraph.service';
import { mockTenantGUID } from '../mockData';
import { renderWithRedux } from '@/tests/store/utils';

const server = setupServer(...handlers, ...commonHandlers);
setTenant(mockTenantGUID);

describe.skip('NodesPage', () => {
  beforeEach(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the nodes page', async () => {
    const { container } = renderWithRedux(<NodePage />, mockInitialState, true);

    await waitFor(() => {
      expect(screen.getAllByText(mockNodeData[0].Name).length).toBe(1);
    });
    expect(container).toMatchSnapshot('initial table state');
  });

  it('should create a node and should be visible in the table', async () => {
    const { container } = renderWithRedux(<NodePage />, mockInitialState, true);

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state');

    // Create a new node
    const createButton = screen.getByRole('button', { name: /create node/i });
    expect(createButton).toMatchSnapshot('create node button');
    fireEvent.click(createButton);

    // Take snapshot of create modal
    const createModal = screen.getByRole('dialog');
    expect(createModal).toMatchSnapshot('create node modal');

    const nameInput = screen.getByTestId('node-name-input');

    fireEvent.change(nameInput, { target: { value: mockNodeData[0].Name } });

    // Take snapshot of filled form
    expect(createModal).toMatchSnapshot('create node form with values');

    const submitButton = screen.getByTestId('add-node-submit-button');
    fireEvent.click(submitButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state');
  });

  it('should update node successfully', async () => {
    const { container } = renderWithRedux(<NodePage />, mockInitialState, true);

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state before update');

    // Find and click the menu button in the Actions column
    const menuButtons = screen.getAllByRole('node-action-menu');
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
    expect(updateModal).toMatchSnapshot('update node modal');

    // Find and update the form fields
    const nameInput = screen.getByTestId('node-name-input');
    // Use hardcoded values
    const updatedName = 'Updated Node Name';
    fireEvent.change(nameInput, { target: { value: updatedName } });

    expect(updateModal).toMatchSnapshot('update node form with values');

    const submitButton = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after update');
  });

  it('should delete node successfully', async () => {
    const { container } = renderWithRedux(<NodePage />, mockInitialState, true);

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state before delete');
    await waitFor(() => {
      expect(screen.getByText('My updated test node')).toBeInTheDocument();
    });

    // Find and click the menu button in the Actions column
    const menuButtons = screen.getAllByRole('node-action-menu');
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
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after deletion');
  });
});
