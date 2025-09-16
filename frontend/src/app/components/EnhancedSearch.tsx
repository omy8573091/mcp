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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
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
import { useLanguage } from '../hooks/useLanguage';
import { useRBAC } from '../../core/rbac/context';
import { ProtectedComponent, FeatureGate, PermissionGate } from '../../core/rbac/components';
import { ValidatedInput, ValidatedSelectInput, ValidatedTextarea } from '../../design-system/components/ValidatedInput';
import { validationSchemas } from '../../core/validation/schemas';
import { cn } from '../../core/utils';

// Search result interface
interface SearchResult {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'document' | 'chunk' | 'metadata' | 'ai-generated';
  documentType: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt' | 'csv' | 'image' | 'other';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  relevanceScore: number;
  confidence: number;
  author: string;
  authorAvatar?: string;
  uploadDate: Date;
  lastModified: Date;
  tags: string[];
  isStarred: boolean;
  isBookmarked: boolean;
  viewCount: number;
  downloadCount: number;
  accessLevel: 'public' | 'private' | 'team';
  documentId: string;
  chunkIndex?: number;
  totalChunks?: number;
  highlights: {
    text: string;
    start: number;
    end: number;
  }[];
  metadata: {
    pages?: number;
    wordCount?: number;
    language?: string;
    createdBy?: string;
    modifiedBy?: string;
    fileSize?: number;
  };
  aiInsights?: {
    summary: string;
    keyPoints: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    topics: string[];
    entities: string[];
  };
}

// Search suggestion interface
interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'ai-suggested' | 'autocomplete';
  count?: number;
  category?: string;
}

