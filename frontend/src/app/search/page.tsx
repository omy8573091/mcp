'use client'

import { useState } from 'react'
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert
} from '@mui/material'
import { Search as SearchIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'
import { useLanguage } from '../hooks/useLanguage'
// import ReactMarkdown from 'react-markdown'

export default function SearchPage() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any>(null)

  const searchMutation = useMutation({
    mutationFn: (question: string) => apiClient.searchDocuments(question),
    onSuccess: (data) => {
      setSearchResults(data)
    },
  })

  const handleSearch = () => {
    if (query.trim()) {
      searchMutation.mutate(query)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('search.title')}
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              fullWidth
              label={t('search.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., What are our data protection policies? How do we handle security incidents?"
              multiline
              rows={2}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={searchMutation.isPending || !query.trim()}
              startIcon={searchMutation.isPending ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ minWidth: 120 }}
            >
              {searchMutation.isPending ? t('search.loading') : t('search.search')}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {searchMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('common.error')}: {(searchMutation.error as any)?.message || 'Unknown error'}
        </Alert>
      )}

      {searchResults && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('search.answer')}
                </Typography>
                <Box sx={{ 
                  backgroundColor: 'grey.50', 
                  p: 2, 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}>
                  <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {searchResults.answer}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {searchResults.citations && searchResults.citations.length > 0 && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('search.sources')}
                  </Typography>
                  {searchResults.citations.map((citation: any, index: number) => (
                    <Accordion key={index}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="body2">
                            Document {citation.document_id} - Chunk {citation.chunk_id}
                          </Typography>
                          <Chip 
                            label={`${Math.round(citation.score * 100)}% match`}
                            size="small"
                            color="primary"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="textSecondary">
                          Relevance Score: {citation.score.toFixed(3)}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Search Analysis
                </Typography>
                
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Question Type
                  </Typography>
                  <Chip 
                    label={searchResults.question_type || 'Unknown'}
                    color="primary"
                    size="small"
                  />
                </Box>

                {searchResults.compliance_frameworks && searchResults.compliance_frameworks.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Compliance Frameworks
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {searchResults.compliance_frameworks.map((framework: string) => (
                        <Chip 
                          key={framework}
                          label={framework}
                          size="small"
                          color="secondary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Risk Level
                  </Typography>
                  <Chip 
                    label={searchResults.risk_level || 'Unknown'}
                    color={
                      searchResults.risk_level === 'HIGH' ? 'error' :
                      searchResults.risk_level === 'MEDIUM' ? 'warning' :
                      searchResults.risk_level === 'LOW' ? 'success' : 'default'
                    }
                    size="small"
                  />
                </Box>

                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Citations Found
                  </Typography>
                  <Typography variant="h6">
                    {searchResults.citations?.length || 0}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Suggested Follow-ups
                </Typography>
                <Box>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ mb: 1, mr: 1 }}
                    onClick={() => setQuery("What are the key controls mentioned in this document?")}
                  >
                    Key Controls
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ mb: 1, mr: 1 }}
                    onClick={() => setQuery("What are the compliance requirements?")}
                  >
                    Compliance Requirements
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ mb: 1, mr: 1 }}
                    onClick={() => setQuery("What are the risk factors identified?")}
                  >
                    Risk Factors
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}
