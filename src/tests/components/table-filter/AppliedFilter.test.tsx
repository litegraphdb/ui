import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AppliedFilter from '@/components/table-filter/AppliedFilter';
import { EnumerateAndSearchRequest } from 'litegraphdb/dist/types/types';

// Mock the utility function
jest.mock('@/utils/dataUtils', () => ({
  humanizeNumber: jest.fn((num) => num.toString()),
}));

describe('AppliedFilter Component', () => {
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when searchParams is empty', () => {
    const emptySearchParams: EnumerateAndSearchRequest = {};

    render(
      <AppliedFilter
        searchParams={emptySearchParams}
        totalRecords={0}
        entityName="items"
        onClear={mockOnClear}
      />
    );

    expect(screen.queryByText(/found/)).not.toBeInTheDocument();
    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });

  it('renders total records count with default entity name', () => {
    const searchParams: EnumerateAndSearchRequest = {
      Labels: ['label1'],
    };

    render(<AppliedFilter searchParams={searchParams} totalRecords={42} onClear={mockOnClear} />);

    expect(screen.getByText('42 record(s) found')).toBeInTheDocument();
  });

  it('renders total records count with custom entity name', () => {
    const searchParams: EnumerateAndSearchRequest = {
      Labels: ['label1'],
    };

    render(
      <AppliedFilter
        searchParams={searchParams}
        totalRecords={15}
        entityName="users"
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText('15 users found')).toBeInTheDocument();
  });

  it('renders labels when present in searchParams', () => {
    const searchParams: EnumerateAndSearchRequest = {
      Labels: ['label1', 'label2', 'label3'],
    };

    render(<AppliedFilter searchParams={searchParams} totalRecords={10} onClear={mockOnClear} />);

    expect(screen.getByText('Label:')).toBeInTheDocument();
    expect(screen.getByText('label1')).toBeInTheDocument();
    expect(screen.getByText('label2')).toBeInTheDocument();
    expect(screen.getByText('label3')).toBeInTheDocument();
  });

  it('renders tags when present in searchParams', () => {
    const searchParams: EnumerateAndSearchRequest = {
      Tags: {
        category: 'important',
        status: 'active',
        priority: 'high',
      },
    };

    render(<AppliedFilter searchParams={searchParams} totalRecords={25} onClear={mockOnClear} />);

    expect(screen.getByText('Tag:')).toBeInTheDocument();
    expect(screen.getByText('category: important')).toBeInTheDocument();
    expect(screen.getByText('status: active')).toBeInTheDocument();
    expect(screen.getByText('priority: high')).toBeInTheDocument();
  });

  it('renders expression when present in searchParams', () => {
    const searchParams: EnumerateAndSearchRequest = {
      Expr: {
        operator: 'AND',
        conditions: [{ field: 'name', operator: 'contains', value: 'test' }],
      },
    };

    render(<AppliedFilter searchParams={searchParams} totalRecords={8} onClear={mockOnClear} />);

    expect(screen.getByText('Expr:')).toBeInTheDocument();
    expect(screen.getByText(JSON.stringify(searchParams.Expr))).toBeInTheDocument();
  });

  it('renders all filter types together', () => {
    const searchParams: EnumerateAndSearchRequest = {
      Labels: ['important', 'urgent'],
      Tags: {
        category: 'bug',
        priority: 'critical',
      },
      Expr: {
        operator: 'OR',
        conditions: [{ field: 'status', operator: 'equals', value: 'open' }],
      },
    };

    render(
      <AppliedFilter
        searchParams={searchParams}
        totalRecords={12}
        entityName="issues"
        onClear={mockOnClear}
      />
    );

    // Check total records
    expect(screen.getByText('12 issues found')).toBeInTheDocument();

    // Check labels
    expect(screen.getByText('Label:')).toBeInTheDocument();
    expect(screen.getByText('important')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();

    // Check tags
    expect(screen.getByText('Tag:')).toBeInTheDocument();
    expect(screen.getByText('category: bug')).toBeInTheDocument();
    expect(screen.getByText('priority: critical')).toBeInTheDocument();

    // Check expression
    expect(screen.getByText('Expr:')).toBeInTheDocument();
    expect(screen.getByText(JSON.stringify(searchParams.Expr))).toBeInTheDocument();

    // Check clear button
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', () => {
    const searchParams: EnumerateAndSearchRequest = {
      Labels: ['test'],
    };

    render(<AppliedFilter searchParams={searchParams} totalRecords={5} onClear={mockOnClear} />);

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  it('handles empty labels array', () => {
    const searchParams: EnumerateAndSearchRequest = {
      Labels: [],
    };

    render(<AppliedFilter searchParams={searchParams} totalRecords={0} onClear={mockOnClear} />);

    expect(screen.getByText('0 record(s) found')).toBeInTheDocument();
    expect(screen.queryByText('Label:')).not.toBeInTheDocument();
  });

  it('handles empty tags object', () => {
    const searchParams: EnumerateAndSearchRequest = {
      Tags: {},
    };

    render(<AppliedFilter searchParams={searchParams} totalRecords={0} onClear={mockOnClear} />);

    expect(screen.getByText('0 record(s) found')).toBeInTheDocument();
    expect(screen.queryByText('Tag:')).not.toBeInTheDocument();
  });

  it('handles empty expression object', () => {
    const searchParams: EnumerateAndSearchRequest = {
      Expr: {},
    };

    render(<AppliedFilter searchParams={searchParams} totalRecords={0} onClear={mockOnClear} />);

    expect(screen.getByText('0 record(s) found')).toBeInTheDocument();
    expect(screen.queryByText('Expr:')).not.toBeInTheDocument();
  });

  it('handles null/undefined values gracefully', () => {
    const searchParams: EnumerateAndSearchRequest = {
      Labels: undefined,
      Tags: null as any,
      Expr: undefined,
    };

    render(<AppliedFilter searchParams={searchParams} totalRecords={0} onClear={mockOnClear} />);

    expect(screen.getByText('0 record(s) found')).toBeInTheDocument();
    expect(screen.queryByText('Label:')).not.toBeInTheDocument();
    expect(screen.queryByText('Tag:')).not.toBeInTheDocument();
    expect(screen.queryByText('Expr:')).not.toBeInTheDocument();
  });

  it('renders with only total records when no filters are applied', () => {
    const searchParams: EnumerateAndSearchRequest = {
      // Empty object but still has keys (length > 0)
      Labels: [],
      Tags: {},
      Expr: {},
    };

    render(<AppliedFilter searchParams={searchParams} totalRecords={100} onClear={mockOnClear} />);

    expect(screen.getByText('100 record(s) found')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });
});