// AI Search Assistant Component
const AISearchAssistant: React.FC<{
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
}> = ({ query, onQueryChange, onSearch }) => {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const aiSuggestions = [
    { id: '1', text: 'Find all compliance documents related to GDPR', type: 'ai-suggested' as const },
    { id: '2', text: 'Show me risk assessment reports from last quarter', type: 'ai-suggested' as const },
    { id: '3', text: 'What are the latest security policies?', type: 'ai-suggested' as const },
    { id: '4', text: 'Find documents about data protection procedures', type: 'ai-suggested' as const },
  ];

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onQueryChange(suggestion.text);
    onSearch(suggestion.text);
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <AutoAwesome className="w-6 h-6 text-purple-600" />
          <Typography variant="h6" className="font-semibold">
            AI Search Assistant
          </Typography>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Psychology className="w-5 h-5 text-blue-600" />
            <Typography variant="body2" className="text-gray-600">
              Ask me anything about your documents
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiSuggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outlined"
                  className="w-full h-auto p-3 text-left justify-start"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <Typography variant="body2" className="text-left">
                      {suggestion.text}
                    </Typography>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Info className="w-4 h-4" />
            <span>AI suggestions are personalized based on your document history</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Search Filters Component
interface SearchFiltersProps {
  filters: {
    documentType: string[];
    category: string[];
    priority: string[];
    accessLevel: string[];
    dateRange: string;
    author: string;
    tags: string[];
    aiGenerated: boolean;
    hasHighlights: boolean;
  };
  onFiltersChange: (filters: any) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFiltersChange }) => {
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
            Search Filters
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
                    value={filters.documentType}
                    onChange={(e) => onFiltersChange({ ...filters, documentType: e.target.value })}
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
                        <Checkbox checked={filters.documentType.includes(type.value)} />
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

              <Grid item xs={12}>
                <div className="flex items-center space-x-4">
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.aiGenerated}
                        onChange={(e) => onFiltersChange({ ...filters, aiGenerated: e.target.checked })}
                      />
                      <Typography variant="body2">AI Generated Content</Typography>
                    </div>
                  </FormControl>
                  
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.hasHighlights}
                        onChange={(e) => onFiltersChange({ ...filters, hasHighlights: e.target.checked })}
                      />
                      <Typography variant="body2">Has Highlights</Typography>
                    </div>
                  </FormControl>
                </div>
              </Grid>
            </Grid>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outlined"
                onClick={() => onFiltersChange({
                  documentType: [],
                  category: [],
                  priority: [],
                  accessLevel: [],
                  dateRange: 'all',
                  author: '',
                  tags: [],
                  aiGenerated: false,
                  hasHighlights: false,
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
      </CardContent>
    </Card>
  );
};

// Search Result Component
interface SearchResultProps {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
  onStar: (result: SearchResult) => void;
  onBookmark: (result: SearchResult) => void;
  onDownload: (result: SearchResult) => void;
  onShare: (result: SearchResult) => void;
  selected: boolean;
}

const SearchResult: React.FC<SearchResultProps> = ({
  result,
  onSelect,
  onStar,
  onBookmark,
  onDownload,
  onShare,
  selected,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const getFileIcon = (type: string) => {
    const icons = {
      pdf: <PictureAsPdf className="w-6 h-6 text-red-600" />,
      docx: <Description className="w-6 h-6 text-blue-600" />,
      xlsx: <TableChart className="w-6 h-6 text-green-600" />,
      pptx: <Slideshow className="w-6 h-6 text-orange-600" />,
      txt: <Code className="w-6 h-6 text-gray-600" />,
      csv: <TableChart className="w-6 h-6 text-green-600" />,
      image: <Image className="w-6 h-6 text-purple-600" />,
      other: <InsertDriveFile className="w-6 h-6 text-gray-600" />,
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

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
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

  const highlightText = (text: string, highlights: any[]) => {
    if (!highlights || highlights.length === 0) return text;
    
    let highlightedText = text;
    highlights.forEach((highlight, index) => {
      const regex = new RegExp(`(${highlight.text})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        `<mark class="bg-yellow-200 px-1 rounded">$1</mark>`
      );
    });
    
    return highlightedText;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        'border rounded-lg cursor-pointer transition-all duration-200',
        selected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:border-gray-300'
      )}
      onClick={() => onSelect(result)}
    >
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0">
                {getFileIcon(result.documentType)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <Typography variant="h6" className="font-semibold text-gray-900 truncate">
                    {result.title}
                  </Typography>
                  {result.isStarred && <Star className="w-4 h-4 text-yellow-500" />}
                  {result.isBookmarked && <Bookmark className="w-4 h-4 text-blue-500" />}
                </div>
                
                <div className="flex items-center space-x-4 mb-2">
                  <Chip
                    label={result.priority}
                    size="small"
                    className={cn('capitalize', getPriorityColor(result.priority))}
                  />
                  <Chip
                    label={result.category}
                    size="small"
                    variant="outlined"
                    className="capitalize"
                  />
                  <div className="flex items-center space-x-1">
                    {getAccessIcon(result.accessLevel)}
                    <Typography variant="caption" className="text-gray-600 capitalize">
                      {result.accessLevel}
                    </Typography>
                  </div>
                </div>
                
                <Typography
                  variant="body2"
                  className="text-gray-700 mb-2"
                  dangerouslySetInnerHTML={{
                    __html: highlightText(result.description, result.highlights)
                  }}
                />
                
                {result.aiInsights && (
                  <div className="bg-purple-50 p-3 rounded-lg mb-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <AutoAwesome className="w-4 h-4 text-purple-600" />
                      <Typography variant="caption" className="font-semibold text-purple-700">
                        AI Insights
                      </Typography>
                    </div>
                    <Typography variant="body2" className="text-purple-800">
                      {result.aiInsights.summary}
                    </Typography>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Avatar
                        src={result.authorAvatar}
                        className="w-5 h-5"
                      >
                        {result.author.charAt(0)}
                      </Avatar>
                      <span>{result.author}</span>
                    </div>
                    <span>{formatDate(result.uploadDate)}</span>
                    <div className="flex items-center space-x-1">
                      <Visibility className="w-3 h-3" />
                      <span>{result.viewCount}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Typography variant="caption" className={cn('font-semibold', getRelevanceColor(result.relevanceScore))}>
                        {Math.round(result.relevanceScore * 100)}% match
                      </Typography>
                    </div>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); onStar(result); }}
                    >
                      {result.isStarred ? <Star className="w-4 h-4 text-yellow-500" /> : <StarBorder className="w-4 h-4" />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); onBookmark(result); }}
                    >
                      {result.isBookmarked ? <Bookmark className="w-4 h-4 text-blue-500" /> : <BookmarkBorder className="w-4 h-4" />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleMenuOpen(e); }}
                    >
                      <MoreVert className="w-4 h-4" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {result.tags && result.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {result.tags.map((tag, index) => (
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                size="small"
                variant="outlined"
                startIcon={<Visibility className="w-4 h-4" />}
                onClick={(e) => { e.stopPropagation(); }}
              >
                View
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Download className="w-4 h-4" />}
                onClick={(e) => { e.stopPropagation(); onDownload(result); }}
              >
                Download
              </Button>
            </div>
            
            <div className="flex items-center space-x-1">
              <Typography variant="caption" className="text-gray-500">
                Confidence: {Math.round(result.confidence * 100)}%
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onDownload(result); handleMenuClose(); }}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </MenuItem>
        <MenuItem onClick={() => { onShare(result); handleMenuClose(); }}>
          <Share className="w-4 h-4 mr-2" />
          Share
        </MenuItem>
        <MenuItem onClick={() => { onBookmark(result); handleMenuClose(); }}>
          <Bookmark className="w-4 h-4 mr-2" />
          Bookmark
        </MenuItem>
        <MenuItem onClick={() => { onStar(result); handleMenuClose(); }}>
          <Star className="w-4 h-4 mr-2" />
          Star
        </MenuItem>
      </Menu>
    </motion.div>
  );
};

// Main Enhanced Search Component
const EnhancedSearch: React.FC = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResults, setSelectedResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState({
    documentType: [],
    category: [],
    priority: [],
    accessLevel: [],
    dateRange: 'all',
    author: '',
    tags: [],
    aiGenerated: false,
    hasHighlights: false,
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentTab, setCurrentTab] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  const tabs = [
    { label: 'All Results', value: 'all', count: searchResults.length },
    { label: 'Documents', value: 'documents', count: searchResults.filter(r => r.type === 'document').length },
    { label: 'AI Generated', value: 'ai', count: searchResults.filter(r => r.type === 'ai-generated').length },
    { label: 'Highlights', value: 'highlights', count: searchResults.filter(r => r.highlights.length > 0).length },
  ];

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setSearchQuery(query);
    
    // Add to search history
    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 10);
      return newHistory;
    });
    
    // Simulate API call
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Company Security Policy 2024',
          description: 'Comprehensive security guidelines for all employees including data protection measures and compliance requirements.',
          content: 'This document outlines the security policies...',
          type: 'document',
          documentType: 'pdf',
          category: 'policy',
          priority: 'high',
          relevanceScore: 0.95,
          confidence: 0.92,
          author: 'John Doe',
          authorAvatar: '',
          uploadDate: new Date('2024-01-15'),
          lastModified: new Date('2024-01-20'),
          tags: ['security', 'policy', 'compliance'],
          isStarred: false,
          isBookmarked: false,
          viewCount: 120,
          downloadCount: 45,
          accessLevel: 'public',
          documentId: 'doc-1',
          highlights: [
            { text: 'security policy', start: 0, end: 15 },
            { text: 'data protection', start: 50, end: 65 },
          ],
          metadata: {
            pages: 25,
            wordCount: 5000,
            language: 'en',
            createdBy: 'John Doe',
            modifiedBy: 'Jane Smith',
          },
          aiInsights: {
            summary: 'This document contains comprehensive security guidelines covering data protection, access controls, and compliance requirements.',
            keyPoints: ['Data protection measures', 'Access control policies', 'Compliance requirements'],
            sentiment: 'neutral',
            topics: ['security', 'compliance', 'data protection'],
            entities: ['John Doe', 'Company', 'GDPR'],
          },
        },
        // Add more mock results...
      ];
      
      setSearchResults(mockResults);
      setLoading(false);
    }, 1000);
  };

  const handleResultSelect = (result: SearchResult) => {
    setSelectedResults(prev => {
      const isSelected = prev.some(r => r.id === result.id);
      if (isSelected) {
        return prev.filter(r => r.id !== result.id);
      } else {
        return [...prev, result];
      }
    });
  };

  const handleStar = (result: SearchResult) => {
    setSearchResults(prev => prev.map(r => 
      r.id === result.id ? { ...r, isStarred: !r.isStarred } : r
    ));
  };

  const handleBookmark = (result: SearchResult) => {
    setSearchResults(prev => prev.map(r => 
      r.id === result.id ? { ...r, isBookmarked: !r.isBookmarked } : r
    ));
  };

  const handleDownload = (result: SearchResult) => {
    console.log('Downloading result:', result.title);
  };

  const handleShare = (result: SearchResult) => {
    console.log('Sharing result:', result.title);
  };

  const filteredResults = useMemo(() => {
    return searchResults.filter(result => {
      if (filters.documentType.length > 0 && !filters.documentType.includes(result.documentType)) {
        return false;
      }
      if (filters.category.length > 0 && !filters.category.includes(result.category)) {
        return false;
      }
      if (filters.priority.length > 0 && !filters.priority.includes(result.priority)) {
        return false;
      }
      if (filters.accessLevel.length > 0 && !filters.accessLevel.includes(result.accessLevel)) {
        return false;
      }
      if (filters.author && !result.author.toLowerCase().includes(filters.author.toLowerCase())) {
        return false;
      }
      if (filters.aiGenerated && result.type !== 'ai-generated') {
        return false;
      }
      if (filters.hasHighlights && result.highlights.length === 0) {
        return false;
      }
      return true;
    });
  }, [searchResults, filters]);

  const sortedResults = useMemo(() => {
    return [...filteredResults].sort((a, b) => {
      let aValue = a[sortBy as keyof SearchResult];
      let bValue = b[sortBy as keyof SearchResult];

      if (sortBy === 'relevance') {
        aValue = a.relevanceScore;
        bValue = b.relevanceScore;
      } else if (sortBy === 'uploadDate' || sortBy === 'lastModified') {
        aValue = new Date(aValue as Date).getTime();
        bValue = new Date(bValue as Date).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredResults, sortBy, sortOrder]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography variant="h4" className="font-bold text-gray-900">
            AI-Powered Search
          </Typography>
          <Typography variant="body1" className="text-gray-600 mt-1">
            Find documents using natural language and AI insights
          </Typography>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outlined"
            startIcon={<History className="w-5 h-5" />}
          >
            Search History
          </Button>
          <Button
            variant="contained"
            startIcon={<AutoAwesome className="w-5 h-5" />}
          >
            AI Assistant
          </Button>
        </div>
      </div>

      {/* AI Search Assistant */}
      <FeatureGate feature="ai_search">
        <AISearchAssistant
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onSearch={handleSearch}
        />
      </FeatureGate>

      {/* Search Bar */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <ValidatedInput
                placeholder="Search documents, ask questions, or describe what you're looking for..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchQuery);
                  }
                }}
                validationConfig={{
                  schema: validationSchemas.searchQuery,
                  validateOnChange: false,
                }}
                leftIcon={<Search className="w-5 h-5" />}
                clearable
                size="large"
              />
            </div>
            
            <Button
              variant="contained"
              size="large"
              onClick={() => handleSearch(searchQuery)}
              disabled={loading || !searchQuery.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <Search className="w-5 h-5" />}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          {searchHistory.length > 0 && (
            <div className="mt-4">
              <Typography variant="body2" className="text-gray-600 mb-2">
                Recent searches:
              </Typography>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map((query, index) => (
                  <Chip
                    key={index}
                    label={query}
                    size="small"
                    variant="outlined"
                    onClick={() => handleSearch(query)}
                    className="cursor-pointer"
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <SearchFilters filters={filters} onFiltersChange={setFilters} />

      {/* Results */}
      {searchQuery && (
        <>
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

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Typography variant="body2" className="text-gray-600">
                {sortedResults.length} results for "{searchQuery}"
              </Typography>
              
              {selectedResults.length > 0 && (
                <Typography variant="body2" className="text-blue-600">
                  {selectedResults.length} selected
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
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="uploadDate">Upload Date</MenuItem>
                  <MenuItem value="lastModified">Last Modified</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="author">Author</MenuItem>
                </Select>
              </FormControl>
              
              <IconButton
                size="small"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <Sort className="w-5 h-5" />
              </IconButton>
            </div>
          </div>

          {/* Search Results */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <CircularProgress size={48} />
                <Typography variant="body2" className="text-gray-600 mt-2">
                  Searching documents...
                </Typography>
              </div>
            </div>
          ) : sortedResults.length === 0 ? (
            <Card className="p-8 text-center">
              <SearchOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <Typography variant="h6" className="text-gray-600 mb-2">
                No results found
              </Typography>
              <Typography variant="body2" className="text-gray-500 mb-4">
                Try adjusting your search terms or filters
              </Typography>
              <Button variant="outlined" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {sortedResults.map((result, index) => (
                  <SearchResult
                    key={result.id}
                    result={result}
                    onSelect={handleResultSelect}
                    onStar={handleStar}
                    onBookmark={handleBookmark}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    selected={selectedResults.some(r => r.id === result.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!searchQuery && (
        <Card className="p-8 text-center">
          <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <Typography variant="h6" className="text-gray-600 mb-2">
            Start searching your documents
          </Typography>
          <Typography variant="body2" className="text-gray-500 mb-4">
            Use natural language to find exactly what you're looking for
          </Typography>
          <div className="flex justify-center space-x-2">
            <Button
              variant="outlined"
              onClick={() => setSearchQuery('compliance policies')}
            >
              Try "compliance policies"
            </Button>
            <Button
              variant="outlined"
              onClick={() => setSearchQuery('risk assessment reports')}
            >
              Try "risk assessment reports"
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EnhancedSearch;
