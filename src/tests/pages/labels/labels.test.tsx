import '@testing-library/jest-dom';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import LabelPage from '@/app/dashboard/[tenantId]/labels/page';
import { createMockInitialState } from '../../store/mockStore';
import { mockLabelData, mockGraphGUID } from '../mockData';
import { handlers } from './handler';
import { setupServer } from 'msw/node';
import { commonHandlers } from '@/tests/handler';
import { renderWithRedux } from '@/tests/store/utils';
import AddEditLabel from '@/page/labels/components/AddEditLabel';
import DeleteLabel from '@/page/labels/components/DeleteLabel';

const server = setupServer(...handlers, ...commonHandlers);

describe('LabelsPage', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
  });
  afterAll(() => server.close());

  it('renders the labels page', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<LabelPage />, initialState, undefined, true);

    await waitFor(() => {
      expect(screen.getByText(/labels/i)).toBeVisible();
      expect(screen.getByRole('button', { name: /create label/i })).toBeVisible();
    });
    expect(container).toMatchSnapshot('initial table state');
  });

  it('should display Create Label button', () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<LabelPage />, initialState, undefined, true);

    const createButton = screen.getByRole('button', { name: /create label/i });
    expect(createButton).toBeVisible();
    expect(createButton).toMatchSnapshot();
  });

  it('should create a label and should be visible in the table', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(
      <AddEditLabel
        isAddEditLabelVisible={true}
        setIsAddEditLabelVisible={() => {}}
        label={null}
        selectedGraph={mockGraphGUID}
      />,
      initialState,
      undefined,
      true
    );

    const modal = await screen.findByTestId('add-edit-label-modal');
    expect(modal).toBeInTheDocument();

    const labelInput = screen.getByPlaceholderText(/enter label label/i);

    fireEvent.change(labelInput, { target: { value: mockLabelData[0].Label } });

    await waitFor(() => {
      expect(labelInput.value).toBe('Test Label');
    });

    await waitFor(
      () => {
        const createButton = screen.getByRole('button', { name: /ok/i });
        expect(createButton).not.toBeDisabled();
      },
      { timeout: 5000 }
    );

    const createButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(createButton);

    expect(container).toMatchSnapshot('after label creation form submission');
  }, 8000);

  it('should update label successfully', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(
      <AddEditLabel
        isAddEditLabelVisible={true}
        setIsAddEditLabelVisible={() => {}}
        label={mockLabelData[0]}
        selectedGraph={mockGraphGUID}
      />,
      initialState,
      undefined,
      true
    );

    const modal = await screen.findByTestId('add-edit-label-modal');
    expect(modal).toBeInTheDocument();

    expect(screen.getByText('Edit Label')).toBeInTheDocument();
    const labelInput = screen.getByPlaceholderText(/enter label label/i);
    expect(labelInput.value).toBe(mockLabelData[0].Label);
    const updatedLabelValue = 'Updated Test Label';
    fireEvent.change(labelInput, { target: { value: updatedLabelValue } });

    await waitFor(() => {
      expect(labelInput.value).toBe(updatedLabelValue);
    });

    await waitFor(
      () => {
        const submitButton = screen.getByRole('button', { name: /ok/i });
        expect(submitButton).not.toBeDisabled();
      },
      { timeout: 5000 }
    );

    const submitButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Label updated successfully')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot('final state after label update');
  }, 8000);

  it('should delete label successfully', async () => {
    const initialState = createMockInitialState();
    const mockSetIsDeleteModelVisible = jest.fn();
    const mockSetSelectedLabel = jest.fn();
    const mockOnLabelDeleted = jest.fn();
  
    const { container } = renderWithRedux(
      <DeleteLabel
        title={`Are you sure you want to delete "${mockLabelData[0].Label}" label?`}
        paragraphText="This action will delete label."
        isDeleteModelVisible={true}
        setIsDeleteModelVisible={mockSetIsDeleteModelVisible}
        selectedLabel={mockLabelData[0]}
        setSelectedLabel={mockSetSelectedLabel}
        onLabelDeleted={mockOnLabelDeleted}
      />,
      initialState,
      undefined,
      true
    );
  
    const modal = await screen.findByTestId('delete-label-modal');
    expect(modal).toBeInTheDocument();
  
    expect(screen.getByText('Are you sure you want to delete "Test Label" label?')).toBeInTheDocument();
  
    expect(screen.getByText('This action will delete label.')).toBeInTheDocument();
  
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass('ant-btn-dangerous'); // Ant Design danger button class
  
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
  
    fireEvent.click(deleteButton);
  
    await waitFor(() => {
      expect(screen.getByText('Label deleted successfully')).toBeInTheDocument();
    });
  
    expect(mockSetIsDeleteModelVisible).toHaveBeenCalledWith(false);
    expect(mockSetSelectedLabel).toHaveBeenCalledWith(null);
    expect(mockOnLabelDeleted).toHaveBeenCalled();
  
    expect(container).toMatchSnapshot('after label deletion');
  }, 8000);
});
