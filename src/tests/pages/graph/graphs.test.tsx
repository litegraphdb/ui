import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GraphPage from '@/app/dashboard/[tenantId]/graphs/page';
import { renderWithRedux } from '../../store/utils';
import { createMockStore } from '../../store/mockStore';
import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LiteGraphSdk } from 'litegraphdb';

let container: any;
describe('GraphPage with Mock API', () => {
  afterEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });
  const store = createMockStore();

  it('renders the graph page title', async () => {
    let wrapper = renderWithRedux(<GraphPage />, store as any);

    expect(screen.getByText('Graphs')).toBeInTheDocument();
    waitFor(() => {
      expect(screen.getByText('Test Demo Graph')).toBeInTheDocument();
      expect(screen.getByText('Create Graph')).toBeInTheDocument();
    });
    expect(wrapper.container).toMatchSnapshot();
  });

  it('renders the GraphPage and handles create graph', async () => {
    const user = userEvent.setup();

    // Render GraphPage with Redux
    renderWithRedux(<GraphPage />, store as any);

    // Verify initial state
    expect(screen.getByText('Graphs')).toBeInTheDocument();

    waitFor(async () => {
      expect(screen.getByText('Test Demo Graph')).toBeInTheDocument();
      expect(screen.getByText('Create Graph')).toBeInTheDocument();

      // Trigger Create Graph Modal
      const createGraphButton = screen.getAllByRole('button', { name: 'Create' });
      await user.click(createGraphButton[0]);

      // Fill in the Create Graph Form
      const nameInput = screen.getByTestId('graph-name-input');
      const dataEditor = screen.getByTestId('graph-data-input');

      await user.type(nameInput, 'New Graph');
      fireEvent.change(dataEditor, { target: { value: '{"graph":{}}' } });

      // Submit the Form
      const createButton = screen.getByText('Create');
      await user.click(createButton);

      // Wait for the new graph to appear
      expect(screen.getByText('New Graph')).toBeInTheDocument();

      // Verify API Call
      expect((LiteGraphSdk as any).mock.instances[0].createGraph).toHaveBeenCalledWith({
        GUID: expect.any(String),
        Name: 'New Graph',
        Data: { graph: {} },
      });
    });
  });

  it('renders the GraphPage and handles edit graph', async () => {
    const user = userEvent.setup();

    // Render GraphPage with Redux
    renderWithRedux(<GraphPage />, store as any);

    // Verify initial state
    expect(screen.getByText('Graphs')).toBeInTheDocument();

    waitFor(async () => {
      expect(screen.getByText('Test Demo Graph')).toBeInTheDocument();
      expect(screen.getByText('Create Graph')).toBeInTheDocument();

      // Locate and click the Edit button for the first graph
      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      await user.click(editButtons[0]);

      // Verify that the edit modal opens
      expect(screen.getByText('Edit Graph')).toBeInTheDocument();

      // Locate the input for the graph name and change its value
      const nameInput = screen.getByLabelText('Name');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Graph');

      // Locate and click the Save button
      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(screen.getByText('Updated Graph')).toBeInTheDocument();

      // Verify that the API call to update the graph was made
      expect((LiteGraphSdk as any).mock.instances[0].updateGraph).toHaveBeenCalledWith({
        GUID: 'e6d4294e-6f49-4d67-8260-5e44c2b077a6',
        Name: 'Updated Graph',
        Data: {},
      });
    });
  });

  it('renders the GraphPage and handles delete graph', async () => {
    const user = userEvent.setup();

    // Render GraphPage with Redux
    const wrapper = renderWithRedux(<GraphPage />, store as any);

    // Verify initial state
    expect(screen.getByText('Graphs')).toBeInTheDocument();

    waitFor(async () => {
      expect(screen.getByText('Test Demo Graph')).toBeInTheDocument();
      expect(screen.getByText('Create Graph')).toBeInTheDocument();

      // Locate and click the Edit button for the first graph
      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      await user.click(deleteButtons[0]);

      // Verify the delete confirmation modal opens
      expect(screen.getByText('Are you sure you want to delete this graph?')).toBeInTheDocument();

      // Locate and click the Confirm button in the delete modal
      const confirmButton = screen.getByText('Confirm');
      await user.click(confirmButton);

      // Wait for the graph to be removed from the UI
      expect(screen.queryByText('Test Demo Graph')).not.toBeInTheDocument();

      // Verify that the API call to delete the graph was made
      expect((LiteGraphSdk as any).mock.instances[0].deleteGraph).toHaveBeenCalledWith({
        GUID: 'e6d4294e-6f49-4d67-8260-5e44c2b077a6',
      });

      // Snapshot to confirm UI changes
      expect(wrapper.container).toMatchSnapshot();
    });
  });

  it('renders the GraphPage and sorts graph data by name', async () => {
    const user = userEvent.setup();

    // Render GraphPage with Redux
    const wrapper = renderWithRedux(<GraphPage />, store as any);

    // Verify initial state
    expect(screen.getByText('Graphs')).toBeInTheDocument();

    waitFor(async () => {
      expect(screen.getByText('Test Demo Graph')).toBeInTheDocument();
      expect(screen.getByText('Create Graph')).toBeInTheDocument();

      // Locate and click the "Name" column header for sorting
      const nameHeader = screen.getByRole('columnheader', { name: 'Name' });
      await user.click(nameHeader);

      // Verify sorting order after clicking "Name" header
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Test Demo Graph');
      expect(rows[2]).toHaveTextContent('Updated Graph');

      // Click the "Name" column header again to reverse the sorting
      await user.click(nameHeader);

      // Verify reversed sorting order
      const reversedRows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Updated  graph');
      expect(rows[2]).toHaveTextContent('test demo Graph');
    });
  });

  it('render fallback message on graph load error', async () => {
    const wrapper = renderWithRedux(<GraphPage />, {
      ...store,
    } as any);

    waitFor(() => {
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    });

    expect(wrapper.container).toMatchSnapshot();
  });
});
