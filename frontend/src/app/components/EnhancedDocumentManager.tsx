'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
} from '@mui/material';
import {
  Search,
  FilterList,
  Sort,
  ViewList,
  ViewModule,
  MoreVert,
  Download,
  Share,
  Edit,
  Delete,
  Visibility,
  Star,
  StarBorder,
  Folder,
  InsertDriveFile,
  Image,
  PictureAsPdf,
  Description,
  TableChart,
  Slideshow,
  Code,
  Archive,
  CloudUpload,
  CloudDownload,
  Lock,
  Public,
  Group,
  Person,
  Schedule,
  Category,
  Label,
  Refresh,
  Add,
  Upload,
  FolderOpen,
  FileCopy,
  MoveToInbox,
  RestoreFromTrash,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { useRBAC } from '../../core/rbac/context';
import { ProtectedComponent, FeatureGate, PermissionGate } from '../../core/rbac/components';
import { ValidatedInput, ValidatedSelectInput, ValidatedTextarea } from '../../design-system/components/ValidatedInput';
import { validationSchemas } from '../../core/validation/schemas';
import { cn } from '../../core/utils';

// Document interface
interface Document {
  id: string;
  title: string;
  description?: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt' | 'csv' | 'image' | 'other';
  category: 'policy' | 'procedure' | 'guideline' | 'form' | 'template' | 'report' | 'contract' | 'agreement' | 'certificate' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  size: number;
  uploadDate: Date;
  lastModified: Date;
  author: string;
  authorAvatar?: string;
  tags: string[];
  isStarred: boolean;
  isShared: boolean;
  accessLevel: 'public' | 'private' | 'team';
  downloadCount: number;
  viewCount: number;
  status: 'active' | 'archived' | 'deleted';
  version: string;
  checksum: string;
  metadata: {
    pages?: number;
    wordCount?: number;
    language?: string;
    createdBy?: string;
    modifiedBy?: string;
  };
}

// Document Card Component
interface DocumentCardProps {
  document: Document;
  viewMode: 'grid' | 'list';
  onSelect: (document: Document) => void;
  onStar: (document: Document) => void;
  onShare: (document: Document) => void;
  onDownload: (document: Document) => void;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
  selected: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  viewMode,
  onSelect,
  onStar,
  onShare,
  onDownload,
  onEdit,
  onDelete,
  selected,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { hasPermission } = useRBAC();

  const getFileIcon = (type: string) => {
    const icons = {
      pdf: <PictureAsPdf className="w-8 h-8 text-red-600" />,
      docx: <Description className="w-8 h-8 text-blue-600" />,
      xlsx: <TableChart className="w-8 h-8 text-green-600" />,
      pptx: <Slideshow className="w-8 h-8 text-orange-600" />,
      txt: <Code className="w-8 h-8 text-gray-600" />,
      csv: <TableChart className="w-8 h-8 text-green-600" />,
      image: <Image className="w-8 h-8 text-purple-600" />,
      other: <InsertDriveFile className="w-8 h-8 text-gray-600" />,
    };
    return icons[type] || icons.other;
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

  const getAccessIcon = (accessLevel: string) => {
    const icons = {
      public: <Public className="w-4 h-4 text-green-600" />,
      private: <Lock className="w-4 h-4 text-red-600" />,
      team: <Group className="w-4 h-4 text-blue-600" />,
    };
    return icons[accessLevel] || icons.private;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.01 }}
        className={cn(
          'flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200',
          selected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:border-gray-300'
        )}
        onClick={() => onSelect(document)}
      >
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex-shrink-0">
            {getFileIcon(document.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <Typography variant="body1" className="font-semibold text-gray-900 truncate">
                {document.title}
              </Typography>
              {document.isStarred && <Star className="w-4 h-4 text-yellow-500" />}
            </div>
            
            <div className="flex items-center space-x-4 mt-1">
              <Typography variant="body2" className="text-gray-600">
                {formatFileSize(document.size)}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                {formatDate(document.uploadDate)}
              </Typography>
              <div className="flex items-center space-x-1">
                {getAccessIcon(document.accessLevel)}
                <Typography variant="body2" className="text-gray-600 capitalize">
                  {document.accessLevel}
                </Typography>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Chip
              label={document.priority}
              size="small"
              className={cn('capitalize', getPriorityColor(document.priority))}
            />
            <Chip
              label={document.category}
              size="small"
              variant="outlined"
              className="capitalize"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onStar(document); }}>
            {document.isStarred ? <Star className="w-5 h-5 text-yellow-500" /> : <StarBorder className="w-5 h-5" />}
          </IconButton>
          
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVert className="w-5 h-5" />
          </IconButton>
        </div>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => { onDownload(document); handleMenuClose(); }}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </MenuItem>
          <MenuItem onClick={() => { onShare(document); handleMenuClose(); }}>
            <Share className="w-4 h-4 mr-2" />
            Share
          </MenuItem>
          <PermissionGate permission="documents:write">
            <MenuItem onClick={() => { onEdit(document); handleMenuClose(); }}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </MenuItem>
          </PermissionGate>
          <PermissionGate permission="documents:delete">
            <MenuItem onClick={() => { onDelete(document); handleMenuClose(); }}>
              <Delete className="w-4 h-4 mr-2" />
              Delete
            </MenuItem>
          </PermissionGate>
        </Menu>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        'relative group cursor-pointer',
        selected && 'ring-2 ring-blue-500'
      )}
      onClick={() => onSelect(document)}
    >
      <Card className="h-full transition-all duration-200 hover:shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                {getFileIcon(document.type)}
                <div className="flex-1 min-w-0">
                  <Typography variant="body1" className="font-semibold text-gray-900 truncate">
                    {document.title}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {formatFileSize(document.size)}
                  </Typography>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <Chip
                  label={document.priority}
                  size="small"
                  className={cn('capitalize', getPriorityColor(document.priority))}
                />
                <Chip
                  label={document.category}
                  size="small"
                  variant="outlined"
                  className="capitalize"
                />
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  {getAccessIcon(document.accessLevel)}
                  <span className="capitalize">{document.accessLevel}</span>
                </div>
                <span>•</span>
                <span>{formatDate(document.uploadDate)}</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1">
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onStar(document); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {document.isStarred ? <Star className="w-4 h-4 text-yellow-500" /> : <StarBorder className="w-4 h-4" />}
              </IconButton>
              
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); handleMenuOpen(e); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVert className="w-4 h-4" />
              </IconButton>
            </div>
          </div>
          
          {document.description && (
            <Typography variant="body2" className="text-gray-600 mb-3 line-clamp-2">
              {document.description}
            </Typography>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar
                src={document.authorAvatar}
                className="w-6 h-6"
              >
                {document.author.charAt(0)}
              </Avatar>
              <Typography variant="caption" className="text-gray-600">
                {document.author}
              </Typography>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Visibility className="w-3 h-3" />
                <span>{document.viewCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="w-3 h-3" />
                <span>{document.downloadCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onDownload(document); handleMenuClose(); }}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </MenuItem>
        <MenuItem onClick={() => { onShare(document); handleMenuClose(); }}>
          <Share className="w-4 h-4 mr-2" />
          Share
        </MenuItem>
        <PermissionGate permission="documents:write">
          <MenuItem onClick={() => { onEdit(document); handleMenuClose(); }}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </MenuItem>
        </PermissionGate>
        <PermissionGate permission="documents:delete">
          <MenuItem onClick={() => { onDelete(document); handleMenuClose(); }}>
            <Delete className="w-4 h-4 mr-2" />
            Delete
          </MenuItem>
        </PermissionGate>
      </Menu>
    </motion.div>
  );
};

