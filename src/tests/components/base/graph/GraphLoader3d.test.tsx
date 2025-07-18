import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GraphLoader3d from '@/components/base/graph/GraphLoader3d';
import { GraphNodeTooltip, GraphEdgeTooltip } from '@/components/base/graph/types';
import { NodeData, EdgeData } from '@/lib/graph/types';
import { createMockInitialState } from '../../../store/mockStore';
import { renderWithRedux } from '../../../store/utils';

// Mock the app context first
const mockUseAppContext = jest.fn(() => ({
  theme: 'light',
}));

// Mock the dynamic import for react-force-graph-3d
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (importFn: any) => {
    const MockForceGraph3D = ({ graphData, onNodeClick, onLinkClick, ...props }: any) => (
      <div data-testid="force-graph-3d" {...props}>
        <div data-testid="graph-data">{JSON.stringify(graphData)}</div>
        <button
          data-testid="node-click"
          onClick={() => onNodeClick({ id: 'node1' }, { clientX: 100, clientY: 200 })}
        >
          Click Node
        </button>
        <button
          data-testid="link-click"
          onClick={() => onLinkClick({ id: 'edge1' }, { clientX: 150, clientY: 250 })}
        >
          Click Link
        </button>
      </div>
    );
    return MockForceGraph3D;
  },
}));

// Mock the utility function
jest.mock('@/utils/appUtils', () => ({
  calculateTooltipPosition: jest.fn(() => ({ x: 150, y: 250 })),
}));

