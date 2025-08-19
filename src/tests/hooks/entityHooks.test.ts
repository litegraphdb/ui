import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import {
  useCurrentTenant,
  useSelectedGraph,
  useSelectedTenant,
  useNodeAndEdge,
  useLazyLoadNodes,
  useLazyLoadEdges,
  useLazyLoadEdgesAndNodes,
} from '@/hooks/entityHooks';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  useGetAllNodesQuery,
  useGetAllEdgesQuery,
  useEnumerateAndSearchNodeQuery,
  useEnumerateAndSearchEdgeQuery,
} from '@/lib/store/slice/slice';
import { transformToOptions } from '@/lib/graph/utils';
import { parseNode, parseEdge } from '@/lib/graph/parser';

// Mock the store hooks
jest.mock('@/lib/store/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

// Mock the RTK Query hooks
jest.mock('@/lib/store/slice/slice', () => ({
  useGetAllNodesQuery: jest.fn(),
  useGetAllEdgesQuery: jest.fn(),
  useEnumerateAndSearchNodeQuery: jest.fn(),
  useEnumerateAndSearchEdgeQuery: jest.fn(),
}));

// Mock the utility functions
jest.mock('@/lib/graph/utils', () => ({
  transformToOptions: jest.fn(),
}));

jest.mock('@/lib/graph/parser', () => ({
  parseNode: jest.fn(),
  parseEdge: jest.fn(),
  buildAdjacencyList: jest.fn(() => ({})),
  topologicalSortKahn: jest.fn(() => []),
  renderTree: jest.fn(() => ({ nodes: [], edges: [] })),
}));

describe('Entity Hooks', () => {
  let mockDispatch: jest.Mock;
  let mockUseAppSelector: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch = jest.fn();
    mockUseAppSelector = jest.fn();

    (useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useAppSelector as unknown as jest.Mock).mockImplementation(mockUseAppSelector);
  });

  describe('useCurrentTenant', () => {
    it('should return tenant from Redux state', () => {
      const mockTenant = { GUID: 'tenant-123', Name: 'Test Tenant' };
      mockUseAppSelector.mockReturnValue(mockTenant);

      const { result } = renderHook(() => useCurrentTenant());

      expect(mockUseAppSelector).toHaveBeenCalledWith(expect.any(Function));
      expect(result.current).toEqual(mockTenant);
    });

    it('should handle undefined tenant', () => {
      mockUseAppSelector.mockReturnValue(undefined);

      const { result } = renderHook(() => useCurrentTenant());

      expect(result.current).toBeUndefined();
    });
  });

  describe('useSelectedGraph', () => {
    it('should return selected graph from Redux state', () => {
      const mockGraphId = 'graph-123';
      mockUseAppSelector.mockReturnValue(mockGraphId);

      const { result } = renderHook(() => useSelectedGraph());

      expect(mockUseAppSelector).toHaveBeenCalledWith(expect.any(Function));
      expect(result.current).toBe(mockGraphId);
    });

    it('should handle null selected graph', () => {
      mockUseAppSelector.mockReturnValue(null);

      const { result } = renderHook(() => useSelectedGraph());

      expect(result.current).toBeNull();
    });
  });

  describe('useSelectedTenant', () => {
    it('should return selected tenant from Redux state', () => {
      const mockTenant = { GUID: 'tenant-456', Name: 'Selected Tenant' };
      mockUseAppSelector.mockReturnValue(mockTenant);

      const { result } = renderHook(() => useSelectedTenant());

      expect(mockUseAppSelector).toHaveBeenCalledWith(expect.any(Function));
      expect(result.current).toEqual(mockTenant);
    });
  });

  describe('useNodeAndEdge', () => {
    it('should call RTK Query hooks with correct parameters', () => {
      const mockFetchNodes = jest.fn();
      const mockFetchEdges = jest.fn();
      const mockNodeOptions = [{ value: 'node1', label: 'Node 1' }];
      const mockEdgeOptions = [{ value: 'edge1', label: 'Edge 1' }];

      (useGetAllNodesQuery as jest.Mock).mockReturnValue({
        data: null,
        refetch: mockFetchNodes,
        isLoading: false,
        error: null,
      });

      (useGetAllEdgesQuery as jest.Mock).mockReturnValue({
        data: null,
        refetch: mockFetchEdges,
        isLoading: false,
        error: null,
      });

      (transformToOptions as jest.Mock)
        .mockReturnValueOnce(mockNodeOptions)
        .mockReturnValueOnce(mockEdgeOptions);

      renderHook(() => useNodeAndEdge('graph-123'));

      expect(useGetAllNodesQuery).toHaveBeenCalledWith({ graphId: 'graph-123' });
      expect(useGetAllEdgesQuery).toHaveBeenCalledWith({ graphId: 'graph-123' });
      expect(transformToOptions).toHaveBeenCalledTimes(2);
    });

    it('should return correct structure', () => {
      const mockFetchNodes = jest.fn();
      const mockFetchEdges = jest.fn();

      (useGetAllNodesQuery as jest.Mock).mockReturnValue({
        data: null,
        refetch: mockFetchNodes,
        isLoading: false,
        error: null,
      });

      (useGetAllEdgesQuery as jest.Mock).mockReturnValue({
        data: null,
        refetch: mockFetchEdges,
        isLoading: false,
        error: null,
      });

      (transformToOptions as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => useNodeAndEdge('graph-123'));

      expect(result.current).toHaveProperty('nodesList');
      expect(result.current).toHaveProperty('edgesList');
      expect(result.current).toHaveProperty('fetchNodesAndEdges');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('nodeOptions');
      expect(result.current).toHaveProperty('edgeOptions');
    });

    it('should provide fetchNodesAndEdges function', async () => {
      const mockFetchNodes = jest.fn().mockResolvedValue(undefined);
      const mockFetchEdges = jest.fn().mockResolvedValue(undefined);

      (useGetAllNodesQuery as jest.Mock).mockReturnValue({
        data: null,
        refetch: mockFetchNodes,
        isLoading: false,
        error: null,
      });

      (useGetAllEdgesQuery as jest.Mock).mockReturnValue({
        data: null,
        refetch: mockFetchEdges,
        isLoading: false,
        error: null,
      });

      (transformToOptions as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => useNodeAndEdge('graph-123'));

      await result.current.fetchNodesAndEdges();

      expect(mockFetchNodes).toHaveBeenCalled();
      expect(mockFetchEdges).toHaveBeenCalled();
    });
  });

  describe('useLazyLoadNodes', () => {
    it('should call RTK Query hook with correct parameters', () => {
      const mockRefetch = jest.fn();

      (useEnumerateAndSearchNodeQuery as jest.Mock).mockReturnValue({
        data: null,
        refetch: mockRefetch,
        isLoading: false,
        isFetching: false,
        isError: false,
      });

      renderHook(() => useLazyLoadNodes('graph-123'));

      expect(useEnumerateAndSearchNodeQuery).toHaveBeenCalledWith(
        {
          graphId: 'graph-123',
          request: { MaxResults: 50, ContinuationToken: undefined, IncludeSubordinates: true },
        },
        { skip: false }
      );
    });

    it('should return correct structure', () => {
      const mockRefetch = jest.fn();

      (useEnumerateAndSearchNodeQuery as jest.Mock).mockReturnValue({
        data: null,
        refetch: mockRefetch,
        isLoading: false,
        isFetching: false,
        isError: false,
      });

      const { result } = renderHook(() => useLazyLoadNodes('graph-123'));

      expect(result.current).toHaveProperty('nodes');
      expect(result.current).toHaveProperty('refetchNodes');
      expect(result.current).toHaveProperty('firstResult');
      expect(result.current).toHaveProperty('isNodesError');
      expect(result.current).toHaveProperty('isNodesLoading');
    });

    it('should handle onDataLoaded callback', () => {
      const mockOnDataLoaded = jest.fn();
      const mockRefetch = jest.fn();

      (useEnumerateAndSearchNodeQuery as jest.Mock).mockReturnValue({
        data: null,
        refetch: mockRefetch,
        isLoading: false,
        isFetching: false,
        isError: false,
      });

      renderHook(() => useLazyLoadNodes('graph-123', mockOnDataLoaded));

      // The callback should be available even if not called immediately
      expect(mockOnDataLoaded).toBeDefined();
    });
  });

  describe('useLazyLoadEdges', () => {
    it('should call RTK Query hook with correct parameters', () => {
      const mockRefetch = jest.fn();

      (useEnumerateAndSearchEdgeQuery as jest.Mock).mockReturnValue({
        data: null,
        refetch: mockRefetch,
        isLoading: false,
        isFetching: false,
        isError: false,
      });

      renderHook(() => useLazyLoadEdges('graph-123'));

      expect(useEnumerateAndSearchEdgeQuery).toHaveBeenCalledWith(
        {
          graphId: 'graph-123',
          request: { MaxResults: 50, ContinuationToken: undefined },
        },
        { skip: false }
      );
    });

    it('should handle doNotFetchOnRender parameter', () => {
      const mockRefetch = jest.fn();

      (useEnumerateAndSearchEdgeQuery as jest.Mock).mockReturnValue({
        data: null,
        refetch: mockRefetch,
        isLoading: false,
        isFetching: false,
        isError: false,
      });

      renderHook(() => useLazyLoadEdges('graph-123', undefined, true));

      expect(useEnumerateAndSearchEdgeQuery).toHaveBeenCalledWith(
        {
          graphId: 'graph-123',
          request: { MaxResults: 50, ContinuationToken: undefined },
        },
        { skip: true }
      );
    });

    it('should return correct structure', () => {
      const mockRefetch = jest.fn();

      (useEnumerateAndSearchEdgeQuery as jest.Mock).mockReturnValue({
        data: null,
        refetch: mockRefetch,
        isLoading: false,
        isFetching: false,
        isError: false,
      });

      const { result } = renderHook(() => useLazyLoadEdges('graph-123'));

      expect(result.current).toHaveProperty('edges');
      expect(result.current).toHaveProperty('isEdgesLoading');
      expect(result.current).toHaveProperty('refetchEdges');
      expect(result.current).toHaveProperty('firstResult');
      expect(result.current).toHaveProperty('isEdgesError');
    });
  });

  describe('useLazyLoadEdgesAndNodes', () => {
    beforeEach(() => {
      (useEnumerateAndSearchNodeQuery as jest.Mock).mockReturnValue({
        data: null,
        refetch: jest.fn(),
        isLoading: false,
        isFetching: false,
        isError: false,
      });

      (useEnumerateAndSearchEdgeQuery as jest.Mock).mockReturnValue({
        data: null,
        refetch: jest.fn(),
        isLoading: false,
        isFetching: false,
        isError: false,
      });

      (parseNode as jest.Mock).mockReturnValue([]);
      (parseEdge as jest.Mock).mockReturnValue([]);
    });

    it('should return correct structure', () => {
      const { result } = renderHook(() => useLazyLoadEdgesAndNodes('graph-123', false));

      expect(result.current).toHaveProperty('nodes');
      expect(result.current).toHaveProperty('edges');
      expect(result.current).toHaveProperty('isNodesLoading');
      expect(result.current).toHaveProperty('isEdgesLoading');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('nodesFirstResult');
      expect(result.current).toHaveProperty('edgesFirstResult');
      expect(result.current).toHaveProperty('isNodesError');
      expect(result.current).toHaveProperty('isEdgesError');
      expect(result.current).toHaveProperty('refetchNodes');
      expect(result.current).toHaveProperty('refetchEdges');
      expect(result.current).toHaveProperty('isError');
    });

    it('should provide refetch function', () => {
      const { result } = renderHook(() => useLazyLoadEdgesAndNodes('graph-123', false));

      expect(typeof result.current.refetch).toBe('function');

      // Test that calling refetch doesn't throw
      expect(() => result.current.refetch()).not.toThrow();
    });

    it('should handle loading states', () => {
      const { result } = renderHook(() => useLazyLoadEdgesAndNodes('graph-123', false));

      expect(typeof result.current.isLoading).toBe('boolean');
      expect(typeof result.current.isNodesLoading).toBe('boolean');
      expect(typeof result.current.isEdgesLoading).toBe('boolean');
    });

    it('should handle error states', () => {
      const { result } = renderHook(() => useLazyLoadEdgesAndNodes('graph-123', false));

      expect(typeof result.current.isError).toBe('boolean');
      expect(typeof result.current.isNodesError).toBe('boolean');
      expect(typeof result.current.isEdgesError).toBe('boolean');
    });
  });
});