// Document Filters Component
interface DocumentFiltersProps {
  filters: {
    search: string;
    type: string[];
    category: string[];
    priority: string[];
    accessLevel: string[];
    dateRange: string;
    author: string;
    tags: string[];
  };
  onFiltersChange: (filters: any) => void;
}

const DocumentFilters: React.FC<DocumentFiltersProps> = ({ filters, onFiltersChange }) => {
  const [expanded, setExpanded] = useState(false);

  const documentTypes = [
    { value: 'pdf', label: 'PDF Documents' },
    { value: 'docx', label: 'Word Documents' },
    { value: 'xlsx', label: 'Excel Spreadsheets' },
    { value: 'pptx', label: 'PowerPoint Presentations' },
    { value: 'txt', label: 'Text Files' },
    { value: 'csv', label: 'CSV Files' },
    { value: 'image', label: 'Images' },
    { value: 'other', label: 'Other Files' },
  ];

  const categories = [
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
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const accessLevels = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'team', label: 'Team' },
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h6" className="font-semibold">
            Filters
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={<FilterList className="w-4 h-4" />}
          >
            {expanded ? 'Hide' : 'Show'} Filters
          </Button>
        </div>

        <div className="space-y-4">
          <ValidatedInput
            placeholder="Search documents..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            validationConfig={{
              schema: validationSchemas.searchQuery,
              validateOnChange: false,
            }}
            leftIcon={<Search className="w-5 h-5" />}
            clearable
          />

          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Document Type</InputLabel>
                    <Select
                      multiple
                      value={filters.type}
                      onChange={(e) => onFiltersChange({ ...filters, type: e.target.value })}
                      renderValue={(selected) => (
                        <div className="flex flex-wrap gap-1">
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </div>
                      )}
                    >
                      {documentTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          <Checkbox checked={filters.type.includes(type.value)} />
                          <ListItemText primary={type.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      multiple
                      value={filters.category}
                      onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
                      renderValue={(selected) => (
                        <div className="flex flex-wrap gap-1">
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </div>
                      )}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.value} value={category.value}>
                          <Checkbox checked={filters.category.includes(category.value)} />
                          <ListItemText primary={category.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      multiple
                      value={filters.priority}
                      onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value })}
                      renderValue={(selected) => (
                        <div className="flex flex-wrap gap-1">
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </div>
                      )}
                    >
                      {priorities.map((priority) => (
                        <MenuItem key={priority.value} value={priority.value}>
                          <Checkbox checked={filters.priority.includes(priority.value)} />
                          <ListItemText primary={priority.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Access Level</InputLabel>
                    <Select
                      multiple
                      value={filters.accessLevel}
                      onChange={(e) => onFiltersChange({ ...filters, accessLevel: e.target.value })}
                      renderValue={(selected) => (
                        <div className="flex flex-wrap gap-1">
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </div>
                      )}
                    >
                      {accessLevels.map((level) => (
                        <MenuItem key={level.value} value={level.value}>
                          <Checkbox checked={filters.accessLevel.includes(level.value)} />
                          <ListItemText primary={level.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Date Range</InputLabel>
                    <Select
                      value={filters.dateRange}
                      onChange={(e) => onFiltersChange({ ...filters, dateRange: e.target.value })}
                    >
                      {dateRanges.map((range) => (
                        <MenuItem key={range.value} value={range.value}>
                          {range.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <ValidatedInput
                    placeholder="Author"
                    value={filters.author}
                    onChange={(e) => onFiltersChange({ ...filters, author: e.target.value })}
                    validationConfig={{
                      schema: validationSchemas.firstName,
                      validateOnChange: false,
                    }}
                    clearable
                  />
                </Grid>
              </Grid>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outlined"
                  onClick={() => onFiltersChange({
                    search: '',
                    type: [],
                    category: [],
                    priority: [],
                    accessLevel: [],
                    dateRange: 'all',
                    author: '',
                    tags: [],
                  })}
                >
                  Clear All
                </Button>
                <Button variant="contained">
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Enhanced Document Manager Component
const EnhancedDocumentManager: React.FC = () => {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    type: [],
    category: [],
    priority: [],
    accessLevel: [],
    dateRange: 'all',
    author: '',
    tags: [],
  });
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentTab, setCurrentTab] = useState(0);

  // Mock data
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: '1',
        title: 'Company Security Policy 2024',
        description: 'Comprehensive security guidelines for all employees',
        type: 'pdf',
        category: 'policy',
        priority: 'high',
        size: 2048576,
        uploadDate: new Date('2024-01-15'),
        lastModified: new Date('2024-01-20'),
        author: 'John Doe',
        authorAvatar: '',
        tags: ['security', 'policy', 'compliance'],
        isStarred: true,
        isShared: true,
        accessLevel: 'public',
        downloadCount: 45,
        viewCount: 120,
        status: 'active',
        version: '2.1',
        checksum: 'abc123',
        metadata: {
          pages: 25,
          wordCount: 5000,
          language: 'en',
          createdBy: 'John Doe',
          modifiedBy: 'Jane Smith',
        },
      },
      {
        id: '2',
        title: 'Employee Handbook',
        description: 'Complete guide for new employees',
        type: 'docx',
        category: 'guideline',
        priority: 'medium',
        size: 1536000,
        uploadDate: new Date('2024-01-10'),
        lastModified: new Date('2024-01-18'),
        author: 'Jane Smith',
        authorAvatar: '',
        tags: ['hr', 'handbook', 'employee'],
        isStarred: false,
        isShared: false,
        accessLevel: 'team',
        downloadCount: 23,
        viewCount: 67,
        status: 'active',
        version: '1.3',
        checksum: 'def456',
        metadata: {
          pages: 40,
          wordCount: 8000,
          language: 'en',
          createdBy: 'Jane Smith',
          modifiedBy: 'Mike Johnson',
        },
      },
      // Add more mock documents...
    ];

    setTimeout(() => {
      setDocuments(mockDocuments);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (filters.search && !doc.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.type.length > 0 && !filters.type.includes(doc.type)) {
        return false;
      }
      if (filters.category.length > 0 && !filters.category.includes(doc.category)) {
        return false;
      }
      if (filters.priority.length > 0 && !filters.priority.includes(doc.priority)) {
        return false;
      }
      if (filters.accessLevel.length > 0 && !filters.accessLevel.includes(doc.accessLevel)) {
        return false;
      }
      if (filters.author && !doc.author.toLowerCase().includes(filters.author.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [documents, filters]);

  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
      let aValue = a[sortBy as keyof Document];
      let bValue = b[sortBy as keyof Document];

      if (sortBy === 'uploadDate' || sortBy === 'lastModified') {
        aValue = new Date(aValue as Date).getTime();
        bValue = new Date(bValue as Date).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredDocuments, sortBy, sortOrder]);

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocuments(prev => {
      const isSelected = prev.some(doc => doc.id === document.id);
      if (isSelected) {
        return prev.filter(doc => doc.id !== document.id);
      } else {
        return [...prev, document];
      }
    });
  };

  const handleStar = (document: Document) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === document.id ? { ...doc, isStarred: !doc.isStarred } : doc
    ));
  };

  const handleShare = (document: Document) => {
    // Implement share functionality
    console.log('Sharing document:', document.title);
  };

  const handleDownload = (document: Document) => {
    // Implement download functionality
    console.log('Downloading document:', document.title);
  };

  const handleEdit = (document: Document) => {
    // Implement edit functionality
    console.log('Editing document:', document.title);
  };

  const handleDelete = (document: Document) => {
    // Implement delete functionality
    console.log('Deleting document:', document.title);
  };

  const tabs = [
    { label: 'All Documents', value: 'all', count: documents.length },
    { label: 'Recent', value: 'recent', count: documents.filter(doc => 
      new Date(doc.uploadDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length },
    { label: 'Starred', value: 'starred', count: documents.filter(doc => doc.isStarred).length },
    { label: 'Shared', value: 'shared', count: documents.filter(doc => doc.isShared).length },
    { label: 'Archived', value: 'archived', count: documents.filter(doc => doc.status === 'archived').length },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography variant="h4" className="font-bold text-gray-900">
            Document Manager
          </Typography>
          <Typography variant="body1" className="text-gray-600 mt-1">
            Manage and organize your documents
          </Typography>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outlined"
            startIcon={<Refresh className="w-5 h-5" />}
            onClick={() => setLoading(true)}
          >
            Refresh
          </Button>
          <PermissionGate permission="upload:files">
            <Button
              variant="contained"
              startIcon={<Upload className="w-5 h-5" />}
              href="/upload"
            >
              Upload Document
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Tabs */}
      <Paper className="mb-4">
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={tab.value}
              label={
                <div className="flex items-center space-x-2">
                  <span>{tab.label}</span>
                  <Badge badgeContent={tab.count} color="primary" />
                </div>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Filters */}
      <DocumentFilters filters={filters} onFiltersChange={setFilters} />

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Typography variant="body2" className="text-gray-600">
            {sortedDocuments.length} documents
          </Typography>
          
          {selectedDocuments.length > 0 && (
            <Typography variant="body2" className="text-blue-600">
              {selectedDocuments.length} selected
            </Typography>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <FormControl size="small" className="min-w-32">
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="uploadDate">Upload Date</MenuItem>
              <MenuItem value="lastModified">Last Modified</MenuItem>
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="size">Size</MenuItem>
              <MenuItem value="author">Author</MenuItem>
            </Select>
          </FormControl>
          
          <IconButton
            size="small"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <Sort className="w-5 h-5" />
          </IconButton>
          
          <Divider orientation="vertical" flexItem />
          
          <IconButton
            size="small"
            onClick={() => setViewMode('grid')}
            color={viewMode === 'grid' ? 'primary' : 'default'}
          >
            <ViewModule className="w-5 h-5" />
          </IconButton>
          
          <IconButton
            size="small"
            onClick={() => setViewMode('list')}
            color={viewMode === 'list' ? 'primary' : 'default'}
          >
            <ViewList className="w-5 h-5" />
          </IconButton>
        </div>
      </div>

      {/* Documents Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <CircularProgress size={48} />
            <Typography variant="body2" className="text-gray-600 mt-2">
              Loading documents...
            </Typography>
          </div>
        </div>
      ) : sortedDocuments.length === 0 ? (
        <Card className="p-8 text-center">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <Typography variant="h6" className="text-gray-600 mb-2">
            No documents found
          </Typography>
          <Typography variant="body2" className="text-gray-500 mb-4">
            Try adjusting your filters or upload a new document
          </Typography>
          <PermissionGate permission="upload:files">
            <Button variant="contained" startIcon={<Upload className="w-5 h-5" />}>
              Upload Document
            </Button>
          </PermissionGate>
        </Card>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-2'
        )}>
          <AnimatePresence>
            {sortedDocuments.map((document, index) => (
              <DocumentCard
                key={document.id}
                document={document}
                viewMode={viewMode}
                onSelect={handleDocumentSelect}
                onStar={handleStar}
                onShare={handleShare}
                onDownload={handleDownload}
                onEdit={handleEdit}
                onDelete={handleDelete}
                selected={selectedDocuments.some(doc => doc.id === document.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default EnhancedDocumentManager;
