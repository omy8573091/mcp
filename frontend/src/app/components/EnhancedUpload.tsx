'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  Tooltip,
  Badge,
  LinearProgress,
  Tabs,
  Tab,
  Paper,
  Divider,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
  Slider,
  Rating,
  Autocomplete,
} from '@mui/material';
import {
  CloudUpload,
  CloudDownload,
  InsertDriveFile,
  Image,
  PictureAsPdf,
  Description,
  TableChart,
  Slideshow,
  Code,
  Archive,
  Folder,
  FolderOpen,
  Add,
  Remove,
  Delete,
  Edit,
  Save,
  Cancel,
  Check,
  Close,
  Warning,
  Error,
  Info,
  CheckCircle,
  Upload,
  Download,
  Share,
  Visibility,
  Star,
  StarBorder,
  Bookmark,
  BookmarkBorder,
  MoreVert,
  Refresh,
  Settings,
  Security,
  Lock,
  Public,
  Group,
  Person,
  Schedule,
  Category,
  Label,
  Tag,
  Language,
  Translate,
  AutoAwesome,
  Psychology,
  Lightbulb,
  QuestionAnswer,
  Article,
  Bookmark,
  BookmarkBorder,
  ContentCopy,
  OpenInNew,
  ThumbUp,
  ThumbDown,
  Report,
  Flag,
  Schedule,
  AccessTime,
  CalendarToday,
  PersonPin,
  LocationOn,
  Tag,
  Language,
  Translate,
  SearchOff,
  SearchIcon,
  Clear,
  KeyboardArrowDown,
  KeyboardArrowUp,
  CheckCircle,
  Warning,
  Error,
  Info,
  ExpandMore,
  History,
  TrendingUp,
  AutoAwesome,
  Psychology,
  Lightbulb,
  QuestionAnswer,
  Article,
  Bookmark,
  BookmarkBorder,
  ContentCopy,
  OpenInNew,
  ThumbUp,
  ThumbDown,
  Report,
  Flag,
  Schedule,
  AccessTime,
  CalendarToday,
  PersonPin,
  LocationOn,
  Tag,
  Language,
  Translate,
  SearchOff,
  SearchIcon,
  Clear,
  KeyboardArrowDown,
  KeyboardArrowUp,
  CheckCircle,
  Warning,
  Error,
  Info,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useLanguage } from '../hooks/useLanguage';
import { useRBAC } from '../../core/rbac/context';
import { ProtectedComponent, FeatureGate, PermissionGate } from '../../core/rbac/components';
import { ValidatedInput, ValidatedSelectInput, ValidatedTextarea, ValidatedForm } from '../../design-system/components/ValidatedInput';
import { validationSchemas } from '../../core/validation/schemas';
import { cn } from '../../core/utils';

// File upload interface
interface UploadFile {
  id: string;
  file: File;
  title: string;
  description: string;
  category: 'policy' | 'procedure' | 'guideline' | 'form' | 'template' | 'report' | 'contract' | 'agreement' | 'certificate' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  accessLevel: 'public' | 'private' | 'team';
  isPublic: boolean;
  allowComments: boolean;
  notifyUsers: boolean;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  preview?: string;
  metadata: {
    size: number;
    type: string;
    lastModified: Date;
    checksum?: string;
  };
  aiAnalysis?: {
    summary: string;
    keyPoints: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    topics: string[];
    entities: string[];
    confidence: number;
  };
}

// Upload step interface
interface UploadStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  completed: boolean;
  optional: boolean;
}

