import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TagPage from '../../../page/tags/TagPage';
import { Provider } from 'react-redux';
import { createMockStore } from '../../store/mockStore';
import { mockNodeData, mockEdgeData, mockTagData } from '../mockData';
import { Toaster } from 'react-hot-toast';

jest.mock('@/hooks/entityHooks', () => ({
  useTags: () => ({
    tagsList: mockTagData.allTags,
    isLoading: false,
    error: null,
    fetchTagsList: jest.fn(),
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

describe('TagsPage', () => {
  const store = createMockStore();

  it('renders the tags page', () => {
    render(
      <Provider store={store}>
        <TagPage />
      </Provider>
    );

    const titleElement = screen.getByText('Tags');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toMatchSnapshot();
  });

  it('should create a tag and should be visible in the table', async () => {
    const { container } = render(
      <Provider store={store}>
        <TagPage />
      </Provider>
    );

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state');

    // Create a new tag
    const createButton = screen.getByRole('button', { name: /create tag/i });
    expect(createButton).toMatchSnapshot('create tag button');
    fireEvent.click(createButton);

    // Take snapshot of create modal
    const createModal = screen.getByRole('dialog');
    expect(createModal).toMatchSnapshot('create tag modal');

    // Fill in form fields using mock data
    const keyInput = screen.getByPlaceholderText(/enter tag key/i);
    const valueInput = screen.getByPlaceholderText(/enter tag value/i);

    // Fill in the key and value fields
    fireEvent.change(keyInput, { target: { value: mockTagData.allTags[0].Key } });
    fireEvent.change(valueInput, { target: { value: mockTagData.allTags[0].Value } });

    // Find and interact with the node select
    const nodeSelectContainer = screen.getByTitle('Node');
    fireEvent.mouseDown(nodeSelectContainer);

    // Wait for dropdown options and select the first node
    await waitFor(() => {
      const option = screen.getByText(mockNodeData[0].name);
      fireEvent.click(option);
    });

    // Take snapshot of filled form
    expect(createModal).toMatchSnapshot('create tag form with values');

    const submitButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(submitButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state');
  });

  it('should update tag successfully', async () => {
    const { container } = render(
      <Provider store={store}>
        <Toaster />
        <TagPage />
      </Provider>
    );

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state before update');

    // Find and click the menu button in the Actions column
    const menuButtons = screen.getAllByRole('tag-action-menu');
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
    expect(updateModal).toMatchSnapshot('update tag modal');

    // Find and update the form fields
    const keyInput = screen.getByPlaceholderText(/enter tag key/i);
    const valueInput = screen.getByPlaceholderText(/enter tag value/i);

    // Use hardcoded values
    const updatedKey = 'Updated Key';
    const updatedValue = 'Updated Value';

    fireEvent.change(keyInput, { target: { value: updatedKey } });
    fireEvent.change(valueInput, { target: { value: updatedValue } });

    // Find and interact with the edge select
    const edgeSelectContainer = screen.getByTitle('Edge');
    fireEvent.mouseDown(edgeSelectContainer);

    // Wait for dropdown options and select the first edge
    await waitFor(() => {
      const option = screen.getByText(mockEdgeData[0].name);
      fireEvent.click(option);
    });

    expect(updateModal).toMatchSnapshot('update tag form with values');

    const submitButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(submitButton);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after update');
  });

  it('should delete tag successfully', async () => {
    // Increase timeout for this test
    jest.setTimeout(15000);
    const { container } = render(
      <Provider store={store}>
        <TagPage />
      </Provider>
    );

    // Take initial table snapshot
    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state before delete');

    // Find and click the menu button in the Actions column
    const menuButtons = screen.getAllByRole('tag-action-menu');
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
