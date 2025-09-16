'use client';

import React, { useCallback, useMemo } from 'react';
import { List } from 'react-window';
import { InfiniteLoader } from 'react-window-infinite-loader';
import { Box, Typography, Card, CardContent, Chip, CircularProgress } from '@mui/material';
import type { Document } from '../store/slices/documentsSlice';

interface InfiniteScrollListProps {
  items: Document[];
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  loadNextPage: () => void;
  height?: number;
  itemHeight?: number;
  onItemClick?: (item: Document) => void;
}

interface ListItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: Document[];
    onItemClick?: (item: Document) => void;
    isItemLoaded: (index: number) => boolean;
  };
}

const ListItem: React.FC<ListItemProps> = ({ index, style, data }) => {
  const { items, onItemClick, isItemLoaded } = data;
  const item = items[index];

  if (!isItemLoaded(index)) {
    return (
      <div style={style}>
        <Card sx={{ m: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 100 }}>
          <CircularProgress size={24} />
        </Card>
      </div>
    );
  }

  if (!item) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <div style={style}>
      <Card 
        sx={{ 
          m: 1, 
          cursor: onItemClick ? 'pointer' : 'default',
          '&:hover': onItemClick ? { boxShadow: 3 } : {}
        }}
        onClick={() => onItemClick?.(item)}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="h6" noWrap sx={{ flex: 1, mr: 2 }}>
              {item.title}
            </Typography>
            <Box display="flex" gap={1}>
              <Chip 
                label={item.status} 
                color={getStatusColor(item.status) as any}
                size="small"
              />
              <Chip 
                label={item.riskLevel} 
                color={getRiskColor(item.riskLevel) as any}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
          
          <Typography variant="body2" color="textSecondary" noWrap>
            {item.filename} • {item.framework} • {item.documentType}
          </Typography>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
            <Typography variant="caption" color="textSecondary">
              {new Date(item.uploadDate).toLocaleDateString()}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {Math.round(item.complianceScore * 100)}% compliant
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export const InfiniteScrollList: React.FC<InfiniteScrollListProps> = ({
  items,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
  height = 400,
  itemHeight = 120,
  onItemClick,
}) => {
  const itemCount = hasNextPage ? items.length + 1 : items.length;

  const isItemLoaded = useCallback((index: number) => {
    return !!items[index];
  }, [items]);

  const itemData = useMemo(() => ({
    items,
    onItemClick,
    isItemLoaded,
  }), [items, onItemClick, isItemLoaded]);

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadNextPage}
      >
        {({ onItemsRendered, ref }) => (
          <List
            ref={ref}
            height={height}
            itemCount={itemCount}
            itemSize={itemHeight}
            itemData={itemData}
            onItemsRendered={onItemsRendered}
          >
            {ListItem}
          </List>
        )}
      </InfiniteLoader>
    </Box>
  );
};
