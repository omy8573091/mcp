'use client';

import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Box, Typography, Card, CardContent, Chip, Skeleton } from '@mui/material';
import { useAppSelector } from '../store/hooks';
import type { Document } from '../store/slices/documentsSlice';

interface VirtualizedListProps {
  items: Document[];
  height?: number;
  itemHeight?: number;
  onItemClick?: (item: Document) => void;
  loading?: boolean;
}

interface ListItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: Document[];
    onItemClick?: (item: Document) => void;
  };
}

const ListItem: React.FC<ListItemProps> = ({ index, style, data }) => {
  const { items, onItemClick } = data;
  const item = items[index];

  if (!item) {
    return (
      <div style={style}>
        <Card sx={{ m: 1 }}>
          <CardContent>
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="60%" height={16} />
            <Skeleton variant="rectangular" width="100px" height={24} sx={{ mt: 1 }} />
          </CardContent>
        </Card>
      </div>
    );
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

export const VirtualizedList: React.FC<VirtualizedListProps> = ({
  items,
  height = 400,
  itemHeight = 120,
  onItemClick,
  loading = false,
}) => {
  const itemData = useMemo(() => ({
    items: loading ? Array(10).fill(null) : items,
    onItemClick,
  }), [items, onItemClick, loading]);

  if (loading && items.length === 0) {
    return (
      <Box sx={{ height, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <List
          height={height}
          itemCount={10}
          itemSize={itemHeight}
          itemData={itemData}
        >
          {ListItem}
        </List>
      </Box>
    );
  }

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={itemData}
      >
        {ListItem}
      </List>
    </Box>
  );
};
