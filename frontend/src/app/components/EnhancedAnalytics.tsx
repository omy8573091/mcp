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
  TrendingUp,
  TrendingDown,
  Assessment,
  BarChart,
  PieChart,
  LineChart,
  TableChart,
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
  TableChart as TableChartIcon,
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
  TrendingUp as TrendingUpIcon,
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
  MoreVert,
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

// Analytics data interfaces
interface AnalyticsData {
  overview: {
    totalDocuments: number;
    totalUsers: number;
    storageUsed: number;
    complianceScore: number;
    trends: {
      documents: { date: string; value: number }[];
      users: { date: string; value: number }[];
      storage: { date: string; value: number }[];
    };
  };
  documents: {
    byType: { type: string; count: number; percentage: number }[];
    byCategory: { category: string; count: number; percentage: number }[];
    byPriority: { priority: string; count: number; percentage: number }[];
    recent: { title: string; type: string; uploadDate: Date; author: string }[];
  };
  users: {
    active: { name: string; role: string; lastActive: Date; documents: number }[];
    roles: { role: string; count: number; percentage: number }[];
    activity: { date: string; logins: number; uploads: number; downloads: number }[];
  };
  compliance: {
    score: number;
    frameworks: { name: string; score: number; status: 'compliant' | 'warning' | 'non-compliant' }[];
    risks: { title: string; level: 'low' | 'medium' | 'high' | 'critical'; status: string }[];
  };
  performance: {
    responseTime: { date: string; value: number }[];
    errorRate: { date: string; value: number }[];
    uptime: number;
  };
}