// File Preview Component
interface FilePreviewProps {
  file: UploadFile;
  onUpdate: (file: UploadFile) => void;
  onRemove: (file: UploadFile) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onUpdate, onRemove }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: file.title,
    description: file.description,
    category: file.category,
    priority: file.priority,
    tags: file.tags,
    accessLevel: file.accessLevel,
    isPublic: file.isPublic,
    allowComments: file.allowComments,
    notifyUsers: file.notifyUsers,
  });

  const getFileIcon = (type: string) => {
    const icons = {
      'application/pdf': <PictureAsPdf className="w-8 h-8 text-red-600" />,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': <Description className="w-8 h-8 text-blue-600" />,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': <TableChart className="w-8 h-8 text-green-600" />,
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': <Slideshow className="w-8 h-8 text-orange-600" />,
      'text/plain': <Code className="w-8 h-8 text-gray-600" />,
      'text/csv': <TableChart className="w-8 h-8 text-green-600" />,
      'image/jpeg': <Image className="w-8 h-8 text-purple-600" />,
      'image/png': <Image className="w-8 h-8 text-purple-600" />,
      'image/gif': <Image className="w-8 h-8 text-purple-600" />,
      'image/webp': <Image className="w-8 h-8 text-purple-600" />,
    };
    return icons[type] || <InsertDriveFile className="w-8 h-8 text-gray-600" />;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[priority] || colors.low;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-gray-600',
      uploading: 'text-blue-600',
      processing: 'text-yellow-600',
      completed: 'text-green-600',
      error: 'text-red-600',
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Schedule className="w-4 h-4" />,
      uploading: <CloudUpload className="w-4 h-4" />,
      processing: <Settings className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      error: <Error className="w-4 h-4" />,
    };
    return icons[status] || icons.pending;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSave = () => {
    onUpdate({ ...file, ...formData });
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      title: file.title,
      description: file.description,
      category: file.category,
      priority: file.priority,
      tags: file.tags,
      accessLevel: file.accessLevel,
      isPublic: file.isPublic,
      allowComments: file.allowComments,
      notifyUsers: file.notifyUsers,
    });
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg p-4 bg-white"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {getFileIcon(file.metadata.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-4">
              <ValidatedInput
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                validationConfig={{
                  schema: validationSchemas.documentTitle,
                  validateOnChange: true,
                }}
                fullWidth
              />
              
              <ValidatedTextarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                validationConfig={{
                  schema: validationSchemas.documentDescription,
                  validateOnChange: true,
                }}
                rows={3}
                fullWidth
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <ValidatedSelectInput
                    label="Category"
                    value={formData.category}
                    onChange={(value) => setFormData({ ...formData, category: value })}
                    options={[
                      { value: 'policy', label: 'Policy' },
                      { value: 'procedure', label: 'Procedure' },
                      { value: 'guideline', label: 'Guideline' },
                      { value: 'form', label: 'Form' },
                      { value: 'template', label: 'Template' },
                      { value: 'report', label: 'Report' },
                      { value: 'contract', label: 'Contract' },
                      { value: 'agreement', label: 'Agreement' },
                      { value: 'certificate', label: 'Certificate' },
                      { value: 'other', label: 'Other' },
                    ]}
                    validationConfig={{
                      schema: validationSchemas.documentCategory,
                      validateOnChange: true,
                    }}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <ValidatedSelectInput
                    label="Priority"
                    value={formData.priority}
                    onChange={(value) => setFormData({ ...formData, priority: value })}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                      { value: 'critical', label: 'Critical' },
                    ]}
                    validationConfig={{
                      schema: validationSchemas.documentPriority,
                      validateOnChange: true,
                    }}
                    fullWidth
                  />
                </Grid>
              </Grid>
              
              <div className="flex items-center space-x-4">
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    />
                  }
                  label="Public Document"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.allowComments}
                      onChange={(e) => setFormData({ ...formData, allowComments: e.target.checked })}
                    />
                  }
                  label="Allow Comments"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notifyUsers}
                      onChange={(e) => setFormData({ ...formData, notifyUsers: e.target.checked })}
                    />
                  }
                  label="Notify Users"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Typography variant="h6" className="font-semibold text-gray-900">
                  {file.title}
                </Typography>
                <div className="flex items-center space-x-2">
                  <Chip
                    label={file.priority}
                    size="small"
                    className={cn('capitalize', getPriorityColor(file.priority))}
                  />
                  <Chip
                    label={file.category}
                    size="small"
                    variant="outlined"
                    className="capitalize"
                  />
                </div>
              </div>
              
              <Typography variant="body2" className="text-gray-600 mb-2">
                {file.description}
              </Typography>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                <span>{formatFileSize(file.metadata.size)}</span>
                <span>•</span>
                <span>{file.metadata.type}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(file.status)}
                  <span className={cn('capitalize', getStatusColor(file.status))}>
                    {file.status}
                  </span>
                </div>
              </div>
              
              {file.tags && file.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {file.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                      className="text-xs"
                    />
                  ))}
                </div>
              )}
              
              {file.status === 'uploading' && (
                <div className="mt-2">
                  <LinearProgress
                    variant="determinate"
                    value={file.progress}
                    className="mb-1"
                  />
                  <Typography variant="caption" className="text-gray-600">
                    {file.progress}% uploaded
                  </Typography>
                </div>
              )}
              
              {file.error && (
                <Alert severity="error" className="mt-2">
                  <AlertTitle>Upload Error</AlertTitle>
                  {file.error}
                </Alert>
              )}
              
              {file.aiAnalysis && (
                <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AutoAwesome className="w-4 h-4 text-purple-600" />
                    <Typography variant="caption" className="font-semibold text-purple-700">
                      AI Analysis
                    </Typography>
                  </div>
                  <Typography variant="body2" className="text-purple-800">
                    {file.aiAnalysis.summary}
                  </Typography>
                  <div className="flex items-center space-x-2 mt-2">
                    <Typography variant="caption" className="text-purple-600">
                      Confidence: {Math.round(file.aiAnalysis.confidence * 100)}%
                    </Typography>
                    <Typography variant="caption" className="text-purple-600">
                      Topics: {file.aiAnalysis.topics.join(', ')}
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-2">
          <IconButton
            size="small"
            onClick={() => setEditing(!editing)}
            color={editing ? 'primary' : 'default'}
          >
            {editing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </IconButton>
          
          <IconButton
            size="small"
            onClick={() => onRemove(file)}
            color="error"
          >
            <Delete className="w-4 h-4" />
          </IconButton>
        </div>
      </div>
    </motion.div>
  );
};

// Upload Dropzone Component
interface UploadDropzoneProps {
  onFilesAdded: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
}

const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFilesAdded,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ],
}) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      console.error('Some files were rejected:', rejectedFiles);
    }
    
    if (acceptedFiles.length > 0) {
      onFilesAdded(acceptedFiles);
    }
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as any),
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
        isDragActive || dragActive
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      )}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      
      <div className="space-y-4">
        <div className="flex justify-center">
          <CloudUpload className={cn(
            'w-16 h-16 transition-colors duration-200',
            isDragActive || dragActive ? 'text-blue-500' : 'text-gray-400'
          )} />
        </div>
        
        <div>
          <Typography variant="h6" className="font-semibold text-gray-900 mb-2">
            {isDragActive || dragActive ? 'Drop files here' : 'Drag & drop files here'}
          </Typography>
          <Typography variant="body2" className="text-gray-600 mb-4">
            or click to browse files
          </Typography>
        </div>
        
        <div className="text-sm text-gray-500 space-y-1">
          <p>Supported formats: PDF, DOCX, XLSX, PPTX, TXT, CSV, Images</p>
          <p>Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB</p>
          <p>Maximum files: {maxFiles}</p>
        </div>
        
        <Button
          variant="contained"
          startIcon={<Add className="w-5 h-5" />}
          className="mt-4"
        >
          Select Files
        </Button>
      </div>
    </motion.div>
  );
};

