import '@testing-library/jest-dom';
import { applyForceLayout } from '@/lib/graph/layout';
import { NodeData, EdgeData } from '@/lib/graph/types';

describe('Graph Layout', () => {
  describe('applyForceLayout', () => {
    let mockNodes: NodeData[];
    let mockEdges: EdgeData[];

    beforeEach(() => {
      mockNodes = [
        {
          id: 'node1',
          label: 'Node 1',
          type: 'default',
          x: 100,
          y: 100,
          z: 0,
          vx: 0,
          vy: 0,
          isDragging: false,
        },
        {
          id: 'node2',
          label: 'Node 2',
          type: 'default',
          x: 200,
          y: 200,
          z: 0,
          vx: 0,
          vy: 0,
          isDragging: false,
        },
        {
          id: 'node3',
          label: 'Node 3',
          type: 'default',
          x: 300,
          y: 300,
          z: 0,
          vx: 0,
          vy: 0,
          isDragging: false,
        },
      ];

      mockEdges = [
        {
          id: 'edge1',
          source: 'node1',
          target: 'node2',
          cost: 5,
          data: '{}',
          sourceX: 100,
          sourceY: 100,
          targetX: 200,
          targetY: 200,
        },
        {
          id: 'edge2',
          source: 'node2',
          target: 'node3',
          cost: 3,
          data: '{}',
          sourceX: 200,
          sourceY: 200,
          targetX: 300,
          targetY: 300,
        },
      ];
    });

    it('should apply force layout to nodes', () => {
      const originalX = mockNodes[0].x;
      const originalY = mockNodes[0].y;

      applyForceLayout(mockNodes, mockEdges);

      // Nodes should have their positions updated
      expect(mockNodes[0].x).not.toBe(originalX);
      expect(mockNodes[0].y).not.toBe(originalY);
    });

    it('should skip force calculations for dragging nodes', () => {
      mockNodes[0].isDragging = true;
      const originalX = mockNodes[0].x;
      const originalY = mockNodes[0].y;

      applyForceLayout(mockNodes, mockEdges);

      // Dragging node should not move
      expect(mockNodes[0].x).toBe(originalX);
      expect(mockNodes[0].y).toBe(originalY);
      expect(mockNodes[0].vx).toBe(0);
      expect(mockNodes[0].vy).toBe(0);
    });

    it('should apply gravity to center', () => {
      // Place node far from center (400, 300)
      mockNodes[0].x = 0;
      mockNodes[0].y = 0;
      mockNodes[0].vx = 0;
      mockNodes[0].vy = 0;

      applyForceLayout(mockNodes, mockEdges);

      // Node should move towards center
      expect(mockNodes[0].x).toBeGreaterThan(0);
      expect(mockNodes[0].y).toBeGreaterThan(0);
    });

    it('should apply repulsion between nodes', () => {
      // Place nodes very close together
      mockNodes[0].x = 100;
      mockNodes[0].y = 100;
      mockNodes[1].x = 101;
      mockNodes[1].y = 101;

      applyForceLayout(mockNodes, mockEdges);

      // Nodes should move apart due to repulsion
      const distance = Math.sqrt(
        Math.pow(mockNodes[1].x - mockNodes[0].x, 2) + Math.pow(mockNodes[1].y - mockNodes[0].y, 2)
      );
      expect(distance).toBeGreaterThan(1);
    });

    it('should apply spring forces along edges', () => {
      // Place connected nodes far apart
      mockNodes[0].x = 0;
      mockNodes[0].y = 0;
      mockNodes[1].x = 500;
      mockNodes[1].y = 500;

      applyForceLayout(mockNodes, mockEdges);

      // Connected nodes should move closer due to spring force
      const distance = Math.sqrt(
        Math.pow(mockNodes[1].x - mockNodes[0].x, 2) + Math.pow(mockNodes[1].y - mockNodes[0].y, 2)
      );
      expect(distance).toBeLessThan(500);
    });

    it('should constrain nodes to bounds', () => {
      // Place node outside bounds
      mockNodes[0].x = 1000;
      mockNodes[0].y = 1000;

      applyForceLayout(mockNodes, mockEdges);

      // Node should be constrained to bounds (50-750, 50-550)
      expect(mockNodes[0].x).toBeLessThanOrEqual(750);
      expect(mockNodes[0].x).toBeGreaterThanOrEqual(50);
      expect(mockNodes[0].y).toBeLessThanOrEqual(550);
      expect(mockNodes[0].y).toBeGreaterThanOrEqual(50);
    });

    it('should handle edge with missing source node', () => {
      const edgeWithMissingSource: EdgeData = {
        id: 'edge3',
        source: 'missing-node',
        target: 'node1',
        cost: 1,
        data: '{}',
        sourceX: 0,
        sourceY: 0,
        targetX: 100,
        targetY: 100,
      };

      expect(() => {
        applyForceLayout(mockNodes, [edgeWithMissingSource]);
      }).not.toThrow();
    });

    it('should handle edge with missing target node', () => {
      const edgeWithMissingTarget: EdgeData = {
        id: 'edge3',
        source: 'node1',
        target: 'missing-node',
        cost: 1,
        data: '{}',
        sourceX: 100,
        sourceY: 100,
        targetX: 0,
        targetY: 0,
      };

      expect(() => {
        applyForceLayout(mockNodes, [edgeWithMissingTarget]);
      }).not.toThrow();
    });

    it('should handle edge with dragging source node', () => {
      mockNodes[0].isDragging = true;
      const originalSourceX = mockEdges[0].sourceX;
      const originalSourceY = mockEdges[0].sourceY;

      applyForceLayout(mockNodes, mockEdges);

      // Edge coordinates should not change if source is dragging
      expect(mockEdges[0].sourceX).toBe(originalSourceX);
      expect(mockEdges[0].sourceY).toBe(originalSourceY);
    });

    it('should handle edge with dragging target node', () => {
      mockNodes[1].isDragging = true;
      const originalTargetX = mockEdges[0].targetX;
      const originalTargetY = mockEdges[0].targetY;

      applyForceLayout(mockNodes, mockEdges);

      // Edge coordinates should not change if target is dragging
      expect(mockEdges[0].targetX).toBe(originalTargetX);
      expect(mockEdges[0].targetY).toBe(originalTargetY);
    });

    it('should handle zero distance between nodes', () => {
      // Place nodes at exactly the same position
      mockNodes[0].x = 100;
      mockNodes[0].y = 100;
      mockNodes[1].x = 100;
      mockNodes[1].y = 100;

      expect(() => {
        applyForceLayout(mockNodes, mockEdges);
      }).not.toThrow();
    });

    it('should handle empty nodes array', () => {
      expect(() => {
        applyForceLayout([], mockEdges);
      }).not.toThrow();
    });

    it('should handle empty edges array', () => {
      expect(() => {
        applyForceLayout(mockNodes, []);
      }).not.toThrow();
    });

    it('should handle both empty arrays', () => {
      expect(() => {
        applyForceLayout([], []);
      }).not.toThrow();
    });
  });
});
