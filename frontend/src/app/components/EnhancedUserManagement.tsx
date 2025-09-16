'use client';

import React, { useState, useEffect } from 'react';
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
  People,
  PersonAdd,
  Edit,
  Delete,
  MoreVert,
  Search,
  FilterList,
  Sort,
  ViewList,
  ViewModule,
  Download,
  Share,
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
  Schedule as ScheduleIcon,
  AccessTime,
  CalendarToday,
  PersonPin,
  LocationOn,
  Tag as TagIcon,
  Language as LanguageIcon,
  Translate as TranslateIcon,
  SearchOff,
  Search as SearchIcon,
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
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  Lightbulb as LightbulbIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Article as ArticleIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  ContentCopy as ContentCopyIcon,
  OpenInNew as OpenInNewIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Report as ReportIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon2,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  PersonPin as PersonPinIcon,
  LocationOn as LocationOnIcon,
  Tag as TagIcon2,
  Language as LanguageIcon2,
  Translate as TranslateIcon2,
  SearchOff as SearchOffIcon,
  Search as SearchIcon2,
  Clear as ClearIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh,
  Add,
  Upload,
  FolderOpen,
  FileCopy,
  MoveToInbox,
  RestoreFromTrash,
  MoreVert as MoreVertIcon,
  Settings,
  Security,
  Lock as LockIcon,
  Public as PublicIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon3,
  Category as CategoryIcon,
  Label as LabelIcon,
  Tag as TagIcon3,
  Language as LanguageIcon3,
  Translate as TranslateIcon3,
  AutoAwesome as AutoAwesomeIcon2,
  Psychology as PsychologyIcon2,
  Lightbulb as LightbulbIcon2,
  QuestionAnswer as QuestionAnswerIcon2,
  Article as ArticleIcon2,
  Bookmark as BookmarkIcon2,
  BookmarkBorder as BookmarkBorderIcon2,
  ContentCopy as ContentCopyIcon2,
  OpenInNew as OpenInNewIcon2,
  ThumbUp as ThumbUpIcon2,
  ThumbDown as ThumbDownIcon2,
  Report as ReportIcon2,
  Flag as FlagIcon2,
  Schedule as ScheduleIcon4,
  AccessTime as AccessTimeIcon2,
  CalendarToday as CalendarTodayIcon2,
  PersonPin as PersonPinIcon2,
  LocationOn as LocationOnIcon2,
  Tag as TagIcon4,
  Language as LanguageIcon4,
  Translate as TranslateIcon4,
  SearchOff as SearchOffIcon2,
  Search as SearchIcon3,
  Clear as ClearIcon2,
  KeyboardArrowDown as KeyboardArrowDownIcon2,
  KeyboardArrowUp as KeyboardArrowUpIcon2,
  CheckCircle as CheckCircleIcon2,
  Warning as WarningIcon2,
  Error as ErrorIcon2,
  Info as InfoIcon2,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { useRBAC } from '../../core/rbac/context';
import { ProtectedComponent, FeatureGate, PermissionGate } from '../../core/rbac/components';
import { ValidatedInput, ValidatedSelectInput, ValidatedTextarea, ValidatedForm } from '../../design-system/components/ValidatedInput';
import { validationSchemas } from '../../core/validation/schemas';
import { cn } from '../../core/utils';

// User interfaces
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer' | 'guest';
  subscription: 'free' | 'basic' | 'standard' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  avatar?: string;
  lastLogin: Date;
  createdAt: Date;
  documents: number;
  permissions: string[];
  features: string[];
  preferences: {
    language: string;
    timezone: string;
    notifications: boolean;
    theme: 'light' | 'dark';
  };
}

interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isDefault: boolean;
}

