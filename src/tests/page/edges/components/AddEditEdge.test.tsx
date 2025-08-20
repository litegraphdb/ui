import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AddEditEdge from '@/page/edges/components/AddEditEdge';
import {
  useGetAllNodesQuery,
  useGetAllEdgesQuery,
  useGetEdgeByIdQuery,
} from '@/lib/store/slice/slice';
import { useForm } from 'antd/es/form';
import { EdgeType } from '@/types/types';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

// Mock dependencies
jest.mock('@/lib/store/slice/slice');
jest.mock('react-hot-toast');
jest.mock('uuid');

const mockUseGetAllNodesQuery = useGetAllNodesQuery as jest.MockedFunction<
  typeof useGetAllNodesQuery
>;
const mockUseGetAllEdgesQuery = useGetAllEdgesQuery as jest.MockedFunction<
  typeof useGetAllEdgesQuery
>;
const mockUseGetEdgeByIdQuery = useGetEdgeByIdQuery as jest.MockedFunction<
  typeof useGetEdgeByIdQuery
>;
const mockToast = toast as jest.Mocked<typeof toast>;
const mockV4 = uuidv4 as jest.MockedFunction<typeof uuidv4>;

// Mock additional RTK Query hooks
const mockUseCreateEdgeMutation = jest.fn();
const mockUseUpdateEdgeMutation = jest.fn();
const mockUseGetGraphByIdQuery = jest.fn();

// Mock the slice module with all required hooks
jest.mock('@/lib/store/slice/slice', () => ({
  useGetAllNodesQuery: jest.fn(),
  useGetAllEdgesQuery: jest.fn(),
  useGetEdgeByIdQuery: jest.fn(),
  useCreateEdgeMutation: jest.fn(),
  useUpdateEdgeMutation: jest.fn(),
  useGetGraphByIdQuery: jest.fn(),
}));

// Mock Form hook
const mockForm = {
  resetFields: jest.fn(),
  setFieldsValue: jest.fn(),
  validateFields: jest.fn(),
  setFieldValue: jest.fn(),
  getFieldValue: jest.fn(),
};

jest.mock('antd/es/form', () => ({
  useForm: jest.fn(() => [mockForm]),
  __esModule: true,
  default: function MockForm({ children, onValuesChange, ...props }: any) {
    return (
      <form data-testid="edge-form" {...props}>
        {children}
      </form>
    );
  },
}));

// Mock components
jest.mock('@/components/base/modal/Modal', () => {
  return function MockModal({ children, open, onCancel, onOk, ...props }: any) {
    if (!open) return null;
    return (
      <div data-testid="add-edit-edge-modal" {...props}>
        {children}
        <button data-testid="cancel-button" onClick={onCancel}>
          Cancel
        </button>
        <button data-testid="submit-button" onClick={onOk}>
          Submit
        </button>
      </div>
    );
  };
});

jest.mock('@/components/base/loading/PageLoading', () => {
  return function MockPageLoading() {
    return <div data-testid="page-loading">Loading...</div>;
  };
});

jest.mock('@/components/base/form/FormItem', () => {
  return function MockFormItem({ children, label, name, rules, className }: any) {
    return (
      <div className={className} data-testid={`form-item-${name}`}>
        <label>{label}</label>
        {children}
      </div>
    );
  };
});

jest.mock('@/components/base/input/Input', () => {
  return function MockInput({ placeholder, onChange, ...props }: any) {
    return <input data-testid="input" placeholder={placeholder} onChange={onChange} {...props} />;
  };
});

jest.mock('@/components/base/flex/Flex', () => {
  return function MockFlex({ children, ...props }: any) {
    return (
      <div data-testid="flex" {...props}>
        {children}
      </div>
    );
  };
});

jest.mock('@/components/node-selector/NodeSelector', () => {
  return function MockNodeSelector({ name, label, ...props }: any) {
    return (
      <div data-testid={`node-selector-${name}`}>
        <label>{label}</label>
        <input data-testid={`${name}-input`} />
      </div>
    );
  };
});

jest.mock('@/components/inputs/label-input/LabelInput', () => {
  return function MockLabelInput({ ...props }: any) {
    return <div data-testid="label-input" {...props} />;
  };
});

jest.mock('@/components/inputs/tags-input/TagsInput', () => {
  return function MockTagsInput({ ...props }: any) {
    return <div data-testid="tags-input" {...props} />;
  };
});

