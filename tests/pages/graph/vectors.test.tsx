import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VectorPage from '../../../page/vectors/VectorPage';
import { Provider } from 'react-redux';
import { createMockStore } from '../../store/mockStore';
import { mockNodeData, mockEdgeData, mockVectorData } from '../mockData';

jest.mock('@/hooks/entityHooks', () => ({
  useVectors: () => ({
    vectorsList: mockVectorData,
    isLoading: false,
    error: null,
    fetchVectorsList: jest.fn(),
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

describe('VectorsPage', () => {
  const store = createMockStore();

  it('renders the vectors page', () => {
    render(
      <Provider store={store}>
        <VectorPage />
      </Provider>
    );

    const titleElement = screen.getByText('Vectors');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toMatchSnapshot();
  });

  it('should create a vector and should be visible in the table', async () => {
    // Increase timeout for this test
    jest.setTimeout(15000);
    const { container } = render(
      <Provider store={store}>
        <VectorPage />
      </Provider>
    );

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state');

    // Create a new vector
    const createButton = screen.getByRole('button', { name: /create vector/i });
    expect(createButton).toMatchSnapshot('create vector button');
    fireEvent.click(createButton);

    // Take snapshot of create modal
    const createModal = screen.getByRole('dialog');
    expect(createModal).toMatchSnapshot('create vector modal');

    // Fill in form fields using mock data
    const modelInput = screen.getByPlaceholderText(/enter model/i);
    const dimensionalityInput = screen.getByPlaceholderText(/enter dimensionality/i);
    const contentInput = screen.getByPlaceholderText(/enter content/i);

    fireEvent.change(modelInput, { target: { value: mockVectorData[0].Model } });
    fireEvent.change(dimensionalityInput, { target: { value: mockVectorData[0].Dimensionality } });
    fireEvent.change(contentInput, { target: { value: mockVectorData[0].Content } });

    // Find and interact with the node select
    const nodeSelectContainer = screen.getByTitle('Node');
    fireEvent.mouseDown(nodeSelectContainer);

    // Wait for dropdown options and select the first node
    await waitFor(() => {
      const option = screen.getByText(mockNodeData[0].name);
      fireEvent.click(option);
    });

    // Take snapshot of filled form
    expect(createModal).toMatchSnapshot('create vector form with values');

    const submitButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(submitButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state');
  });

  it('should update vector successfully', async () => {
    // Increase timeout for this test
    jest.setTimeout(15000);

    const { container } = render(
      <Provider store={store}>
        <VectorPage />
      </Provider>
    );

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state before update');

    // Find and click the menu button in the Actions column
    const menuButtons = screen.getAllByRole('vector-action-menu');
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
    expect(updateModal).toMatchSnapshot('update vector modal');

    // Find and update the form fields
    const modelInput = screen.getByPlaceholderText(/enter model/i);
    const dimensionalityInput = screen.getByPlaceholderText(/enter dimensionality/i);
    const contentInput = screen.getByPlaceholderText(/enter content/i);

    // Use hardcoded values
    const updatedModel = 'Updated Model';
    const updatedDimensionality = 4;
    const updatedContent = 'Updated Content';
    const updatedVectors = [1.1, 2.2, 3.3, 4.4];

    fireEvent.change(modelInput, { target: { value: updatedModel } });
    fireEvent.change(dimensionalityInput, { target: { value: updatedDimensionality } });
    fireEvent.change(contentInput, { target: { value: updatedContent } });

    // Find and interact with the edge select
    const edgeSelectContainer = screen.getByTitle('Edge');
    fireEvent.mouseDown(edgeSelectContainer);

    // Wait for dropdown options and select the first edge
    await waitFor(() => {
      const option = screen.getByText(mockEdgeData[0].name);
      fireEvent.click(option);
    });

    // Take snapshot of filled form
    expect(updateModal).toMatchSnapshot('update vector form with values');

    const submitButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(submitButton);
    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after update');
  });

  it('should delete vector successfully', async () => {
    // Increase timeout for this test
    jest.setTimeout(15000);

    const { container } = render(
      <Provider store={store}>
        <VectorPage />
      </Provider>
    );

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state before delete');

    // Find and click the menu button in the Actions column
    const menuButtons = screen.getAllByRole('vector-action-menu');
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
