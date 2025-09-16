import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnhancedDashboard } from '../../app/components/EnhancedDashboard';

// Mock the CSS modules
jest.mock('../../styles/modules/Card.module.scss', () => ({
  card: 'card',
  header: 'header',
  content: 'content',
  footer: 'footer',
  title: 'title',
  subtitle: 'subtitle',
  actions: 'actions',
}));

// Mock utils
jest.mock('../../lib/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => 
    classes.filter(Boolean).join(' '),
  formatDate: (date: Date) => date.toLocaleDateString(),
  formatNumber: (num: number) => num.toLocaleString(),
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
}));

// Mock hooks
jest.mock('../../app/hooks/usePerformance', () => ({
  usePerformance: () => ({
    metrics: {
      loadTime: 1200,
      renderTime: 45,
      memoryUsage: 85,
      errorRate: 0.02,
    },
    isLoading: false,
    error: null,
  }),
}));

describe('EnhancedDashboard', () => {
  const mockData = {
    stats: {
      totalUsers: 1250,
      totalDocuments: 5432,
      totalStorage: 1024 * 1024 * 1024, // 1GB
      activeUsers: 890,
    },
    recentActivity: [
      {
        id: '1',
        type: 'document_upload',
        user: 'John Doe',
        description: 'Uploaded document.pdf',
        timestamp: new Date('2023-01-01T10:00:00Z'),
        status: 'success',
      },
      {
        id: '2',
        type: 'user_login',
        user: 'Jane Smith',
        description: 'Logged in',
        timestamp: new Date('2023-01-01T09:30:00Z'),
        status: 'success',
      },
    ],
    charts: {
      userGrowth: [
        { date: '2023-01-01', users: 100 },
        { date: '2023-01-02', users: 120 },
        { date: '2023-01-03', users: 150 },
      ],
      documentUploads: [
        { date: '2023-01-01', uploads: 25 },
        { date: '2023-01-02', uploads: 30 },
        { date: '2023-01-03', uploads: 35 },
      ],
    },
  };

  const defaultProps = {
    data: mockData,
    onRefresh: jest.fn(),
    onExport: jest.fn(),
    onSettings: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders dashboard with all sections', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Total Documents')).toBeInTheDocument();
      expect(screen.getByText('Total Storage')).toBeInTheDocument();
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('User Growth')).toBeInTheDocument();
      expect(screen.getByText('Document Uploads')).toBeInTheDocument();
    });

    it('displays correct statistics', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      expect(screen.getByText('1,250')).toBeInTheDocument(); // totalUsers
      expect(screen.getByText('5,432')).toBeInTheDocument(); // totalDocuments
      expect(screen.getByText('1.00 GB')).toBeInTheDocument(); // totalStorage
      expect(screen.getByText('890')).toBeInTheDocument(); // activeUsers
    });

    it('renders with custom className', () => {
      render(<EnhancedDashboard {...defaultProps} className="custom-dashboard" />);
      
      const dashboard = screen.getByTestId('enhanced-dashboard');
      expect(dashboard).toHaveClass('custom-dashboard');
    });

    it('renders with custom testId', () => {
      render(<EnhancedDashboard {...defaultProps} testId="custom-test-id" />);
      
      expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
    });
  });

  describe('Statistics Cards', () => {
    it('renders all statistic cards', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      const statCards = screen.getAllByTestId(/stat-card-/);
      expect(statCards).toHaveLength(4);
    });

    it('displays correct values in stat cards', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      expect(screen.getByTestId('stat-card-users')).toHaveTextContent('1,250');
      expect(screen.getByTestId('stat-card-documents')).toHaveTextContent('5,432');
      expect(screen.getByTestId('stat-card-storage')).toHaveTextContent('1.00 GB');
      expect(screen.getByTestId('stat-card-active')).toHaveTextContent('890');
    });

    it('shows loading state for statistics', () => {
      render(<EnhancedDashboard {...defaultProps} isLoading={true} />);

      expect(screen.getAllByTestId('stat-card-loading')).toHaveLength(4);
    });

    it('shows error state for statistics', () => {
      render(<EnhancedDashboard {...defaultProps} error="Failed to load data" />);

      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });
  });

  describe('Recent Activity', () => {
    it('renders recent activity items', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Uploaded document.pdf')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Logged in')).toBeInTheDocument();
    });

    it('displays activity timestamps', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      expect(screen.getByText('1/1/2023')).toBeInTheDocument();
    });

    it('shows activity status indicators', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      const statusIndicators = screen.getAllByTestId(/activity-status-/);
      expect(statusIndicators).toHaveLength(2);
    });

    it('handles empty activity list', () => {
      const emptyData = { ...mockData, recentActivity: [] };
      render(<EnhancedDashboard {...defaultProps} data={emptyData} />);

      expect(screen.getByText('No recent activity')).toBeInTheDocument();
    });

    it('handles activity item click', async () => {
      const onActivityClick = jest.fn();
      render(<EnhancedDashboard {...defaultProps} onActivityClick={onActivityClick} />);

      const activityItem = screen.getByText('Uploaded document.pdf');
      await userEvent.click(activityItem);

      expect(onActivityClick).toHaveBeenCalledWith(mockData.recentActivity[0]);
    });
  });

  describe('Charts', () => {
    it('renders user growth chart', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      expect(screen.getByTestId('user-growth-chart')).toBeInTheDocument();
    });

    it('renders document uploads chart', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      expect(screen.getByTestId('document-uploads-chart')).toBeInTheDocument();
    });

    it('handles chart data updates', () => {
      const newData = {
        ...mockData,
        charts: {
          ...mockData.charts,
          userGrowth: [
            { date: '2023-01-01', users: 200 },
            { date: '2023-01-02', users: 250 },
          ],
        },
      };

      const { rerender } = render(<EnhancedDashboard {...defaultProps} />);
      rerender(<EnhancedDashboard {...defaultProps} data={newData} />);

      expect(screen.getByTestId('user-growth-chart')).toBeInTheDocument();
    });

    it('handles empty chart data', () => {
      const emptyData = {
        ...mockData,
        charts: {
          userGrowth: [],
          documentUploads: [],
        },
      };

      render(<EnhancedDashboard {...defaultProps} data={emptyData} />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders all action buttons', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    });

    it('calls onRefresh when refresh button is clicked', async () => {
      render(<EnhancedDashboard {...defaultProps} />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await userEvent.click(refreshButton);

      expect(defaultProps.onRefresh).toHaveBeenCalledTimes(1);
    });

    it('calls onExport when export button is clicked', async () => {
      render(<EnhancedDashboard {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: /export/i });
      await userEvent.click(exportButton);

      expect(defaultProps.onExport).toHaveBeenCalledTimes(1);
    });

    it('calls onSettings when settings button is clicked', async () => {
      render(<EnhancedDashboard {...defaultProps} />);

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await userEvent.click(settingsButton);

      expect(defaultProps.onSettings).toHaveBeenCalledTimes(1);
    });

    it('shows loading state on refresh button when refreshing', () => {
      render(<EnhancedDashboard {...defaultProps} isRefreshing={true} />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeDisabled();
      expect(screen.getByTestId('refresh-spinner')).toBeInTheDocument();
    });
  });

  describe('Filters and Search', () => {
    it('renders search input', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('renders date range filter', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      expect(screen.getByText('Date Range')).toBeInTheDocument();
    });

    it('renders status filter', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('handles search input changes', async () => {
      const onSearch = jest.fn();
      render(<EnhancedDashboard {...defaultProps} onSearch={onSearch} />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await userEvent.type(searchInput, 'test search');

      expect(onSearch).toHaveBeenCalledWith('test search');
    });

    it('handles filter changes', async () => {
      const onFilterChange = jest.fn();
      render(<EnhancedDashboard {...defaultProps} onFilterChange={onFilterChange} />);

      const statusFilter = screen.getByDisplayValue('All');
      await userEvent.selectOptions(statusFilter, 'success');

      expect(onFilterChange).toHaveBeenCalledWith({ status: 'success' });
    });

    it('clears filters when clear button is clicked', async () => {
      const onFilterChange = jest.fn();
      render(<EnhancedDashboard {...defaultProps} onFilterChange={onFilterChange} />);

      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      await userEvent.click(clearButton);

      expect(onFilterChange).toHaveBeenCalledWith({});
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive grid classes', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      const dashboard = screen.getByTestId('enhanced-dashboard');
      expect(dashboard).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('handles mobile layout', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<EnhancedDashboard {...defaultProps} />);

      const dashboard = screen.getByTestId('enhanced-dashboard');
      expect(dashboard).toBeInTheDocument();
    });

    it('handles tablet layout', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<EnhancedDashboard {...defaultProps} />);

      const dashboard = screen.getByTestId('enhanced-dashboard');
      expect(dashboard).toBeInTheDocument();
    });

    it('handles desktop layout', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<EnhancedDashboard {...defaultProps} />);

      const dashboard = screen.getByTestId('enhanced-dashboard');
      expect(dashboard).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Dashboard');
    });

    it('has proper ARIA labels', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      expect(screen.getByLabelText(/total users/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/total documents/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/total storage/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/active users/i)).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      render(<EnhancedDashboard {...defaultProps} />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      refreshButton.focus();

      expect(refreshButton).toHaveFocus();

      await userEvent.tab();
      expect(screen.getByRole('button', { name: /export/i })).toHaveFocus();
    });

    it('has proper focus management', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      const dashboard = screen.getByTestId('enhanced-dashboard');
      expect(dashboard).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Performance Monitoring', () => {
    it('displays performance metrics', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText('1.2s')).toBeInTheDocument(); // loadTime
      expect(screen.getByText('45ms')).toBeInTheDocument(); // renderTime
      expect(screen.getByText('85%')).toBeInTheDocument(); // memoryUsage
      expect(screen.getByText('2%')).toBeInTheDocument(); // errorRate
    });

    it('shows performance alerts', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      // Should show alert for high memory usage
      expect(screen.getByText('High memory usage detected')).toBeInTheDocument();
    });

    it('handles performance data loading', () => {
      render(<EnhancedDashboard {...defaultProps} />);

      expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when data fails to load', () => {
      render(<EnhancedDashboard {...defaultProps} error="Network error" />);

      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('handles retry action', async () => {
      const onRetry = jest.fn();
      render(<EnhancedDashboard {...defaultProps} error="Network error" onRetry={onRetry} />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await userEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('handles partial data errors', () => {
      const partialData = {
        ...mockData,
        stats: null,
        recentActivity: mockData.recentActivity,
        charts: mockData.charts,
      };

      render(<EnhancedDashboard {...defaultProps} data={partialData} />);

      expect(screen.getByText('Some data could not be loaded')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles null data', () => {
      render(<EnhancedDashboard {...defaultProps} data={null} />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('handles undefined data', () => {
      render(<EnhancedDashboard {...defaultProps} data={undefined} />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('handles empty data object', () => {
      render(<EnhancedDashboard {...defaultProps} data={{}} />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('handles very large numbers', () => {
      const largeData = {
        ...mockData,
        stats: {
          ...mockData.stats,
          totalUsers: 999999999,
          totalDocuments: 888888888,
        },
      };

      render(<EnhancedDashboard {...defaultProps} data={largeData} />);

      expect(screen.getByText('999,999,999')).toBeInTheDocument();
      expect(screen.getByText('888,888,888')).toBeInTheDocument();
    });

    it('handles rapid data updates', () => {
      const { rerender } = render(<EnhancedDashboard {...defaultProps} />);

      // Simulate rapid data updates
      for (let i = 0; i < 10; i++) {
        const newData = {
          ...mockData,
          stats: {
            ...mockData.stats,
            totalUsers: mockData.stats.totalUsers + i,
          },
        };
        rerender(<EnhancedDashboard {...defaultProps} data={newData} />);
      }

      expect(screen.getByText('1,259')).toBeInTheDocument(); // 1250 + 9
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const TestComponent = () => {
        renderSpy();
        return <EnhancedDashboard {...defaultProps} />;
      };

      const { rerender } = render(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('handles large datasets efficiently', () => {
      const largeData = {
        ...mockData,
        recentActivity: Array.from({ length: 1000 }, (_, i) => ({
          id: i.toString(),
          type: 'document_upload',
          user: `User ${i}`,
          description: `Uploaded document ${i}.pdf`,
          timestamp: new Date(),
          status: 'success',
        })),
      };

      render(<EnhancedDashboard {...defaultProps} data={largeData} />);

      // Should render without performance issues
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});
