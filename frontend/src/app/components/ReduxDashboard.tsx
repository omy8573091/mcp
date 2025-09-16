'use client'

import { Grid, Card, CardContent, Typography, Box, Chip } from '@mui/material'
import { 
  Description as DocumentIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material'
import { useLanguage } from '../hooks/useLanguage'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { fetchDocuments, fetchRecentDocuments } from '../store/slices/documentsSlice'
import { useEffect } from 'react'
import { PaginatedDocumentGrid } from './PaginatedDocumentGrid'
import { PerformanceMonitor } from './PerformanceMonitor'

export function ReduxDashboard() {
  const { t } = useLanguage()
  const dispatch = useAppDispatch()
  const { documents, recentDocuments, isLoading } = useAppSelector((state) => state.documents)

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchDocuments({ page: 1, limit: 10 }))
    dispatch(fetchRecentDocuments())
  }, [dispatch])

  const statCards = [
    {
      title: t('dashboard.totalDocuments'),
      value: documents.length,
      icon: <DocumentIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: t('dashboard.complianceStatus'),
      value: '85%', // Mock data - in real app, calculate from documents
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: t('dashboard.riskLevel'),
      value: documents.filter(doc => doc.riskLevel === 'high' || doc.riskLevel === 'critical').length,
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
    {
      title: 'Active Frameworks',
      value: new Set(documents.map(doc => doc.framework)).size,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('dashboard.title')}
      </Typography>
      
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.recentActivity')}
              </Typography>
              <PaginatedDocumentGrid
                viewMode="list"
                height={300}
                onDocumentClick={(doc) => console.log('View document:', doc)}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.complianceStatus')}
              </Typography>
              <ReduxComplianceStatus />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <PerformanceMonitor componentName="ReduxDashboard" />
    </Box>
  )
}

function ReduxDocumentList() {
  const { t } = useLanguage()
  const { recentDocuments, isLoading } = useAppSelector((state) => state.documents)

  if (isLoading) return <Typography>{t('common.loading')}</Typography>

  return (
    <Box>
      {recentDocuments.map((doc) => (
        <Box key={doc.id} display="flex" alignItems="center" justifyContent="space-between" py={1}>
          <Box>
            <Typography variant="body1">{doc.title}</Typography>
            <Typography variant="body2" color="textSecondary">
              {doc.framework} • {doc.documentType}
            </Typography>
          </Box>
          <Chip 
            label={doc.status} 
            color={doc.status === 'completed' ? 'success' : 'default'}
            size="small"
          />
        </Box>
      ))}
    </Box>
  )
}

function ReduxComplianceStatus() {
  const { t } = useLanguage()
  const { documents, isLoading } = useAppSelector((state) => state.documents)

  if (isLoading) return <Typography>{t('common.loading')}</Typography>

  // Group documents by framework and calculate compliance scores
  const frameworkStats = documents.reduce((acc, doc) => {
    if (!acc[doc.framework]) {
      acc[doc.framework] = { total: 0, compliant: 0 };
    }
    acc[doc.framework].total++;
    if (doc.complianceScore > 0.8) {
      acc[doc.framework].compliant++;
    }
    return acc;
  }, {} as Record<string, { total: number; compliant: number }>);

  return (
    <Box>
      {Object.entries(frameworkStats).map(([framework, stats]) => {
        const score = stats.total > 0 ? stats.compliant / stats.total : 0;
        return (
          <Box key={framework} display="flex" alignItems="center" justifyContent="space-between" py={1}>
            <Typography variant="body2">{framework}</Typography>
            <Chip 
              label={`${Math.round(score * 100)}%`}
              color={score > 0.8 ? 'success' : score > 0.6 ? 'warning' : 'error'}
              size="small"
            />
          </Box>
        );
      })}
    </Box>
  )
}