// User Card Component
interface UserCardProps {
  user: User;
  viewMode: 'grid' | 'list';
  onSelect: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onSuspend: (user: User) => void;
  selected: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  viewMode,
  onSelect,
  onEdit,
  onDelete,
  onSuspend,
  selected,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      analyst: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800',
      guest: 'bg-yellow-100 text-yellow-800',
    };
    return colors[role] || colors.viewer;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.inactive;
  };

  const getSubscriptionColor = (subscription: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      standard: 'bg-green-100 text-green-800',
      pro: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800',
    };
    return colors[subscription] || colors.free;
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
        onClick={() => onSelect(user)}
      >
        <div className="flex items-center space-x-4 flex-1">
          <Avatar
            src={user.avatar}
            className="w-12 h-12"
          >
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Typography variant="body1" className="font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </Typography>
              <Chip
                label={user.role}
                size="small"
                className={cn('capitalize', getRoleColor(user.role))}
              />
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{user.email}</span>
              <span>•</span>
              <span>{user.documents} documents</span>
              <span>•</span>
              <span>Last login: {formatDate(user.lastLogin)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Chip
              label={user.status}
              size="small"
              className={cn('capitalize', getStatusColor(user.status))}
            />
            <Chip
              label={user.subscription}
              size="small"
              className={cn('capitalize', getSubscriptionColor(user.subscription))}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVert className="w-5 h-5" />
          </IconButton>
        </div>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => { onEdit(user); handleMenuClose(); }}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </MenuItem>
          <MenuItem onClick={() => { onSuspend(user); handleMenuClose(); }}>
            <Lock className="w-4 h-4 mr-2" />
            Suspend
          </MenuItem>
          <MenuItem onClick={() => { onDelete(user); handleMenuClose(); }}>
            <Delete className="w-4 h-4 mr-2" />
            Delete
          </MenuItem>
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
      onClick={() => onSelect(user)}
    >
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3 flex-1">
              <Avatar
                src={user.avatar}
                className="w-12 h-12"
              >
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <Typography variant="h6" className="font-semibold text-gray-900 mb-1">
                  {user.firstName} {user.lastName}
                </Typography>
                
                <Typography variant="body2" className="text-gray-600 mb-2">
                  {user.email}
                </Typography>
                
                <div className="flex items-center space-x-2 mb-2">
                  <Chip
                    label={user.role}
                    size="small"
                    className={cn('capitalize', getRoleColor(user.role))}
                  />
                  <Chip
                    label={user.status}
                    size="small"
                    className={cn('capitalize', getStatusColor(user.status))}
                  />
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Chip
                    label={user.subscription}
                    size="small"
                    className={cn('capitalize', getSubscriptionColor(user.subscription))}
                  />
                  <span>{user.documents} docs</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1">
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onEdit(user); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit className="w-4 h-4" />
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
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last Login:</span>
              <span className="font-medium">{formatDate(user.lastLogin)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">{formatDate(user.createdAt)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Documents:</span>
              <span className="font-medium">{user.documents}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onEdit(user); handleMenuClose(); }}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </MenuItem>
        <MenuItem onClick={() => { onSuspend(user); handleMenuClose(); }}>
          <Lock className="w-4 h-4 mr-2" />
          Suspend
        </MenuItem>
        <MenuItem onClick={() => { onDelete(user); handleMenuClose(); }}>
          <Delete className="w-4 h-4 mr-2" />
          Delete
        </MenuItem>
      </Menu>
    </motion.div>
  );
};

