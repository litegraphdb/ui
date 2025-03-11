import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LabelPage from '../../../page/labels/LabelPage';
import { Provider } from 'react-redux';
import { createMockStore } from '../../store/mockStore';
import { mockNodeData, mockEdgeData, mockLabelData } from '../mockData';

jest.mock('@/hooks/entityHooks', () => ({
  useLabels: () => ({
    labelsList: mockLabelData,
    isLoading: false,
    error: null,
    fetchLabelsList: jest.fn(),
    createLabel: jest.fn().mockResolvedValue({
      success: true,
      message: 'Label created successfully',
    }),
    updateLabel: jest.fn().mockResolvedValue({
      success: true,
      message: 'Label updated successfully',
    }),
    deleteLabel: jest.fn().mockResolvedValue({
      success: true,
      message: 'Label deleted successfully',
    }),
  }),
  useNodeAndEdge: () => ({
    nodesList: mockNodeData,
    edgesList: mockEdgeData,
    nodeOptions: mockNodeData.map((node) => ({ label: node.name, value: node.GUID })),
    edgeOptions: mockEdgeData.map((edge) => ({ label: edge.name, value: edge.GUID })),
    fetchNodesAndEdges: jest.fn().mockResolvedValue(true),
    isLoading: false,
    error: null,
  }),
  useSelectedGraph: () => ({
    selectedGraph: mockNodeData[0].GraphGUID,
    setSelectedGraph: jest.fn(),
  }),
  useLayoutContext: () => ({
    isGraphsLoading: false,
    graphError: null,
    refetchGraphs: jest.fn(),
  }),
}));

describe('LabelsPage', () => {
  const store = createMockStore();

  it('renders the labels page', () => {
    render(
      <Provider store={store}>
        <LabelPage />
      </Provider>
    );

    const titleElement = screen.getByText('Labels');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toMatchSnapshot();
  });

  it('should create a label and should be visible in the table', async () => {
    // Increase timeout for this test
    jest.setTimeout(15000);

    const { container } = render(
      <Provider store={store}>
        <LabelPage />
      </Provider>
    );

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state');

    // Create a new label
    const createButton = screen.getByRole('button', { name: /create label/i });
    expect(createButton).toMatchSnapshot('create label button');
    fireEvent.click(createButton);

    // Take snapshot of create modal
    const createModal = screen.getByRole('dialog');
    expect(createModal).toMatchSnapshot('create label modal');

    // Fill in form fields using mock data
    const labelInput = screen.getByPlaceholderText(/enter label label/i);
    const nodeCell = screen.getByText(mockNodeData[0].name);
    const edgeCell = screen.getByText(mockEdgeData[0].name);

    fireEvent.change(labelInput, { target: { value: mockLabelData[0].Label } });
    fireEvent.change(nodeCell, { target: { value: mockNodeData[0].name } });
    fireEvent.change(edgeCell, { target: { value: mockEdgeData[0].name } });

    // Find and interact with the node select
    const nodeSelectContainer = screen.getByTitle('Node');
    fireEvent.mouseDown(nodeSelectContainer);

    // Wait for dropdown options and select the first node
    await waitFor(() => {
      const option = screen.getByText(mockNodeData[0].name);
      fireEvent.click(option);
    });

    // Take snapshot of filled form
    expect(createModal).toMatchSnapshot('create label form with values');

    const submitButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(submitButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state');
  });

  it('should update label successfully', async () => {
    // Increase timeout for this test
    jest.setTimeout(15000);

    const { container } = render(
      <Provider store={store}>
        <LabelPage />
      </Provider>
    );

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state before update');

    // Find and click the menu button in the Actions column
    const menuButtons = screen.getAllByRole('label-action-menu');
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
    expect(updateModal).toMatchSnapshot('update label modal');

    // Find and update the form fields
    const labelInput = screen.getByPlaceholderText(/enter label label/i);
    const nodeCell = screen.getByText(mockNodeData[0].name);
    const edgeCell = screen.getByText(mockEdgeData[0].name);

    // Use hardcoded values
    const updatedLabel = 'Updated Label';
    fireEvent.change(labelInput, { target: { value: updatedLabel } });
    fireEvent.change(nodeCell, { target: { value: mockNodeData[0].name } });
    fireEvent.change(edgeCell, { target: { value: mockEdgeData[0].name } });

    // Find and interact with the edge select
    const edgeSelectContainer = screen.getByTitle('Edge');
    fireEvent.mouseDown(edgeSelectContainer);

    // Wait for dropdown options and select the first edge
    await waitFor(() => {
      const option = screen.getByText(mockEdgeData[0].name);
      fireEvent.click(option);
    });

    expect(updateModal).toMatchSnapshot('update label form with values');

    const submitButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(submitButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after update');
  });

  it('should delete label successfully', async () => {
    const { container } = render(
      <Provider store={store}>
        <LabelPage />
      </Provider>
    );

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state before delete');

    // Find and click the menu button in the Actions column
    const menuButtons = screen.getAllByRole('label-action-menu');
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
