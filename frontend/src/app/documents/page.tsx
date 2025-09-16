'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Fab,
} from '@mui/material'
import {
  ViewModule,
  ViewList,
  ViewStream,
  AllInclusive,
  Add,
} from '@mui/icons-material'
import { useAppDispatch } from '../store/hooks'
import { fetchDocuments } from '../store/slices/documentsSlice'
import { PaginatedDocumentGrid } from '../components/PaginatedDocumentGrid'
import { LazyWrapper } from '../components/LazyWrapper'

type ViewMode = 'grid' | 'list' | 'virtualized' | 'infinite'

export default function DocumentsPage() {
  const dispatch = useAppDispatch()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  useEffect(() => {
    // Fetch initial documents
    dispatch(fetchDocuments({ page: 1, limit: 20 }))
  }, [dispatch])

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode)
    }
  }

  const handleDocumentClick = (document: any) => {
    console.log('View document:', document)
    // Navigate to document detail page
  }

  const handleDocumentEdit = (document: any) => {
    console.log('Edit document:', document)
    // Open edit modal or navigate to edit page
  }

  const handleDocumentDelete = (document: any) => {
    console.log('Delete document:', document)
    // Show confirmation dialog
  }

  const handleDocumentDownload = (document: any) => {
    console.log('Download document:', document)
    // Trigger download
  }

  const handleAddDocument = () => {
    console.log('Add new document')
    // Navigate to upload page or open upload modal
  }

  return (
    <LazyWrapper>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Document Library
          </Typography>
          
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="grid" aria-label="grid view">
              <ViewModule />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ViewList />
            </ToggleButton>
            <ToggleButton value="virtualized" aria-label="virtualized view">
              <ViewStream />
            </ToggleButton>
            <ToggleButton value="infinite" aria-label="infinite scroll view">
              <AllInclusive />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Paper sx={{ p: 3 }}>
          <PaginatedDocumentGrid
            viewMode={viewMode}
            height={600}
            onDocumentClick={handleDocumentClick}
            onDocumentEdit={handleDocumentEdit}
            onDocumentDelete={handleDocumentDelete}
            onDocumentDownload={handleDocumentDownload}
          />
        </Paper>

        <Fab
          color="primary"
          aria-label="add document"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={handleAddDocument}
        >
          <Add />
        </Fab>
      </Box>
    </LazyWrapper>
  )
}
