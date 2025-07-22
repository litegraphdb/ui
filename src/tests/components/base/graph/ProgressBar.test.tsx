import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressBar from '@/components/base/graph/ProgressBar';
import { getPercentage, humanizeNumber } from '@/utils/dataUtils';

// Mock the utility functions
jest.mock('@/utils/dataUtils', () => ({
  getPercentage: jest.fn(),
  humanizeNumber: jest.fn(),
}));

describe('ProgressBar Component', () => {
  const mockGetPercentage = getPercentage as jest.MockedFunction<typeof getPercentage>;
  const mockHumanizeNumber = humanizeNumber as jest.MockedFunction<typeof humanizeNumber>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct props', () => {
    mockGetPercentage.mockReturnValue(50);
    mockHumanizeNumber.mockReturnValue('1,000');

    render(<ProgressBar loaded={1000} total={2000} label="Test Progress" />);

    expect(screen.getByText('Test Progress(1,000/1,000)')).toBeInTheDocument();
    expect(mockGetPercentage).toHaveBeenCalledWith(1000, 2000);
    expect(mockHumanizeNumber).toHaveBeenCalledWith(1000);
  });

  it('displays 100% progress when loaded equals total', () => {
    mockGetPercentage.mockReturnValue(100);
    mockHumanizeNumber.mockReturnValue('1,000');

    render(<ProgressBar loaded={1000} total={1000} label="Complete" />);

    expect(screen.getByText('Complete(1,000/1,000)')).toBeInTheDocument();
    expect(mockGetPercentage).toHaveBeenCalledWith(1000, 1000);
  });

  it('handles large numbers correctly', () => {
    mockGetPercentage.mockReturnValue(75);
    mockHumanizeNumber.mockReturnValue('1,000,000');

    render(<ProgressBar loaded={750000} total={1000000} label="Large Numbers" />);

    expect(screen.getByText('Large Numbers(1,000,000/1,000,000)')).toBeInTheDocument();
    expect(mockGetPercentage).toHaveBeenCalledWith(750000, 1000000);
  });

  it('handles edge case with very large total', () => {
    mockGetPercentage.mockReturnValue(0.01);
    mockHumanizeNumber.mockReturnValue('1,000,000,000');

    render(<ProgressBar loaded={100000000} total={1000000000000} label="Huge Total" />);

    expect(screen.getByText('Huge Total(1,000,000,000/1,000,000,000)')).toBeInTheDocument();
    expect(mockGetPercentage).toHaveBeenCalledWith(100000000, 1000000000000);
  });

  it('renders progress bar with correct styling classes', () => {
    mockGetPercentage.mockReturnValue(50);
    mockHumanizeNumber.mockReturnValue('500');

    const { container } = render(<ProgressBar loaded={500} total={1000} label="Test" />);

    const progressContainer = container.querySelector('.progressContainer');
    expect(progressContainer).toBeInTheDocument();
  });
});