// User Filters Component
interface UserFiltersProps {
  filters: {
    search: string;
    role: string[];
    status: string[];
    subscription: string[];
    dateRange: string;
  };
  onFiltersChange: (filters: any) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({ filters, onFiltersChange }) => {
  const [expanded, setExpanded] = useState(false);

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'analyst', label: 'Analyst' },
    { value: 'viewer', label: 'Viewer' },
    { value: 'guest', label: 'Guest' },
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' },
  ];

  const subscriptions = [
    { value: 'free', label: 'Free' },
    { value: 'basic', label: 'Basic' },
    { value: 'standard', label: 'Standard' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise' },
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
            User Filters
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
            placeholder="Search users..."
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
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      multiple
                      value={filters.role}
                      onChange={(e) => onFiltersChange({ ...filters, role: e.target.value })}
                      renderValue={(selected) => (
                        <div className="flex flex-wrap gap-1">
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </div>
                      )}
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          <Checkbox checked={filters.role.includes(role.value)} />
                          <ListItemText primary={role.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      multiple
                      value={filters.status}
                      onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
                      renderValue={(selected) => (
                        <div className="flex flex-wrap gap-1">
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </div>
                      )}
                    >
                      {statuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          <Checkbox checked={filters.status.includes(status.value)} />
                          <ListItemText primary={status.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Subscription</InputLabel>
                    <Select
                      multiple
                      value={filters.subscription}
                      onChange={(e) => onFiltersChange({ ...filters, subscription: e.target.value })}
                      renderValue={(selected) => (
                        <div className="flex flex-wrap gap-1">
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </div>
                      )}
                    >
                      {subscriptions.map((subscription) => (
                        <MenuItem key={subscription.value} value={subscription.value}>
                          <Checkbox checked={filters.subscription.includes(subscription.value)} />
                          <ListItemText primary={subscription.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outlined"
                  onClick={() => onFiltersChange({
                    search: '',
                    role: [],
                    status: [],
                    subscription: [],
                    dateRange: 'all',
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

// Main Enhanced User Management Component
const EnhancedUserManagement: React.FC = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    role: [],
    status: [],
    subscription: [],
    dateRange: 'all',
  });
  const [sortBy, setSortBy] = useState('lastLogin');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      const mockUsers: User[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@company.com',
          username: 'johndoe',
          role: 'admin',
          subscription: 'enterprise',
          status: 'active',
          avatar: '',
          lastLogin: new Date('2024-01-20'),
          createdAt: new Date('2023-06-15'),
          documents: 50,
          permissions: ['documents:read', 'documents:write', 'users:manage'],
          features: ['ai_search', 'advanced_analytics', 'compliance_reports'],
          preferences: {
            language: 'en',
            timezone: 'UTC',
            notifications: true,
            theme: 'light',
          },
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@company.com',
          username: 'janesmith',
          role: 'manager',
          subscription: 'pro',
          status: 'active',
          avatar: '',
          lastLogin: new Date('2024-01-19'),
          createdAt: new Date('2023-08-20'),
          documents: 30,
          permissions: ['documents:read', 'documents:write'],
          features: ['ai_search', 'advanced_analytics'],
          preferences: {
            language: 'en',
            timezone: 'UTC',
            notifications: true,
            theme: 'dark',
          },
        },
        // Add more mock users...
      ];

      setUsers(mockUsers);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (filters.search && !user.firstName.toLowerCase().includes(filters.search.toLowerCase()) &&
          !user.lastName.toLowerCase().includes(filters.search.toLowerCase()) &&
          !user.email.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.role.length > 0 && !filters.role.includes(user.role)) {
        return false;
      }
      if (filters.status.length > 0 && !filters.status.includes(user.status)) {
        return false;
      }
      if (filters.subscription.length > 0 && !filters.subscription.includes(user.subscription)) {
        return false;
      }
      return true;
    });
  }, [users, filters]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let aValue = a[sortBy as keyof User];
      let bValue = b[sortBy as keyof User];

      if (sortBy === 'lastLogin' || sortBy === 'createdAt') {
        aValue = new Date(aValue as Date).getTime();
        bValue = new Date(bValue as Date).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredUsers, sortBy, sortOrder]);

  const handleUserSelect = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleEdit = (user: User) => {
    console.log('Editing user:', user.email);
  };

  const handleDelete = (user: User) => {
    console.log('Deleting user:', user.email);
  };

  const handleSuspend = (user: User) => {
    console.log('Suspending user:', user.email);
  };

  const tabs = [
    { label: 'All Users', value: 'all', count: users.length },
    { label: 'Active', value: 'active', count: users.filter(u => u.status === 'active').length },
    { label: 'Pending', value: 'pending', count: users.filter(u => u.status === 'pending').length },
    { label: 'Suspended', value: 'suspended', count: users.filter(u => u.status === 'suspended').length },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography variant="h4" className="font-bold text-gray-900">
            User Management
          </Typography>
          <Typography variant="body1" className="text-gray-600 mt-1">
            Manage users, roles, and permissions
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
          <PermissionGate permission="users:create">
            <Button
              variant="contained"
              startIcon={<PersonAdd className="w-5 h-5" />}
            >
              Add User
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
      <UserFilters filters={filters} onFiltersChange={setFilters} />

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Typography variant="body2" className="text-gray-600">
            {sortedUsers.length} users
          </Typography>
          
          {selectedUsers.length > 0 && (
            <Typography variant="body2" className="text-blue-600">
              {selectedUsers.length} selected
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
              <MenuItem value="lastLogin">Last Login</MenuItem>
              <MenuItem value="createdAt">Created Date</MenuItem>
              <MenuItem value="firstName">First Name</MenuItem>
              <MenuItem value="lastName">Last Name</MenuItem>
              <MenuItem value="email">Email</MenuItem>
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

      {/* Users Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LinearProgress className="w-64 mb-4" />
            <Typography variant="body2" className="text-gray-600">
              Loading users...
            </Typography>
          </div>
        </div>
      ) : sortedUsers.length === 0 ? (
        <Card className="p-8 text-center">
          <People className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <Typography variant="h6" className="text-gray-600 mb-2">
            No users found
          </Typography>
          <Typography variant="body2" className="text-gray-500 mb-4">
            Try adjusting your filters or add a new user
          </Typography>
          <PermissionGate permission="users:create">
            <Button variant="contained" startIcon={<PersonAdd className="w-5 h-5" />}>
              Add User
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
            {sortedUsers.map((user, index) => (
              <UserCard
                key={user.id}
                user={user}
                viewMode={viewMode}
                onSelect={handleUserSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSuspend={handleSuspend}
                selected={selectedUsers.some(u => u.id === user.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default EnhancedUserManagement;
