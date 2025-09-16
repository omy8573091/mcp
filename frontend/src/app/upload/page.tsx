'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  LinearProgress,
  Alert,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material'
import { CloudUpload as UploadIcon, CheckCircle as CheckIcon } from '@mui/icons-material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'
import { useLanguage } from '../hooks/useLanguage'

export default function UploadPage() {
  const { t } = useLanguage()
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'pending' | 'uploading' | 'success' | 'error'>>({})
  
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => apiClient.uploadDocuments(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['recent-documents'] })
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles])
    acceptedFiles.forEach(file => {
      setUploadStatus(prev => ({ ...prev, [file.name]: 'pending' }))
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: true,
  })

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return

    uploadedFiles.forEach(file => {
      setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }))
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
    })

    try {
      await uploadMutation.mutateAsync(uploadedFiles)
      uploadedFiles.forEach(file => {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }))
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
      })
    } catch (error) {
      uploadedFiles.forEach(file => {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }))
      })
    }
  }

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName))
    setUploadStatus(prev => {
      const newStatus = { ...prev }
      delete newStatus[fileName]
      return newStatus
    })
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('upload.title')}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <input {...getInputProps()} />
                <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {t('upload.dragDrop')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('upload.selectFiles')}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                  {t('upload.supportedFormats')}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {uploadedFiles.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Files to Upload ({uploadedFiles.length})
                </Typography>
                {uploadedFiles.map((file) => (
                  <Box key={file.name} sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">{file.name}</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={uploadStatus[file.name] || 'pending'}
                          color={
                            uploadStatus[file.name] === 'success' ? 'success' :
                            uploadStatus[file.name] === 'error' ? 'error' :
                            uploadStatus[file.name] === 'uploading' ? 'primary' : 'default'
                          }
                          size="small"
                        />
                        {uploadStatus[file.name] === 'success' && <CheckIcon color="success" />}
                        <Button
                          size="small"
                          onClick={() => removeFile(file.name)}
                          disabled={uploadStatus[file.name] === 'uploading'}
                        >
                          {t('common.delete')}
                        </Button>
                      </Box>
                    </Box>
                    {uploadStatus[file.name] === 'uploading' && (
                      <LinearProgress 
                        variant="determinate" 
                        value={uploadProgress[file.name] || 0} 
                      />
                    )}
                  </Box>
                ))}
                
                <Box display="flex" gap={2} mt={3}>
                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    startIcon={<UploadIcon />}
                  >
                    {t('upload.upload')}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setUploadedFiles([])}
                  >
                    {t('common.cancel')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Settings
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Default Framework</InputLabel>
                <Select defaultValue="SOX">
                  <MenuItem value="SOX">SOX</MenuItem>
                  <MenuItem value="GDPR">GDPR</MenuItem>
                  <MenuItem value="ISO27001">ISO 27001</MenuItem>
                  <MenuItem value="NIST">NIST</MenuItem>
                  <MenuItem value="COSO">COSO</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Default Document Type</InputLabel>
                <Select defaultValue="OTHER">
                  <MenuItem value="POLICY">Policy</MenuItem>
                  <MenuItem value="PROCEDURE">Procedure</MenuItem>
                  <MenuItem value="CONTROL">Control</MenuItem>
                  <MenuItem value="RISK_ASSESSMENT">Risk Assessment</MenuItem>
                  <MenuItem value="AUDIT_REPORT">Audit Report</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="User ID"
                defaultValue="system"
                sx={{ mb: 2 }}
              />

              <Alert severity="info" sx={{ mt: 2 }}>
                Documents will be automatically classified and processed for compliance analysis.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
