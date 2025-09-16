'use client';

import React, { useMemo, useCallback } from 'react';
import {
  Grid,
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  FilterList,
  ViewList,
  ViewModule,
  Refresh,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setFilters, setPagination, fetchDocuments } from '../store/slices/documentsSlice';
import { Pagination } from './Pagination';
import { VirtualizedList } from './VirtualizedList';
import { InfiniteScrollList } from './InfiniteScrollList';
import DocumentCard from './DocumentCard';

interface PaginatedDocumentGridProps {
  viewMode?: 'grid' | 'list' | 'virtualized' | 'infinite';
  height?: number;
  onDocumentClick?: (document: any) => void;
  onDocumentEdit?: (document: any) => void;
  onDocumentDelete?: (document: any) => void;
  onDocumentDownload?: (document: any) => void;
}

export const PaginatedDocumentGrid: React.FC<PaginatedDocumentGridProps> = ({
  viewMode = 'grid',
  height = 400,
  onDocumentClick,
  onDocumentEdit,
  onDocumentDelete,
  onDocumentDownload,
}) => {
  const dispatch = useAppDispatch();
  const { 
    documents, 
    isLoading, 
    filters, 
    pagination,
    hasNextPage,
    isNextPageLoading 
  } = useAppSelector((state) => state.documents);

  const handlePageChange = useCallback((page: number) => {
    dispatch(setPagination({ page }));
    dispatch(fetchDocuments({ page, limit: pagination.limit, filters }));
  }, [dispatch, pagination.limit, filters]);

  const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
    dispatch(setPagination({ page: 1, limit: itemsPerPage }));
    dispatch(fetchDocuments({ page: 1, limit: itemsPerPage, filters }));
  }, [dispatch, filters]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ search: event.target.value }));
  }, [dispatch]);

  const handleFilterChange = useCallback((filterType: string, value: string) => {
    dispatch(setFilters({ [filterType]: value }));
    dispatch(fetchDocuments({ page: 1, limit: pagination.limit, filters: { ...filters, [filterType]: value } }));
  }, [dispatch, pagination.limit, filters]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchDocuments({ page: pagination.page, limit: pagination.limit, filters }));
  }, [dispatch, pagination.page, pagination.limit, filters]);

  const handleLoadNextPage = useCallback(() => {
    if (hasNextPage && !isNextPageLoading) {
      dispatch(fetchDocuments({ 
        page: pagination.page + 1, 
        limit: pagination.limit, 
        filters,
        append: true 
      }));
    }
  }, [dispatch, hasNextPage, isNextPageLoading, pagination.page, pagination.limit, filters]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (filters.search && !doc.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.framework && doc.framework !== filters.framework) {
        return false;
      }
      if (filters.documentType && doc.documentType !== filters.documentType) {
        return false;
      }
      if (filters.riskLevel && doc.riskLevel !== filters.riskLevel) {
        return false;
      }
      if (filters.status && doc.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [documents, filters]);

  const renderGridView = () => (
    <Grid container spacing={2}>
      {filteredDocuments.map((document) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={document.id}>
          <DocumentCard
            document={document}
            onView={onDocumentClick}
            onEdit={onDocumentEdit}
            onDelete={onDocumentDelete}
            onDownload={onDocumentDownload}
          />
        </Grid>
      ))}
    </Grid>
  );

  const renderListView = () => (
    <Box>
      {filteredDocuments.map((document) => (
        <Box key={document.id} mb={2}>
          <DocumentCard
            document={document}
            compact
            onView={onDocumentClick}
            onEdit={onDocumentEdit}
            onDelete={onDocumentDelete}
            onDownload={onDocumentDownload}
          />
        </Box>
      ))}
    </Box>
  );

  const renderVirtualizedView = () => (
    <VirtualizedList
      items={filteredDocuments}
      height={height}
      onItemClick={onDocumentClick}
      loading={isLoading}
    />
  );

  const renderInfiniteView = () => (
    <InfiniteScrollList
      items={filteredDocuments}
      hasNextPage={hasNextPage}
      isNextPageLoading={isNextPageLoading}
      loadNextPage={handleLoadNextPage}
      height={height}
      onItemClick={onDocumentClick}
    />
  );

  const renderContent = () => {
    switch (viewMode) {
      case 'list':
        return renderListView();
      case 'virtualized':
        return renderVirtualizedView();
      case 'infinite':
        return renderInfiniteView();
      default:
        return renderGridView();
    }
  };

  return (
    <Box>
      {/* Filters and Search */}
      <Box mb={3}>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <TextField
            placeholder="Search documents..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Framework</InputLabel>
            <Select
              value={filters.framework || ''}
              onChange={(e) => handleFilterChange('framework', e.target.value)}
              label="Framework"
            >
              <MenuItem value="">All Frameworks</MenuItem>
              <MenuItem value="SOX">SOX</MenuItem>
              <MenuItem value="GDPR">GDPR</MenuItem>
              <MenuItem value="ISO27001">ISO 27001</MenuItem>
              <MenuItem value="NIST">NIST</MenuItem>
              <MenuItem value="COSO">COSO</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Document Type</InputLabel>
            <Select
              value={filters.documentType || ''}
              onChange={(e) => handleFilterChange('documentType', e.target.value)}
              label="Document Type"
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="POLICY">Policy</MenuItem>
              <MenuItem value="PROCEDURE">Procedure</MenuItem>
              <MenuItem value="CONTROL">Control</MenuItem>
              <MenuItem value="RISK_ASSESSMENT">Risk Assessment</MenuItem>
              <MenuItem value="AUDIT_REPORT">Audit Report</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Risk Level</InputLabel>
            <Select
              value={filters.riskLevel || ''}
              onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
              label="Risk Level"
            >
              <MenuItem value="">All Levels</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Active Filters */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {filters.framework && (
            <Chip
              label={`Framework: ${filters.framework}`}
              onDelete={() => handleFilterChange('framework', '')}
              size="small"
            />
          )}
          {filters.documentType && (
            <Chip
              label={`Type: ${filters.documentType}`}
              onDelete={() => handleFilterChange('documentType', '')}
              size="small"
            />
          )}
          {filters.riskLevel && (
            <Chip
              label={`Risk: ${filters.riskLevel}`}
              onDelete={() => handleFilterChange('riskLevel', '')}
              size="small"
            />
          )}
        </Stack>
      </Box>

      {/* Content */}
      {renderContent()}

      {/* Pagination */}
      {viewMode !== 'infinite' && (
        <Pagination
          currentPage={pagination.page}
          totalPages={Math.ceil(pagination.total / pagination.limit)}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          disabled={isLoading}
        />
      )}
    </Box>
  );
};