jest.mock('@/components/inputs/vectors-input.tsx/VectorsInput', () => {
  return function MockVectorsInput({ ...props }: any) {
    return <div data-testid="vectors-input" {...props} />;
  };
});

jest.mock('@/components/base/button/Button', () => {
  return function MockButton({ children, onClick, ...props }: any) {
    return (
      <button data-testid="button" onClick={onClick} {...props}>
        {children}
      </button>
    );
  };
});

// Mock utility functions
jest.mock('@/components/inputs/tags-input/utils', () => ({
  convertTagsToRecord: jest.fn((tags) => {
    const result: Record<string, string> = {};
    tags?.forEach((tag: any) => {
      if (tag.key && tag.value) {
        result[tag.key] = tag.value;
      }
    });
    return result;
  }),
}));

jest.mock('@/components/inputs/vectors-input.tsx/utils', () => ({
  convertVectorsToAPIRecord: jest.fn((vectors) => vectors || []),
}));

describe('AddEditEdge', () => {
  const defaultProps = {
    isAddEditEdgeVisible: true,
    setIsAddEditEdgeVisible: jest.fn(),
    edge: null,
    selectedGraph: 'graph-123',
    fromNodeGUID: null,
    onEdgeUpdated: jest.fn(),
    onClose: jest.fn(),
    readonly: false,
    updateLocalEdge: jest.fn(),
    addLocalEdge: jest.fn(),
    currentNodes: [],
  };

  const mockEdge: EdgeType = {
    GUID: 'edge-123',
    Name: 'Test Edge',
    GraphGUID: 'graph-123',
    TenantGUID: 'tenant-123',
    CreatedUtc: '2023-01-01T00:00:00Z',
    LastUpdateUtc: '2023-01-01T00:00:00Z',
    Data: { test: 'data' },
    Tags: { tag1: 'value1' },
    Labels: ['label1'],
    Vectors: ['vector1'],
    Cost: 5,
    From: 'node-1',
    To: 'node-2',
  };

  beforeEach(() => {
    mockUseGetAllNodesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    mockUseGetAllEdgesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    mockUseGetEdgeByIdQuery.mockReturnValue({
      data: null,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    // Mock RTK Query mutation hooks
    mockUseCreateEdgeMutation.mockReturnValue([
      jest.fn().mockResolvedValue({ data: { GUID: 'new-edge-123' } }),
      { isLoading: false },
    ]);

    mockUseUpdateEdgeMutation.mockReturnValue([
      jest.fn().mockResolvedValue({ success: true }),
      { isLoading: false },
    ]);

    mockUseGetGraphByIdQuery.mockReturnValue({
      data: { Name: 'Test Graph' },
      isLoading: false,
    } as any);

    // Apply mocks to the actual imports
    (require('@/lib/store/slice/slice').useCreateEdgeMutation as jest.Mock).mockImplementation(
      mockUseCreateEdgeMutation
    );
    (require('@/lib/store/slice/slice').useUpdateEdgeMutation as jest.Mock).mockImplementation(
      mockUseUpdateEdgeMutation
    );
    (require('@/lib/store/slice/slice').useGetGraphByIdQuery as jest.Mock).mockImplementation(
      mockUseGetGraphByIdQuery
    );

    mockV4.mockReturnValue('new-uuid-123');
    mockForm.validateFields.mockResolvedValue({
      name: 'Test Edge',
      from: 'node-1',
      to: 'node-2',
      cost: 5,
      data: { test: 'data' },
      labels: ['label1'],
      tags: [{ key: 'tag1', value: 'value1' }],
      vectors: ['vector1'],
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(<AddEditEdge {...defaultProps} />);

      expect(screen.getByTestId('add-edit-edge-modal')).toBeInTheDocument();
    });

    it('renders form elements correctly', () => {
      render(<AddEditEdge {...defaultProps} />);

      expect(document.querySelector('form')).toBeInTheDocument();
      expect(screen.getByTestId('form-item-graphName')).toBeInTheDocument();
      expect(screen.getByTestId('form-item-name')).toBeInTheDocument();
      expect(screen.getByTestId('node-selector-from')).toBeInTheDocument();
      expect(screen.getByTestId('node-selector-to')).toBeInTheDocument();
      expect(screen.getByTestId('form-item-cost')).toBeInTheDocument();
    });

    it('renders with edge data for editing', () => {
      render(<AddEditEdge {...defaultProps} edge={mockEdge} />);

      expect(screen.getByTestId('add-edit-edge-modal')).toBeInTheDocument();
      expect(document.querySelector('form')).toBeInTheDocument();
    });

    it('renders in readonly mode', () => {
      render(<AddEditEdge {...defaultProps} readonly={true} />);

      expect(screen.getByTestId('add-edit-edge-modal')).toBeInTheDocument();
      expect(document.querySelector('form')).toBeInTheDocument();
    });

    it('does not render when modal is not visible', () => {
      render(<AddEditEdge {...defaultProps} isAddEditEdgeVisible={false} />);

      expect(screen.queryByTestId('add-edit-edge-modal')).not.toBeInTheDocument();
    });
  });

  describe('Modal Actions', () => {
    it('handles cancel button click', () => {
      const setIsAddEditEdgeVisible = jest.fn();
      const onClose = jest.fn();

      render(
        <AddEditEdge
          {...defaultProps}
          setIsAddEditEdgeVisible={setIsAddEditEdgeVisible}
          onClose={onClose}
        />
      );

      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);

      expect(setIsAddEditEdgeVisible).toHaveBeenCalledWith(false);
      expect(onClose).toHaveBeenCalled();
    });

    it('renders submit button', () => {
      render(<AddEditEdge {...defaultProps} />);

      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });
  });

  describe('Form Elements', () => {
    it('renders all required form sections', () => {
      render(<AddEditEdge {...defaultProps} />);

      // Check that all form sections are present
      expect(screen.getByTestId('tags-input')).toBeInTheDocument();
      expect(screen.getByTestId('vectors-input')).toBeInTheDocument();
      expect(screen.getByTestId('label-input')).toBeInTheDocument();
    });

    it('renders input elements with correct attributes', () => {
      render(<AddEditEdge {...defaultProps} />);

      const nameInput = screen.getByTestId('edge-name-input');
      expect(nameInput).toHaveAttribute('placeholder', 'Enter edge name');

      const costInput = screen.getByPlaceholderText('Enter edge cost');
      expect(costInput).toHaveAttribute('type', 'number');
    });

    it('handles cost input interaction', () => {
      render(<AddEditEdge {...defaultProps} />);

      const costInput = screen.getByPlaceholderText('Enter edge cost');
      expect(costInput).toBeInTheDocument();

      // Test that the input exists and can be interacted with
      fireEvent.change(costInput, { target: { value: '10' } });
      // Just verify the input exists and doesn't throw errors
    });
  });

  describe('Props and State', () => {
    it('handles different edge types', () => {
      const localEdge = { ...mockEdge, isLocal: true };
      render(<AddEditEdge {...defaultProps} edge={localEdge as any} />);

      expect(screen.getByTestId('add-edit-edge-modal')).toBeInTheDocument();
    });

    it('handles fromNodeGUID prop', () => {
      render(<AddEditEdge {...defaultProps} fromNodeGUID="node-123" />);

      expect(screen.getByTestId('add-edit-edge-modal')).toBeInTheDocument();
    });

    it('handles currentNodes prop', () => {
      const currentNodes = [{ id: 'node-1', label: 'Node 1' }];
      render(<AddEditEdge {...defaultProps} currentNodes={currentNodes} />);

      expect(screen.getByTestId('add-edit-edge-modal')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('integrates with mocked hooks without errors', () => {
      render(<AddEditEdge {...defaultProps} />);

      // Verify that the component renders without throwing errors
      // when all hooks are properly mocked
      expect(screen.getByTestId('add-edit-edge-modal')).toBeInTheDocument();
      expect(document.querySelector('form')).toBeInTheDocument();
    });

    it('handles edge loading state', () => {
      render(<AddEditEdge {...defaultProps} isEdgeLoading={true} />);

      // Component should still render even in loading state
      expect(screen.getByTestId('add-edit-edge-modal')).toBeInTheDocument();
    });

    it('handles different modal titles based on props', () => {
      // Test with new edge (Create mode)
      const { rerender } = render(<AddEditEdge {...defaultProps} />);
      expect(screen.getByTestId('add-edit-edge-modal')).toHaveAttribute('title', 'Create Edge');

      // Test with existing edge (Edit mode)
      rerender(<AddEditEdge {...defaultProps} edge={mockEdge} />);
      expect(screen.getByTestId('add-edit-edge-modal')).toHaveAttribute('title', 'Edit Edge');
    });
  });
});