// Analytics Card Component
interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trend?: number[];
  onClick?: () => void;
  loading?: boolean;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  trend,
  onClick,
  loading = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getColorClasses = () => {
    const colors = {
      primary: 'bg-blue-50 border-blue-200 text-blue-700',
      secondary: 'bg-purple-50 border-purple-200 text-purple-700',
      success: 'bg-green-50 border-green-200 text-green-700',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      error: 'bg-red-50 border-red-200 text-red-700',
      info: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    };
    return colors[color];
  };

  const getIconColor = () => {
    const colors = {
      primary: 'text-blue-600',
      secondary: 'text-purple-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-cyan-600',
    };
    return colors[color];
  };

  const getChangeIcon = () => {
    if (!change) return null;
    switch (change.type) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getChangeColor = () => {
    if (!change) return '';
    switch (change.type) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'relative overflow-hidden transition-all duration-300 cursor-pointer',
          'hover:shadow-lg border-2',
          getColorClasses(),
          isHovered && 'shadow-xl'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn('p-3 rounded-xl', getColorClasses())}>
              <div className={cn('w-8 h-8', getIconColor())}>
                {icon}
              </div>
            </div>
            <IconButton size="small" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVert className="w-5 h-5" />
            </IconButton>
          </div>

          <div className="space-y-2">
            <Typography variant="h4" className="font-bold text-gray-900">
              {loading ? (
                <div className="animate-pulse bg-gray-300 h-8 w-20 rounded"></div>
              ) : (
                value
              )}
            </Typography>
            
            <Typography variant="body2" className="text-gray-600 font-medium">
              {title}
            </Typography>

            {change && (
              <div className="flex items-center space-x-1">
                {getChangeIcon()}
                <Typography
                  variant="caption"
                  className={cn('font-semibold', getChangeColor())}
                >
                  {change.value > 0 ? '+' : ''}{change.value}%
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  vs last month
                </Typography>
              </div>
            )}
          </div>

          {trend && (
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          )}

          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 right-4"
            >
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Chart Component
interface ChartProps {
  title: string;
  data: any[];
  type: 'bar' | 'line' | 'pie' | 'area';
  height?: number;
  color?: string;
}

const Chart: React.FC<ChartProps> = ({ title, data, type, height = 300, color = '#3B82F6' }) => {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <Typography variant="h6" className="font-semibold mb-4">
          {title}
        </Typography>
        
        <div 
          className="w-full bg-gray-100 rounded-lg flex items-center justify-center"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <BarChart className="w-16 h-16 text-gray-400 mx-auto mb-2" />
            <Typography variant="body2" className="text-gray-600">
              Chart visualization would go here
            </Typography>
            <Typography variant="caption" className="text-gray-500">
              {type.toUpperCase()} Chart - {data.length} data points
            </Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Enhanced Analytics Component
const EnhancedAnalytics: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setAnalyticsData({
        overview: {
          totalDocuments: 1247,
          totalUsers: 89,
          storageUsed: 75,
          complianceScore: 92,
          trends: {
            documents: [
              { date: '2024-01-01', value: 1000 },
              { date: '2024-01-02', value: 1100 },
              { date: '2024-01-03', value: 1200 },
              { date: '2024-01-04', value: 1247 },
            ],
            users: [
              { date: '2024-01-01', value: 80 },
              { date: '2024-01-02', value: 82 },
              { date: '2024-01-03', value: 85 },
              { date: '2024-01-04', value: 89 },
            ],
            storage: [
              { date: '2024-01-01', value: 70 },
              { date: '2024-01-02', value: 72 },
              { date: '2024-01-03', value: 74 },
              { date: '2024-01-04', value: 75 },
            ],
          },
        },
        documents: {
          byType: [
            { type: 'PDF', count: 500, percentage: 40 },
            { type: 'DOCX', count: 300, percentage: 24 },
            { type: 'XLSX', count: 200, percentage: 16 },
            { type: 'Other', count: 247, percentage: 20 },
          ],
          byCategory: [
            { category: 'Policy', count: 400, percentage: 32 },
            { category: 'Procedure', count: 300, percentage: 24 },
            { category: 'Report', count: 200, percentage: 16 },
            { category: 'Other', count: 347, percentage: 28 },
          ],
          byPriority: [
            { priority: 'High', count: 200, percentage: 16 },
            { priority: 'Medium', count: 600, percentage: 48 },
            { priority: 'Low', count: 447, percentage: 36 },
          ],
          recent: [
            { title: 'Security Policy 2024', type: 'PDF', uploadDate: new Date(), author: 'John Doe' },
            { title: 'Employee Handbook', type: 'DOCX', uploadDate: new Date(), author: 'Jane Smith' },
          ],
        },
        users: {
          active: [
            { name: 'John Doe', role: 'Admin', lastActive: new Date(), documents: 50 },
            { name: 'Jane Smith', role: 'Manager', lastActive: new Date(), documents: 30 },
          ],
          roles: [
            { role: 'Admin', count: 5, percentage: 6 },
            { role: 'Manager', count: 15, percentage: 17 },
            { role: 'User', count: 69, percentage: 77 },
          ],
          activity: [
            { date: '2024-01-01', logins: 50, uploads: 10, downloads: 25 },
            { date: '2024-01-02', logins: 55, uploads: 12, downloads: 30 },
          ],
        },
        compliance: {
          score: 92,
          frameworks: [
            { name: 'GDPR', score: 95, status: 'compliant' },
            { name: 'SOX', score: 90, status: 'compliant' },
            { name: 'HIPAA', score: 85, status: 'warning' },
          ],
          risks: [
            { title: 'Data Access Control', level: 'medium', status: 'In Review' },
            { title: 'Document Retention', level: 'low', status: 'Compliant' },
          ],
        },
        performance: {
          responseTime: [
            { date: '2024-01-01', value: 200 },
            { date: '2024-01-02', value: 180 },
          ],
          errorRate: [
            { date: '2024-01-01', value: 0.5 },
            { date: '2024-01-02', value: 0.3 },
          ],
          uptime: 99.9,
        },
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Documents', value: 'documents' },
    { label: 'Users', value: 'users' },
    { label: 'Compliance', value: 'compliance' },
    { label: 'Performance', value: 'performance' },
  ];

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LinearProgress className="w-64 mb-4" />
            <Typography variant="body2" className="text-gray-600">
              Loading analytics data...
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography variant="h4" className="font-bold text-gray-900">
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" className="text-gray-600 mt-1">
            Comprehensive insights into your document management system
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
          <Button
            variant="contained"
            startIcon={<Download className="w-5 h-5" />}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Paper className="mb-6">
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      {/* Overview Tab */}
      {currentTab === 0 && analyticsData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsCard
                title="Total Documents"
                value={analyticsData.overview.totalDocuments.toLocaleString()}
                change={{ value: 12, type: 'increase' }}
                icon={<Document className="w-8 h-8" />}
                color="primary"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsCard
                title="Active Users"
                value={analyticsData.overview.totalUsers}
                change={{ value: 5, type: 'increase' }}
                icon={<People className="w-8 h-8" />}
                color="success"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsCard
                title="Storage Used"
                value={`${analyticsData.overview.storageUsed}%`}
                change={{ value: -2, type: 'decrease' }}
                icon={<Assessment className="w-8 h-8" />}
                color="warning"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsCard
                title="Compliance Score"
                value={`${analyticsData.overview.complianceScore}%`}
                change={{ value: 3, type: 'increase' }}
                icon={<Security className="w-8 h-8" />}
                color="info"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} className="mt-6">
            <Grid item xs={12} md={6}>
              <Chart
                title="Document Trends"
                data={analyticsData.overview.trends.documents}
                type="line"
                height={300}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Chart
                title="User Activity"
                data={analyticsData.overview.trends.users}
                type="bar"
                height={300}
              />
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Documents Tab */}
      {currentTab === 1 && analyticsData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Chart
                title="Documents by Type"
                data={analyticsData.documents.byType}
                type="pie"
                height={300}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Chart
                title="Documents by Category"
                data={analyticsData.documents.byCategory}
                type="bar"
                height={300}
              />
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Users Tab */}
      {currentTab === 2 && analyticsData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Chart
                title="User Roles Distribution"
                data={analyticsData.users.roles}
                type="pie"
                height={300}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Chart
                title="User Activity Trends"
                data={analyticsData.users.activity}
                type="line"
                height={300}
              />
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Compliance Tab */}
      {currentTab === 3 && analyticsData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent className="p-6">
                  <Typography variant="h6" className="font-semibold mb-4">
                    Compliance Frameworks
                  </Typography>
                  <div className="space-y-3">
                    {analyticsData.compliance.frameworks.map((framework, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <Typography variant="body2" className="font-medium">
                          {framework.name}
                        </Typography>
                        <div className="flex items-center space-x-2">
                          <Typography variant="body2" className="font-semibold">
                            {framework.score}%
                          </Typography>
                          <Chip
                            label={framework.status}
                            size="small"
                            color={framework.status === 'compliant' ? 'success' : 'warning'}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent className="p-6">
                  <Typography variant="h6" className="font-semibold mb-4">
                    Risk Assessment
                  </Typography>
                  <div className="space-y-3">
                    {analyticsData.compliance.risks.map((risk, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <Typography variant="body2" className="font-medium">
                          {risk.title}
                        </Typography>
                        <div className="flex items-center space-x-2">
                          <Chip
                            label={risk.level}
                            size="small"
                            color={risk.level === 'high' ? 'error' : risk.level === 'medium' ? 'warning' : 'success'}
                          />
                          <Typography variant="caption" className="text-gray-600">
                            {risk.status}
                          </Typography>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Performance Tab */}
      {currentTab === 4 && analyticsData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Chart
                title="Response Time"
                data={analyticsData.performance.responseTime}
                type="line"
                height={300}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Chart
                title="Error Rate"
                data={analyticsData.performance.errorRate}
                type="area"
                height={300}
              />
            </Grid>
          </Grid>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedAnalytics;
