import '@testing-library/jest-dom';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import VectorPage from '@/app/dashboard/[tenantId]/vectors/page';
import { createMockInitialState } from '../../store/mockStore';
import { mockVectorData } from '../mockData';
import { setupServer } from 'msw/node'; 
import { handlers } from './handler';
import { commonHandlers } from '@/tests/handler';
import { renderWithRedux } from '@/tests/store/utils';
import AddEditVector from '@/page/vectors/components/AddEditVector';
import DeleteVector from '@/page/vectors/components/DeleteVector';
import { mockGraphGUID } from '../mockData';

const server = setupServer(...handlers, ...commonHandlers);

describe('Vectors Page', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
  });
  afterAll(() => server.close());

  it('renders the vectors page', () => {
   const initialState = createMockInitialState();
   const { container } = renderWithRedux(<VectorPage />, initialState, undefined, true);

   expect(screen.getByText(/vectors/i)).toBeVisible();
   expect(screen.getByRole('button', { name: /create vector/i })).toBeVisible();
   expect(container).toMatchSnapshot('initial table state');
  });

  it('should create a vector and should be visible in the table', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<VectorPage />, initialState, undefined, true);

    const createButton = screen.getByRole('button', { name: /create vector/i });
    expect(createButton).toBeVisible();
    expect(createButton).toMatchSnapshot();
  });

  it('should create a vector and should be visible in the table', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<AddEditVector isAddEditVectorVisible={true} setIsAddEditVectorVisible={() => {}} vector={null} selectedGraph={mockGraphGUID}/>, initialState, undefined, true);

    const modal = await screen.findByTestId('add-edit-vector-modal');
    expect(modal).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 10000 }); 

    const modelInput = screen.getByPlaceholderText(/enter model/i);
    fireEvent.change(modelInput, { target: { value: mockVectorData[0].Model } });

    const dimensionalityInput = screen.getByPlaceholderText(/enter dimensionality/i);
    fireEvent.change(dimensionalityInput, { target: { value: mockVectorData[0].Dimensionality } });

    const contentInput = screen.getByPlaceholderText(/enter content/i);
    fireEvent.change(contentInput, { target: { value: mockVectorData[0].Content } });

    const submitButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(submitButton);

    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state');    
  });

  it('should update vector successfully', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<AddEditVector isAddEditVectorVisible={true} setIsAddEditVectorVisible={() => {}} vector={null} selectedGraph={mockGraphGUID}/>, initialState, undefined, true);

    const modal = await screen.findByTestId('add-edit-vector-modal');
    expect(modal).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 10000 }); 

    const modelInput = screen.getByPlaceholderText(/enter model/i);
    fireEvent.change(modelInput, { target: { value: mockVectorData[0].Model } });
    
    const submitButton = screen.getByRole('button', { name: /ok/i});
    fireEvent.click(submitButton);

    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state');
  });

  it('should delete vector successfully', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<DeleteVector title='Delete Vector' paragraphText='Are you sure you want to delete this vector?' isDeleteModelVisible={true} setIsDeleteModelVisible={() => {}} selectedVector={null} setSelectedVector={() => {}} onVectorDeleted={() => Promise.resolve()}/>, initialState, undefined, true);

    const modal = await screen.findByTestId('delete-vector-modal');
    expect(modal).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 10000 }); 

    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state');
  });   
});