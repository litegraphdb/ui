import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithRedux } from '../../store/utils';
import { createMockStore } from '../../store/mockStore';
import { mockGraphData } from '../mockData';
import { waitFor } from '@testing-library/react';
import DashboardHomePage from '@/app/dashboard/[tenantId]/page';

let container: any;
describe('HomePage with Mock API', () => {
  afterEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  const store = createMockStore();

  it('renders the GraphViewer and select one graph', async () => {
    const wrapper = renderWithRedux(
      <DashboardHomePage />,
      {
        ...store,
        graphsList: {
          graphs: mockGraphData,
        },
        liteGraph: {
          ...store.getState().liteGraph,
          selectedGraph: 'e6d4294e-6f49-4d67-8260-5e44c2b077a6',
        },
      } as any,
      true
    );

    waitFor(() => {
      // Verify the select dropdown for graphs
      const graphSelect = screen.getByTestId('litegraph-select');
      expect(graphSelect).toBeInTheDocument();
      expect(graphSelect).toHaveTextContent('Test Demo Graph'); // Adjusted expectation for the mock
    });
    expect(wrapper.container).toMatchSnapshot();
  });
});
