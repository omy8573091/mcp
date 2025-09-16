'use client';

import React, { memo, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  MoreVert,
  Download,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import type { Document } from '../store/slices/documentsSlice';

interface DocumentCardProps {
  document: Document;
  onView?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  showActions?: boolean;
  compact?: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = memo(({
  document,
  onView,
  onEdit,
  onDelete,
  onDownload,
  showActions = true,
  compact = false,
}) => {
  const statusColor = useMemo(() => {
    switch (document.status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  }, [document.status]);

  const riskColor = useMemo(() => {
    switch (document.riskLevel) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  }, [document.riskLevel]);

  const fileIcon = useMemo(() => {
    const extension = document.filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'xlsx': return '📊';
      case 'txt': return '📃';
      default: return '📄';
    }
  }, [document.filename]);

  const formatFileSize = useMemo(() => {
    const bytes = document.fileSize;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, [document.fileSize]);

  const uploadDate = useMemo(() => {
    return new Date(document.uploadDate).toLocaleDateString();
  }, [document.uploadDate]);

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: compact ? 1 : 2 }}>
        <Box display="flex" alignItems="flex-start" gap={2} mb={1}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            {fileIcon}
          </Avatar>
          <Box flexGrow={1} minWidth={0}>
            <Typography 
              variant={compact ? 'subtitle1' : 'h6'} 
              noWrap 
              sx={{ fontWeight: 600 }}
            >
              {document.title}
            </Typography>
            <Typography variant="body2" color="textSecondary" noWrap>
              {document.filename}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={1} mb={1} flexWrap="wrap">
          <Chip 
            label={document.status} 
            color={statusColor as any}
            size="small"
          />
          <Chip 
            label={document.riskLevel} 
            color={riskColor as any}
            size="small"
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="textSecondary" mb={1}>
          {document.framework} • {document.documentType}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="textSecondary">
            {uploadDate}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {formatFileSize}
          </Typography>
        </Box>

        {!compact && (
          <Box mt={1}>
            <Typography variant="body2" color="textSecondary">
              Compliance: {Math.round(document.complianceScore * 100)}%
            </Typography>
          </Box>
        )}
      </CardContent>

      {showActions && (
        <CardActions sx={{ pt: 0, px: 2, pb: 1 }}>
          <Box display="flex" gap={1} width="100%">
            {onView && (
              <Tooltip title="View">
                <IconButton size="small" onClick={() => onView(document)}>
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDownload && (
              <Tooltip title="Download">
                <IconButton size="small" onClick={() => onDownload(document)}>
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => onEdit(document)}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Box flexGrow={1} />
            {onDelete && (
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => onDelete(document)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="More options">
              <IconButton size="small">
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </CardActions>
      )}
    </Card>
  );
});

DocumentCard.displayName = 'DocumentCard';

export default DocumentCard;
