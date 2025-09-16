'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Collapse,
  Stack,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Memory,
  Speed,
  Timeline,
} from '@mui/icons-material';
import { usePerformanceMonitor, useMemoryUsage } from '../hooks/usePerformance';

interface PerformanceMonitorProps {
  componentName: string;
  showDetails?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  componentName,
  showDetails = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    renderCount: 0,
    memoryUsage: 0,
  });

  const { renderCount } = usePerformanceMonitor(componentName);
  const memoryInfo = useMemoryUsage();

  useEffect(() => {
    // Simulate performance metrics collection
    const startTime = performance.now();
    
    const updateMetrics = () => {
      const endTime = performance.now();
      setMetrics(prev => ({
        ...prev,
        renderTime: endTime - startTime,
        renderCount,
        memoryUsage: memoryInfo?.usedJSHeapSize || 0,
      }));
    };

    updateMetrics();
  }, [renderCount, memoryInfo]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPerformanceColor = (renderTime: number) => {
    if (renderTime < 16) return 'success'; // 60fps
    if (renderTime < 33) return 'warning'; // 30fps
    return 'error'; // < 30fps
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card sx={{ position: 'fixed', bottom: 16, left: 16, zIndex: 9999, minWidth: 300 }}>
      <CardContent sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" color="textSecondary">
            Performance Monitor
          </Typography>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Stack direction="row" spacing={1} mt={1}>
          <Chip
            icon={<Speed />}
            label={`${metrics.renderTime.toFixed(1)}ms`}
            color={getPerformanceColor(metrics.renderTime) as any}
            size="small"
          />
          <Chip
            icon={<Timeline />}
            label={`${metrics.renderCount}`}
            color="default"
            size="small"
          />
          {memoryInfo && (
            <Chip
              icon={<Memory />}
              label={formatBytes(memoryInfo.usedJSHeapSize)}
              color="info"
              size="small"
            />
          )}
        </Stack>

        <Collapse in={expanded}>
          <Box mt={2}>
            <Typography variant="caption" color="textSecondary" display="block">
              Component: {componentName}
            </Typography>
            
            {memoryInfo && (
              <Box mt={1}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Memory Usage
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100}
                  sx={{ mt: 0.5 }}
                />
                <Typography variant="caption" color="textSecondary" display="block">
                  {formatBytes(memoryInfo.usedJSHeapSize)} / {formatBytes(memoryInfo.jsHeapSizeLimit)}
                </Typography>
              </Box>
            )}

            <Box mt={1}>
              <Typography variant="caption" color="textSecondary" display="block">
                Render Performance
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min((metrics.renderTime / 33) * 100, 100)}
                color={getPerformanceColor(metrics.renderTime) as any}
                sx={{ mt: 0.5 }}
              />
              <Typography variant="caption" color="textSecondary" display="block">
                Target: < 16ms (60fps)
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};
