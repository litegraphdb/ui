import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithRedux } from '../../store/utils';
import { createMockStore } from '../../store/mockStore';
import { fireEvent } from '@testing-library/react';
import { mockGraphData } from '../mockData';
import { LiteGraphSdk } from 'litegraphdb';
import EdgePage from '@/app/dashboard/[tenantId]/edges/page';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { handlers } from './handler';
import { commonHandlers } from '@/tests/handler';
import { setTenant } from '@/lib/sdk/litegraph.service';
import { mockTenantGUID } from '../mockData';

const server = setupServer(...handlers, ...commonHandlers);
setTenant(mockTenantGUID);

let container: any;
describe.skip('EdgePage with Mock API', () => {
  beforeEach(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  const store = createMockStore();

  it('renders the edge page title', async () => {
    const wrapper = renderWithRedux(
      <EdgePage />,
      {
        ...store,
        graphsList: {
          graphs: mockGraphData,
        },
      } as any,
      true
    );

    // Verify the Nodes heading
    const heading = screen.getByTestId('heading');
    expect(heading).toHaveTextContent('Edges');

    // Verify the select dropdown for graphs
    expect(wrapper.container).toMatchSnapshot();
    const graphSelect = screen.getByTestId('litegraph-select');
    expect(graphSelect).toBeInTheDocument();
    expect(graphSelect).toHaveTextContent('Test Demo Graphtestttt 2');

    waitFor(() => {
      // Simulate graph selection
      fireEvent.change(graphSelect, { target: { value: 'd52aeab4-4de7-4076-98dd-461d4a61ac88' } });

      // Verify API Call
      expect((LiteGraphSdk as any).mock.instances[0].readEdges).toHaveBeenCalled();

      expect(screen.getByText('new test 23')).toBeInTheDocument();

      // Verify the create node button
      const createButton = screen.getByRole('button', { name: /create node/i });
      expect(createButton).toBeInTheDocument();
    });
    expect(wrapper.container).toMatchSnapshot();
  });

  it('renders the EdgePage and create edge', async () => {
    const user = userEvent.setup();

    renderWithRedux(
      <EdgePage />,
      {
        ...store,
        graphsList: {
          graphs: mockGraphData,
        },
      } as any,
      true
    );

    // Verify the Nodes heading
    const heading = screen.getByTestId('heading');
    expect(heading).toHaveTextContent('Edges');

    // Verify the select dropdown for graphs
    const graphSelect = screen.getByTestId('litegraph-select');
    expect(graphSelect).toBeInTheDocument();
    expect(graphSelect).toHaveTextContent('Test Demo Graphtestttt 2'); // Adjusted expectation for the mock

    waitFor(async () => {
      // Simulate graph selection
      fireEvent.change(graphSelect, { target: { value: 'd52aeab4-4de7-4076-98dd-461d4a61ac88' } });

      // Verify API Call
      expect((LiteGraphSdk as any).mock.instances[0].readEdges).toHaveBeenCalled();

      expect(screen.getByText('new test 23')).toBeInTheDocument();

      // Verify the create node button
      const createButton = screen.getAllByRole('button', { name: 'Create' });
      await user.click(createButton[0]);

      await user.click(createButton);

      // Fill in the Create Graph Form
      const nameInput = screen.getByTestId('edge-name-input');
      const dataEditor = screen.getByTestId('edge-data-input');

      await user.type(nameInput, 'New Edge');
      fireEvent.change(dataEditor, { target: { value: '{"edge":{}}' } });

      // Submit the Form
      const createNodeButton = screen.getByText('Create');
      await user.click(createNodeButton);

      // Wait for the new graph to appear
      expect(screen.getByText('New Edge')).toBeInTheDocument();

      // Verify API Call
      expect((LiteGraphSdk as any).mock.instances[0].createEdge).toHaveBeenCalledWith({
        GUID: expect.any(String),
        Name: 'New Edge',
        Data: { edge: {} },
      });
    });
  });

  it('renders the EdgePage and update edge', async () => {
    const user = userEvent.setup();

    renderWithRedux(
      <EdgePage />,
      {
        ...store,
        graphsList: {
          graphs: mockGraphData,
        },
      } as any,
      true
    );

    // Verify the Nodes heading
    const heading = screen.getByTestId('heading');
    expect(heading).toBeInTheDocument();

    // Verify the select dropdown for graphs
    const graphSelect = screen.getByTestId('litegraph-select');
    expect(graphSelect).toBeInTheDocument();
    expect(graphSelect).toHaveTextContent('Test Demo Graphtestttt 2'); // Adjusted expectation for the mockk

    waitFor(async () => {
      // Simulate graph selection
      fireEvent.change(graphSelect, { target: { value: 'd52aeab4-4de7-4076-98dd-461d4a61ac88' } });

      // Verify API Call
      expect((LiteGraphSdk as any).mock.instances[0].readEdges).toHaveBeenCalled();

      expect(screen.getByText('new test 23')).toBeInTheDocument();

      // Verify the update node button
      const updateButton = screen.getAllByRole('button', { name: 'Edit' });
      await user.click(updateButton[0]);

      await user.click(updateButton);

      // Fill in the Create Graph Form
      const nameInput = screen.getByTestId('node-name-input');
      const dataEditor = screen.getByTestId('node-data-input');

      await user.type(nameInput, 'New Updated Node');
      fireEvent.change(dataEditor, { target: { value: '{"node":{}}' } });

      // Submit the Form
      const UpdateNodeButton = screen.getByText('Update');
      await user.click(UpdateNodeButton);

      // Wait for the new graph to appear
      expect(screen.getByText('New Updated Node')).toBeInTheDocument();

      // Verify API Call
      expect((LiteGraphSdk as any).mock.instances[0].createNode).toHaveBeenCalledWith({
        GUID: expect.any(String),
        Name: 'New Updated Node',
        Data: { graph: {} },
      });
    });
  });

  it('render fallback message on edge load error', async () => {
    const wrapper = renderWithRedux(
      <EdgePage />,
      {
        ...store,
      } as any,
      true
    );

    waitFor(() => {
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    });

    expect(wrapper.container).toMatchSnapshot();
  });
});
