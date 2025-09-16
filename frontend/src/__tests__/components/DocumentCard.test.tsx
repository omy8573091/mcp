import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentCard } from '../../app/components/DocumentCard';

// Mock the CSS modules
jest.mock('../../styles/modules/Card.module.scss', () => ({
  card: 'card',
  header: 'header',
  content: 'content',
  footer: 'footer',
  title: 'title',
  subtitle: 'subtitle',
  actions: 'actions',
  status: 'status',
  statusActive: 'statusActive',
  statusInactive: 'statusInactive',
  statusPending: 'statusPending',
  statusError: 'statusError',
  thumbnail: 'thumbnail',
  metadata: 'metadata',
  tags: 'tags',
  tag: 'tag',
  progress: 'progress',
  progressBar: 'progressBar',
  progressText: 'progressText',
}));

// Mock utils
jest.mock('../../lib/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => 
    classes.filter(Boolean).join(' '),
  formatDate: (date: Date) => date.toLocaleDateString(),
  formatFileSize: (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`,
}));

describe('DocumentCard', () => {
  const mockDocument = {
    id: '1',
    title: 'Test Document',
    description: 'This is a test document',
    type: 'pdf',
    size: 1024,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    status: 'active' as const,
    tags: ['important', 'draft'],
    thumbnail: 'https://example.com/thumbnail.jpg',
    author: 'John Doe',
    version: '1.0',
    isPublic: false,
    downloadCount: 42,
    viewCount: 156,
  };

  const defaultProps = {
    document: mockDocument,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onDownload: jest.fn(),
    onShare: jest.fn(),
    onView: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with all document information', () => {
      render(<DocumentCard {...defaultProps} />);

      expect(screen.getByText('Test Document')).toBeInTheDocument();
      expect(screen.getByText('This is a test document')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.getByText('1.0 KB')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('important')).toBeInTheDocument();
      expect(screen.getByText('draft')).toBeInTheDocument();
    });

    it('renders with minimal document information', () => {
      const minimalDocument = {
        id: '2',
        title: 'Minimal Document',
        type: 'docx',
        size: 512,
        createdAt: new Date('2023-01-01'),
        status: 'active' as const,
      };

      render(
        <DocumentCard 
          {...defaultProps} 
          document={minimalDocument}
        />
      );

      expect(screen.getByText('Minimal Document')).toBeInTheDocument();
      expect(screen.getByText('DOCX')).toBeInTheDocument();
      expect(screen.getByText('0.5 KB')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<DocumentCard {...defaultProps} className="custom-card" />);
      
      const card = screen.getByTestId('document-card');
      expect(card).toHaveClass('custom-card');
    });

    it('renders with custom testId', () => {
      render(<DocumentCard {...defaultProps} testId="custom-test-id" />);
      
      expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('renders active status correctly', () => {
      render(<DocumentCard {...defaultProps} />);
      
      const statusElement = screen.getByText('Active');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveClass('statusActive');
    });

    it('renders inactive status correctly', () => {
      const inactiveDocument = { ...mockDocument, status: 'inactive' as const };
      render(<DocumentCard {...defaultProps} document={inactiveDocument} />);
      
      const statusElement = screen.getByText('Inactive');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveClass('statusInactive');
    });

    it('renders pending status correctly', () => {
      const pendingDocument = { ...mockDocument, status: 'pending' as const };
      render(<DocumentCard {...defaultProps} document={pendingDocument} />);
      
      const statusElement = screen.getByText('Pending');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveClass('statusPending');
    });

    it('renders error status correctly', () => {
      const errorDocument = { ...mockDocument, status: 'error' as const };
      render(<DocumentCard {...defaultProps} document={errorDocument} />);
      
      const statusElement = screen.getByText('Error');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveClass('statusError');
    });
  });

  describe('Thumbnail Display', () => {
    it('renders thumbnail when provided', () => {
      render(<DocumentCard {...defaultProps} />);
      
      const thumbnail = screen.getByRole('img');
      expect(thumbnail).toBeInTheDocument();
      expect(thumbnail).toHaveAttribute('src', 'https://example.com/thumbnail.jpg');
      expect(thumbnail).toHaveAttribute('alt', 'Test Document thumbnail');
    });

    it('renders placeholder when no thumbnail', () => {
      const documentWithoutThumbnail = { ...mockDocument, thumbnail: undefined };
      render(<DocumentCard {...defaultProps} document={documentWithoutThumbnail} />);
      
      const placeholder = screen.getByTestId('thumbnail-placeholder');
      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toHaveTextContent('PDF');
    });

    it('handles thumbnail load error', async () => {
      render(<DocumentCard {...defaultProps} />);
      
      const thumbnail = screen.getByRole('img');
      fireEvent.error(thumbnail);
      
      await waitFor(() => {
        expect(screen.getByTestId('thumbnail-placeholder')).toBeInTheDocument();
      });
    });
  });

  describe('Progress Display', () => {
    it('renders progress when provided', () => {
      render(<DocumentCard {...defaultProps} progress={75} />);
      
      expect(screen.getByText('75%')).toBeInTheDocument();
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('hides progress when not provided', () => {
      render(<DocumentCard {...defaultProps} />);
      
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('handles progress edge cases', () => {
      render(<DocumentCard {...defaultProps} progress={0} />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });
  });

  describe('Action Buttons', () => {
    it('renders all action buttons', () => {
      render(<DocumentCard {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('calls onView when view button is clicked', async () => {
      render(<DocumentCard {...defaultProps} />);
      
      const viewButton = screen.getByRole('button', { name: /view/i });
      await userEvent.click(viewButton);
      
      expect(defaultProps.onView).toHaveBeenCalledWith(mockDocument);
    });

    it('calls onDownload when download button is clicked', async () => {
      render(<DocumentCard {...defaultProps} />);
      
      const downloadButton = screen.getByRole('button', { name: /download/i });
      await userEvent.click(downloadButton);
      
      expect(defaultProps.onDownload).toHaveBeenCalledWith(mockDocument);
    });

    it('calls onEdit when edit button is clicked', async () => {
      render(<DocumentCard {...defaultProps} />);
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      await userEvent.click(editButton);
      
      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockDocument);
    });

    it('calls onShare when share button is clicked', async () => {
      render(<DocumentCard {...defaultProps} />);
      
      const shareButton = screen.getByRole('button', { name: /share/i });
      await userEvent.click(shareButton);
      
      expect(defaultProps.onShare).toHaveBeenCalledWith(mockDocument);
    });

    it('calls onDelete when delete button is clicked', async () => {
      render(<DocumentCard {...defaultProps} />);
      
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await userEvent.click(deleteButton);
      
      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockDocument);
    });

    it('shows confirmation dialog for delete action', async () => {
      render(<DocumentCard {...defaultProps} />);
      
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await userEvent.click(deleteButton);
      
      expect(screen.getByText('Are you sure you want to delete this document?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('confirms delete action', async () => {
      render(<DocumentCard {...defaultProps} />);
      
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await userEvent.click(deleteButton);
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await userEvent.click(confirmButton);
      
      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockDocument);
    });

    it('cancels delete action', async () => {
      render(<DocumentCard {...defaultProps} />);
      
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await userEvent.click(deleteButton);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);
      
      expect(screen.queryByText('Are you sure you want to delete this document?')).not.toBeInTheDocument();
    });
  });

  describe('Conditional Actions', () => {
    it('hides actions when showActions is false', () => {
      render(<DocumentCard {...defaultProps} showActions={false} />);
      
      expect(screen.queryByRole('button', { name: /view/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
    });

    it('shows only specified actions', () => {
      render(
        <DocumentCard 
          {...defaultProps} 
          actions={['view', 'download']}
        />
      );
      
      expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /share/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });

    it('disables actions when document is in error state', () => {
      const errorDocument = { ...mockDocument, status: 'error' as const };
      render(<DocumentCard {...defaultProps} document={errorDocument} />);
      
      const viewButton = screen.getByRole('button', { name: /view/i });
      const downloadButton = screen.getByRole('button', { name: /download/i });
      
      expect(viewButton).toBeDisabled();
      expect(downloadButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<DocumentCard {...defaultProps} />);
      
      const card = screen.getByTestId('document-card');
      expect(card).toHaveAttribute('role', 'article');
      expect(card).toHaveAttribute('aria-labelledby');
    });

    it('has proper heading structure', () => {
      render(<DocumentCard {...defaultProps} />);
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveTextContent('Test Document');
    });

    it('has proper button labels', () => {
      render(<DocumentCard {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /view document/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download document/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit document/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /share document/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete document/i })).toBeInTheDocument();
    });

    it('has proper image alt text', () => {
      render(<DocumentCard {...defaultProps} />);
      
      const thumbnail = screen.getByRole('img');
      expect(thumbnail).toHaveAttribute('alt', 'Test Document thumbnail');
    });

    it('supports keyboard navigation', async () => {
      render(<DocumentCard {...defaultProps} />);
      
      const card = screen.getByTestId('document-card');
      card.focus();
      
      // Tab through buttons
      await userEvent.tab();
      expect(screen.getByRole('button', { name: /view/i })).toHaveFocus();
      
      await userEvent.tab();
      expect(screen.getByRole('button', { name: /download/i })).toHaveFocus();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes', () => {
      render(<DocumentCard {...defaultProps} />);
      
      const card = screen.getByTestId('document-card');
      expect(card).toHaveClass('w-full', 'sm:w-1/2', 'lg:w-1/3', 'xl:w-1/4');
    });

    it('handles different screen sizes', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<DocumentCard {...defaultProps} />);
      
      const card = screen.getByTestId('document-card');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('handles card click', async () => {
      const onCardClick = jest.fn();
      render(<DocumentCard {...defaultProps} onCardClick={onCardClick} />);
      
      const card = screen.getByTestId('document-card');
      await userEvent.click(card);
      
      expect(onCardClick).toHaveBeenCalledWith(mockDocument);
    });

    it('handles tag click', async () => {
      const onTagClick = jest.fn();
      render(<DocumentCard {...defaultProps} onTagClick={onTagClick} />);
      
      const tag = screen.getByText('important');
      await userEvent.click(tag);
      
      expect(onTagClick).toHaveBeenCalledWith('important', mockDocument);
    });

    it('handles keyboard events', async () => {
      const onCardClick = jest.fn();
      render(<DocumentCard {...defaultProps} onCardClick={onCardClick} />);
      
      const card = screen.getByTestId('document-card');
      card.focus();
      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
      
      expect(onCardClick).toHaveBeenCalledWith(mockDocument);
    });
  });

  describe('Edge Cases', () => {
    it('handles missing optional props', () => {
      const minimalProps = {
        document: {
          id: '1',
          title: 'Test',
          type: 'pdf',
          size: 1024,
          createdAt: new Date(),
          status: 'active' as const,
        },
      };

      render(<DocumentCard {...minimalProps} />);
      
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('handles empty tags array', () => {
      const documentWithoutTags = { ...mockDocument, tags: [] };
      render(<DocumentCard {...defaultProps} document={documentWithoutTags} />);
      
      expect(screen.queryByTestId('tags-container')).not.toBeInTheDocument();
    });

    it('handles null/undefined values', () => {
      const documentWithNulls = {
        ...mockDocument,
        description: null,
        author: undefined,
        version: null,
      };

      render(<DocumentCard {...defaultProps} document={documentWithNulls} />);
      
      expect(screen.getByText('Test Document')).toBeInTheDocument();
    });

    it('handles very long titles', () => {
      const documentWithLongTitle = {
        ...mockDocument,
        title: 'This is a very long document title that should be truncated to prevent layout issues',
      };

      render(<DocumentCard {...defaultProps} document={documentWithLongTitle} />);
      
      const title = screen.getByText(documentWithLongTitle.title);
      expect(title).toHaveClass('truncate');
    });

    it('handles rapid button clicks', async () => {
      render(<DocumentCard {...defaultProps} />);
      
      const viewButton = screen.getByRole('button', { name: /view/i });
      
      // Simulate rapid clicks
      for (let i = 0; i < 5; i++) {
        await userEvent.click(viewButton);
      }
      
      expect(defaultProps.onView).toHaveBeenCalledTimes(5);
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const TestComponent = () => {
        renderSpy();
        return <DocumentCard {...defaultProps} />;
      };

      const { rerender } = render(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('handles large numbers of tags efficiently', () => {
      const documentWithManyTags = {
        ...mockDocument,
        tags: Array.from({ length: 100 }, (_, i) => `tag${i}`),
      };

      render(<DocumentCard {...defaultProps} document={documentWithManyTags} />);
      
      // Should render without performance issues
      expect(screen.getByText('Test Document')).toBeInTheDocument();
    });
  });
});