// Main Enhanced Upload Component
const EnhancedUpload: React.FC = () => {
  const { t } = useLanguage();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [bulkSettings, setBulkSettings] = useState({
    category: 'other' as const,
    priority: 'medium' as const,
    accessLevel: 'private' as const,
    isPublic: false,
    allowComments: true,
    notifyUsers: false,
  });

  const steps = [
    {
      id: 'select',
      title: 'Select Files',
      description: 'Choose files to upload',
      completed: uploadFiles.length > 0,
    },
    {
      id: 'configure',
      title: 'Configure Settings',
      description: 'Set document properties and metadata',
      completed: uploadFiles.every(file => file.title && file.category),
    },
    {
      id: 'review',
      title: 'Review & Upload',
      description: 'Review files and start upload',
      completed: false,
    },
  ];

  const handleFilesAdded = (files: File[]) => {
    const newUploadFiles: UploadFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      description: '',
      category: bulkSettings.category,
      priority: bulkSettings.priority,
      tags: [],
      accessLevel: bulkSettings.accessLevel,
      isPublic: bulkSettings.isPublic,
      allowComments: bulkSettings.allowComments,
      notifyUsers: bulkSettings.notifyUsers,
      status: 'pending',
      progress: 0,
      metadata: {
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified),
      },
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  };

  const handleFileUpdate = (updatedFile: UploadFile) => {
    setUploadFiles(prev => prev.map(file => 
      file.id === updatedFile.id ? updatedFile : file
    ));
  };

  const handleFileRemove = (fileToRemove: UploadFile) => {
    setUploadFiles(prev => prev.filter(file => file.id !== fileToRemove.id));
  };

  const handleBulkUpdate = (updates: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map(file => ({ ...file, ...updates })));
  };

  const handleStartUpload = async () => {
    setUploading(true);
    
    for (const uploadFile of uploadFiles) {
      try {
        // Update status to uploading
        handleFileUpdate({ ...uploadFile, status: 'uploading', progress: 0 });
        
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          handleFileUpdate({ ...uploadFile, status: 'uploading', progress });
        }
        
        // Update status to processing
        handleFileUpdate({ ...uploadFile, status: 'processing', progress: 100 });
        
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate AI analysis
        const aiAnalysis = {
          summary: `This document appears to be a ${uploadFile.category} document with ${uploadFile.priority} priority.`,
          keyPoints: ['Document type identified', 'Priority level set', 'Metadata extracted'],
          sentiment: 'neutral' as const,
          topics: [uploadFile.category, uploadFile.priority],
          entities: ['Document', 'Upload'],
          confidence: 0.85,
        };
        
        // Update status to completed
        handleFileUpdate({ 
          ...uploadFile, 
          status: 'completed', 
          progress: 100,
          aiAnalysis 
        });
        
      } catch (error) {
        handleFileUpdate({ 
          ...uploadFile, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed'
        });
      }
    }
    
    setUploading(false);
  };

  const handleClearAll = () => {
    setUploadFiles([]);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography variant="h4" className="font-bold text-gray-900">
            Document Upload
          </Typography>
          <Typography variant="body1" className="text-gray-600 mt-1">
            Upload and manage your documents with AI-powered analysis
          </Typography>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outlined"
            startIcon={<Refresh className="w-5 h-5" />}
            onClick={handleClearAll}
            disabled={uploadFiles.length === 0}
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudUpload className="w-5 h-5" />}
            onClick={handleStartUpload}
            disabled={uploadFiles.length === 0 || uploading}
          >
            {uploading ? 'Uploading...' : 'Start Upload'}
          </Button>
        </div>
      </div>

      {/* Progress Stepper */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.id}>
                <StepLabel
                  completed={step.completed}
                  error={false}
                >
                  <div className="text-center">
                    <Typography variant="body2" className="font-semibold">
                      {step.title}
                    </Typography>
                    <Typography variant="caption" className="text-gray-600">
                      {step.description}
                    </Typography>
                  </div>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Step 1: File Selection */}
          {currentStep === 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="mb-4">
                <CardContent className="p-6">
                  <Typography variant="h6" className="font-semibold mb-4">
                    Select Files to Upload
                  </Typography>
                  
                  <UploadDropzone
                    onFilesAdded={handleFilesAdded}
                    maxFiles={20}
                    maxSize={100 * 1024 * 1024} // 100MB
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Configuration */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="mb-4">
                <CardContent className="p-6">
                  <Typography variant="h6" className="font-semibold mb-4">
                    Configure Document Settings
                  </Typography>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ValidatedSelectInput
                        label="Default Category"
                        value={bulkSettings.category}
                        onChange={(value) => setBulkSettings({ ...bulkSettings, category: value })}
                        options={[
                          { value: 'policy', label: 'Policy' },
                          { value: 'procedure', label: 'Procedure' },
                          { value: 'guideline', label: 'Guideline' },
                          { value: 'form', label: 'Form' },
                          { value: 'template', label: 'Template' },
                          { value: 'report', label: 'Report' },
                          { value: 'contract', label: 'Contract' },
                          { value: 'agreement', label: 'Agreement' },
                          { value: 'certificate', label: 'Certificate' },
                          { value: 'other', label: 'Other' },
                        ]}
                        validationConfig={{
                          schema: validationSchemas.documentCategory,
                          validateOnChange: true,
                        }}
                        fullWidth
                      />
                      
                      <ValidatedSelectInput
                        label="Default Priority"
                        value={bulkSettings.priority}
                        onChange={(value) => setBulkSettings({ ...bulkSettings, priority: value })}
                        options={[
                          { value: 'low', label: 'Low' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'high', label: 'High' },
                          { value: 'critical', label: 'Critical' },
                        ]}
                        validationConfig={{
                          schema: validationSchemas.documentPriority,
                          validateOnChange: true,
                        }}
                        fullWidth
                      />
                      
                      <ValidatedSelectInput
                        label="Default Access Level"
                        value={bulkSettings.accessLevel}
                        onChange={(value) => setBulkSettings({ ...bulkSettings, accessLevel: value })}
                        options={[
                          { value: 'public', label: 'Public' },
                          { value: 'private', label: 'Private' },
                          { value: 'team', label: 'Team' },
                        ]}
                        fullWidth
                      />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={bulkSettings.isPublic}
                            onChange={(e) => setBulkSettings({ ...bulkSettings, isPublic: e.target.checked })}
                          />
                        }
                        label="Make documents public by default"
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={bulkSettings.allowComments}
                            onChange={(e) => setBulkSettings({ ...bulkSettings, allowComments: e.target.checked })}
                          />
                        }
                        label="Allow comments by default"
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={bulkSettings.notifyUsers}
                            onChange={(e) => setBulkSettings({ ...bulkSettings, notifyUsers: e.target.checked })}
                          />
                        }
                        label="Notify users by default"
                      />
                    </div>
                    
                    <Button
                      variant="outlined"
                      onClick={() => handleBulkUpdate(bulkSettings)}
                      className="mt-4"
                    >
                      Apply to All Files
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="mb-4">
                <CardContent className="p-6">
                  <Typography variant="h6" className="font-semibold mb-4">
                    Review Files Before Upload
                  </Typography>
                  
                  <div className="space-y-4">
                    {uploadFiles.map((file, index) => (
                      <FilePreview
                        key={file.id}
                        file={file}
                        onUpdate={handleFileUpdate}
                        onRemove={handleFileRemove}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outlined"
              onClick={handlePrevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <Button
              variant="contained"
              onClick={handleNextStep}
              disabled={currentStep === steps.length - 1 || !steps[currentStep].completed}
            >
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <div className="space-y-4">
            {/* Upload Summary */}
            <Card>
              <CardContent className="p-4">
                <Typography variant="h6" className="font-semibold mb-4">
                  Upload Summary
                </Typography>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Typography variant="body2" className="text-gray-600">
                      Total Files
                    </Typography>
                    <Typography variant="body2" className="font-semibold">
                      {uploadFiles.length}
                    </Typography>
                  </div>
                  
                  <div className="flex justify-between">
                    <Typography variant="body2" className="text-gray-600">
                      Total Size
                    </Typography>
                    <Typography variant="body2" className="font-semibold">
                      {uploadFiles.reduce((total, file) => total + file.metadata.size, 0) > 1024 * 1024
                        ? `${Math.round(uploadFiles.reduce((total, file) => total + file.metadata.size, 0) / 1024 / 1024)} MB`
                        : `${Math.round(uploadFiles.reduce((total, file) => total + file.metadata.size, 0) / 1024)} KB`
                      }
                    </Typography>
                  </div>
                  
                  <div className="flex justify-between">
                    <Typography variant="body2" className="text-gray-600">
                      Completed
                    </Typography>
                    <Typography variant="body2" className="font-semibold text-green-600">
                      {uploadFiles.filter(file => file.status === 'completed').length}
                    </Typography>
                  </div>
                  
                  <div className="flex justify-between">
                    <Typography variant="body2" className="text-gray-600">
                      Errors
                    </Typography>
                    <Typography variant="body2" className="font-semibold text-red-600">
                      {uploadFiles.filter(file => file.status === 'error').length}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Tips */}
            <Card>
              <CardContent className="p-4">
                <Typography variant="h6" className="font-semibold mb-4">
                  Upload Tips
                </Typography>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <Typography variant="body2" className="text-gray-600">
                      Use descriptive titles for better searchability
                    </Typography>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <Typography variant="body2" className="text-gray-600">
                      Add relevant tags to categorize documents
                    </Typography>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <Typography variant="body2" className="text-gray-600">
                      Set appropriate priority levels for important documents
                    </Typography>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <Typography variant="body2" className="text-gray-600">
                      AI analysis will automatically extract key information
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default EnhancedUpload;