describe('GraphLoader3d Component', () => {
  const mockSetTooltip = jest.fn();
  const mockSetEdgeTooltip = jest.fn();
  const mockRef = React.createRef<HTMLDivElement>();

  const mockNodes: NodeData[] = [
    {
      id: 'node1',
      label: 'Node 1',
      x: 100,
      y: 100,
      type: 'circle',
      vx: 0,
      vy: 0,
    },
    {
      id: 'node2',
      label: 'Node 2',
      x: 200,
      y: 200,
      type: 'square',
      vx: 0,
      vy: 0,
    },
  ];

  const mockEdges: EdgeData[] = [
    {
      id: 'edge1',
      source: 'node1',
      target: 'node2',
      label: 'Edge 1',
      cost: 5,
      data: '',
      sourceX: 100,
      sourceY: 100,
      targetX: 200,
      targetY: 200,
    },
  ];

  const mockContainerDivHeightAndWidth = {
    height: 600,
    width: 800,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppContext.mockReturnValue({
      theme: 'light',
    });
  });

  it('renders without crashing', () => {
    renderWithRedux(
      <GraphLoader3d
        nodes={mockNodes}
        edges={mockEdges}
        setTooltip={mockSetTooltip}
        setEdgeTooltip={mockSetEdgeTooltip}
        ref={mockRef}
        containerDivHeightAndWidth={mockContainerDivHeightAndWidth}
      />,
      createMockInitialState()
    );

    expect(screen.getByTestId('force-graph-3d')).toBeInTheDocument();
  });

  it('maps nodes and edges to correct format', () => {
    renderWithRedux(
      <GraphLoader3d
        nodes={mockNodes}
        edges={mockEdges}
        setTooltip={mockSetTooltip}
        setEdgeTooltip={mockSetEdgeTooltip}
        ref={mockRef}
        containerDivHeightAndWidth={mockContainerDivHeightAndWidth}
      />,
      createMockInitialState()
    );

    const graphDataElement = screen.getByTestId('graph-data');
    const graphData = JSON.parse(graphDataElement.textContent || '{}');

    expect(graphData.nodes).toHaveLength(2);
    expect(graphData.links).toHaveLength(1);

    expect(graphData.nodes[0]).toEqual({
      id: 'node1',
      name: 'Node 1',
      type: 'circle',
      x: 100,
      y: 100,
    });

    expect(graphData.nodes[1]).toEqual({
      id: 'node2',
      name: 'Node 2',
      type: 'square',
      x: 200,
      y: 200,
    });

    expect(graphData.links[0]).toEqual({
      source: 'node1',
      target: 'node2',
      id: 'edge1',
      cost: 5,
      name: 'Edge 1',
    });
  });

  it('handles node click event', () => {
    const { calculateTooltipPosition } = require('@/utils/appUtils');

    renderWithRedux(
      <GraphLoader3d
        nodes={mockNodes}
        edges={mockEdges}
        setTooltip={mockSetTooltip}
        setEdgeTooltip={mockSetEdgeTooltip}
        ref={mockRef}
        containerDivHeightAndWidth={mockContainerDivHeightAndWidth}
      />,
      createMockInitialState()
    );

    const nodeClickButton = screen.getByTestId('node-click');
    fireEvent.click(nodeClickButton);

    expect(calculateTooltipPosition).toHaveBeenCalledWith(100, 200);
    expect(mockSetEdgeTooltip).toHaveBeenCalledWith({
      visible: false,
      edgeId: '',
      x: 0,
      y: 0,
    });
    expect(mockSetTooltip).toHaveBeenCalledWith({
      visible: true,
      nodeId: 'node1',
      x: 150,
      y: 250,
    });
  });

  it('handles link click event', () => {
    const { calculateTooltipPosition } = require('@/utils/appUtils');

    renderWithRedux(
      <GraphLoader3d
        nodes={mockNodes}
        edges={mockEdges}
        setTooltip={mockSetTooltip}
        setEdgeTooltip={mockSetEdgeTooltip}
        ref={mockRef}
        containerDivHeightAndWidth={mockContainerDivHeightAndWidth}
      />,
      createMockInitialState()
    );

    const linkClickButton = screen.getByTestId('link-click');
    fireEvent.click(linkClickButton);

    expect(calculateTooltipPosition).toHaveBeenCalledWith(150, 250);
    expect(mockSetTooltip).toHaveBeenCalledWith({
      visible: false,
      nodeId: '',
      x: 0,
      y: 0,
    });
    expect(mockSetEdgeTooltip).toHaveBeenCalledWith({
      visible: true,
      edgeId: 'edge1',
      x: 150,
      y: 250,
    });
  });

  it('passes correct props to ForceGraph3D', () => {
    renderWithRedux(
      <GraphLoader3d
        nodes={mockNodes}
        edges={mockEdges}
        setTooltip={mockSetTooltip}
        setEdgeTooltip={mockSetEdgeTooltip}
        ref={mockRef}
        containerDivHeightAndWidth={mockContainerDivHeightAndWidth}
      />,
      createMockInitialState()
    );

    const forceGraphElement = screen.getByTestId('force-graph-3d');

    expect(forceGraphElement).toHaveAttribute('height', '600');
    expect(forceGraphElement).toHaveAttribute('width', '800');
  });

  it('handles empty nodes and edges arrays', () => {
    renderWithRedux(
      <GraphLoader3d
        nodes={[]}
        edges={[]}
        setTooltip={mockSetTooltip}
        setEdgeTooltip={mockSetEdgeTooltip}
        ref={mockRef}
        containerDivHeightAndWidth={mockContainerDivHeightAndWidth}
      />,
      createMockInitialState()
    );

    const graphDataElement = screen.getByTestId('graph-data');
    const graphData = JSON.parse(graphDataElement.textContent || '{}');

    expect(graphData.nodes).toHaveLength(0);
    expect(graphData.links).toHaveLength(0);
  });

  it('handles undefined container dimensions', () => {
    renderWithRedux(
      <GraphLoader3d
        nodes={mockNodes}
        edges={mockEdges}
        setTooltip={mockSetTooltip}
        setEdgeTooltip={mockSetEdgeTooltip}
        ref={mockRef}
        containerDivHeightAndWidth={{}}
      />,
      createMockInitialState()
    );

    const forceGraphElement = screen.getByTestId('force-graph-3d');

    // When height/width are undefined, they become null attributes
    expect(forceGraphElement.getAttribute('height')).toBeNull();
    expect(forceGraphElement.getAttribute('width')).toBeNull();
  });

  it('updates graph data when nodes or edges change', () => {
    const { rerender } = renderWithRedux(
      <GraphLoader3d
        nodes={mockNodes}
        edges={mockEdges}
        setTooltip={mockSetTooltip}
        setEdgeTooltip={mockSetEdgeTooltip}
        ref={mockRef}
        containerDivHeightAndWidth={mockContainerDivHeightAndWidth}
      />,
      createMockInitialState()
    );

    const newNodes = [
      ...mockNodes,
      {
        id: 'node3',
        label: 'Node 3',
        x: 300,
        y: 300,
        type: 'triangle',
        vx: 0,
        vy: 0,
      },
    ];

    rerender(
      <GraphLoader3d
        nodes={newNodes}
        edges={mockEdges}
        setTooltip={mockSetTooltip}
        setEdgeTooltip={mockSetEdgeTooltip}
        ref={mockRef}
        containerDivHeightAndWidth={mockContainerDivHeightAndWidth}
      />
    );

    const graphDataElement = screen.getByTestId('graph-data');
    const graphData = JSON.parse(graphDataElement.textContent || '{}');

    expect(graphData.nodes).toHaveLength(3);
    expect(graphData.nodes[2]).toEqual({
      id: 'node3',
      name: 'Node 3',
      type: 'triangle',
      x: 300,
      y: 300,
    });
  });

  it('handles nodes with missing properties', () => {
    const incompleteNodes = [
      {
        id: 'node1',
        label: 'Node 1',
        x: 100,
        y: 100,
        type: '',
        vx: 0,
        vy: 0,
      },
    ];

    renderWithRedux(
      <GraphLoader3d
        nodes={incompleteNodes}
        edges={mockEdges}
        setTooltip={mockSetTooltip}
        setEdgeTooltip={mockSetEdgeTooltip}
        ref={mockRef}
        containerDivHeightAndWidth={mockContainerDivHeightAndWidth}
      />,
      createMockInitialState()
    );

    const graphDataElement = screen.getByTestId('graph-data');
    const graphData = JSON.parse(graphDataElement.textContent || '{}');

    expect(graphData.nodes[0]).toEqual({
      id: 'node1',
      name: 'Node 1',
      type: '',
      x: 100,
      y: 100,
    });
  });

  it('handles edges with missing properties', () => {
    const incompleteEdges = [
      {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        label: '',
        cost: 5,
        data: '',
        sourceX: 100,
        sourceY: 100,
        targetX: 200,
        targetY: 200,
      },
    ];

    renderWithRedux(
      <GraphLoader3d
        nodes={mockNodes}
        edges={incompleteEdges}
        setTooltip={mockSetTooltip}
        setEdgeTooltip={mockSetEdgeTooltip}
        ref={mockRef}
        containerDivHeightAndWidth={mockContainerDivHeightAndWidth}
      />,
      createMockInitialState()
    );

    const graphDataElement = screen.getByTestId('graph-data');
    const graphData = JSON.parse(graphDataElement.textContent || '{}');

    expect(graphData.links[0]).toEqual({
      source: 'node1',
      target: 'node2',
      id: 'edge1',
      cost: 5,
      name: '',
    });
  });

  it('logs container dimensions to console', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    renderWithRedux(
      <GraphLoader3d
        nodes={mockNodes}
        edges={mockEdges}
        setTooltip={mockSetTooltip}
        setEdgeTooltip={mockSetEdgeTooltip}
        ref={mockRef}
        containerDivHeightAndWidth={mockContainerDivHeightAndWidth}
      />,
      createMockInitialState()
    );

    expect(consoleSpy).toHaveBeenCalledWith(mockContainerDivHeightAndWidth);
    consoleSpy.mockRestore();
  });

  it('handles theme changes', () => {
    // Test with dark theme
    mockUseAppContext.mockReturnValue({
      theme: 'dark',
    });

    renderWithRedux(
      <GraphLoader3d
        nodes={mockNodes}
        edges={mockEdges}
        setTooltip={mockSetTooltip}
        setEdgeTooltip={mockSetEdgeTooltip}
        ref={mockRef}
        containerDivHeightAndWidth={mockContainerDivHeightAndWidth}
      />,
      createMockInitialState()
    );

    expect(screen.getByTestId('force-graph-3d')).toBeInTheDocument();
  });
});
