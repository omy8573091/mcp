'use client';

// Security Dashboard Component
// Provides real-time security monitoring and threat detection

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
  Security,
  Warning,
  Error,
  CheckCircle,
  Info,
  TrendingUp,
  TrendingDown,
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
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
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
  CheckCircle as CheckCircleIcon2,
  Warning as WarningIcon2,
  Error as ErrorIcon2,
  Info as InfoIcon2,
  Refresh,
  Add,
  Upload,
  FolderOpen,
  FileCopy,
  MoveToInbox,
  RestoreFromTrash,
  MoreVert,
  Settings,
  Security as SecurityIcon,
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
import { securityManager, SecurityEventType, SecurityEvent } from './index';
import { clientSecurityManager } from './middleware';
import { cn } from '../utils';

// Security dashboard interfaces
interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  highEvents: number;
  mediumEvents: number;
  lowEvents: number;
  blockedIPs: number;
  rateLimitHits: number;
  csrfAttempts: number;
  injectionAttempts: number;
  xssAttempts: number;
  replayAttacks: number;
  penetrationTests: number;
  suspiciousRequests: number;
  apiAbuse: number;
  sessionHijacks: number;
  bruteForce: number;
}

interface SecurityTrend {
  date: string;
  events: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface ThreatLevel {
  level: 'low' | 'medium' | 'high' | 'critical';
  color: string;
  icon: React.ReactNode;
  description: string;
}

// Security metrics card component
interface SecurityMetricsCardProps {
  title: string;
  value: number;
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

const SecurityMetricsCard: React.FC<SecurityMetricsCardProps> = ({
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
                value.toLocaleString()
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
                  vs last hour
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

// Security event list component
interface SecurityEventListProps {
  events: SecurityEvent[];
  onEventClick: (event: SecurityEvent) => void;
  loading?: boolean;
}

const SecurityEventList: React.FC<SecurityEventListProps> = ({
  events,
  onEventClick,
  loading = false,
}) => {
  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[severity] || colors.low;
  };

  const getSeverityIcon = (severity: string) => {
    const icons = {
      low: <Info className="w-4 h-4 text-gray-600" />,
      medium: <Warning className="w-4 h-4 text-yellow-600" />,
      high: <Error className="w-4 h-4 text-orange-600" />,
      critical: <Error className="w-4 h-4 text-red-600" />,
    };
    return icons[severity] || icons.low;
  };

  const getEventTypeIcon = (type: SecurityEventType) => {
    const icons = {
      [SecurityEventType.CSRF_ATTEMPT]: <Lock className="w-4 h-4" />,
      [SecurityEventType.RATE_LIMIT_EXCEEDED]: <Schedule className="w-4 h-4" />,
      [SecurityEventType.SUSPICIOUS_REQUEST]: <Warning className="w-4 h-4" />,
      [SecurityEventType.REPLAY_ATTACK]: <Refresh className="w-4 h-4" />,
      [SecurityEventType.INJECTION_ATTEMPT]: <Code className="w-4 h-4" />,
      [SecurityEventType.XSS_ATTEMPT]: <Code className="w-4 h-4" />,
      [SecurityEventType.BRUTE_FORCE]: <Lock className="w-4 h-4" />,
      [SecurityEventType.SESSION_HIJACK]: <Person className="w-4 h-4" />,
      [SecurityEventType.API_ABUSE]: <BarChart className="w-4 h-4" />,
      [SecurityEventType.PENETRATION_TEST]: <Security className="w-4 h-4" />,
    };
    return icons[type] || <Info className="w-4 h-4" />;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 h-16 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}
            className="border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
            onClick={() => onEventClick(event)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getEventTypeIcon(event.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Typography variant="body1" className="font-semibold text-gray-900">
                    {event.type.replace(/_/g, ' ').toUpperCase()}
                  </Typography>
                  <Chip
                    label={event.severity}
                    size="small"
                    className={cn('capitalize', getSeverityColor(event.severity))}
                  />
                </div>
                
                <Typography variant="body2" className="text-gray-600 mb-2">
                  {event.endpoint} • {event.method}
                </Typography>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{event.ip}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(event.timestamp)}</span>
                  {event.userId && (
                    <>
                      <span>•</span>
                      <span>User: {event.userId}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {getSeverityIcon(event.severity)}
                <IconButton size="small">
                  <MoreVert className="w-4 h-4" />
                </IconButton>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Main security dashboard component
const SecurityDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  // Load security data
  useEffect(() => {
    const loadSecurityData = async () => {
      setLoading(true);
      
      try {
        // Get security events
        const events = securityManager.getSecurityEvents(undefined, undefined, 100);
        setRecentEvents(events);
        
        // Calculate metrics
        const calculatedMetrics: SecurityMetrics = {
          totalEvents: events.length,
          criticalEvents: events.filter(e => e.severity === 'critical').length,
          highEvents: events.filter(e => e.severity === 'high').length,
          mediumEvents: events.filter(e => e.severity === 'medium').length,
          lowEvents: events.filter(e => e.severity === 'low').length,
          blockedIPs: 0, // This would come from your security manager
          rateLimitHits: events.filter(e => e.type === SecurityEventType.RATE_LIMIT_EXCEEDED).length,
          csrfAttempts: events.filter(e => e.type === SecurityEventType.CSRF_ATTEMPT).length,
          injectionAttempts: events.filter(e => e.type === SecurityEventType.INJECTION_ATTEMPT).length,
          xssAttempts: events.filter(e => e.type === SecurityEventType.XSS_ATTEMPT).length,
          replayAttacks: events.filter(e => e.type === SecurityEventType.REPLAY_ATTACK).length,
          penetrationTests: events.filter(e => e.type === SecurityEventType.PENETRATION_TEST).length,
          suspiciousRequests: events.filter(e => e.type === SecurityEventType.SUSPICIOUS_REQUEST).length,
          apiAbuse: events.filter(e => e.type === SecurityEventType.API_ABUSE).length,
          sessionHijacks: events.filter(e => e.type === SecurityEventType.SESSION_HIJACK).length,
          bruteForce: events.filter(e => e.type === SecurityEventType.BRUTE_FORCE).length,
        };
        
        setMetrics(calculatedMetrics);
      } catch (error) {
        console.error('Failed to load security data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSecurityData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleEventClick = (event: SecurityEvent) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const handleCloseEventDialog = () => {
    setEventDialogOpen(false);
    setSelectedEvent(null);
  };

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Events', value: 'events' },
    { label: 'Threats', value: 'threats' },
    { label: 'Blocked IPs', value: 'blocked' },
    { label: 'Reports', value: 'reports' },
  ];

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LinearProgress className="w-64 mb-4" />
            <Typography variant="body2" className="text-gray-600">
              Loading security data...
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
            Security Dashboard
          </Typography>
          <Typography variant="body1" className="text-gray-600 mt-1">
            Real-time security monitoring and threat detection
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
      {currentTab === 0 && metrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <SecurityMetricsCard
                title="Total Events"
                value={metrics.totalEvents}
                change={{ value: 12, type: 'increase' }}
                icon={<Security className="w-8 h-8" />}
                color="primary"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <SecurityMetricsCard
                title="Critical Events"
                value={metrics.criticalEvents}
                change={{ value: 5, type: 'increase' }}
                icon={<Error className="w-8 h-8" />}
                color="error"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <SecurityMetricsCard
                title="High Events"
                value={metrics.highEvents}
                change={{ value: -2, type: 'decrease' }}
                icon={<Warning className="w-8 h-8" />}
                color="warning"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <SecurityMetricsCard
                title="Blocked IPs"
                value={metrics.blockedIPs}
                change={{ value: 3, type: 'increase' }}
                icon={<Lock className="w-8 h-8" />}
                color="info"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} className="mt-6">
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent className="p-6">
                  <Typography variant="h6" className="font-semibold mb-4">
                    Attack Types
                  </Typography>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-gray-600">
                        CSRF Attempts
                      </Typography>
                      <Typography variant="body2" className="font-semibold">
                        {metrics.csrfAttempts}
                      </Typography>
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-gray-600">
                        Injection Attempts
                      </Typography>
                      <Typography variant="body2" className="font-semibold">
                        {metrics.injectionAttempts}
                      </Typography>
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-gray-600">
                        XSS Attempts
                      </Typography>
                      <Typography variant="body2" className="font-semibold">
                        {metrics.xssAttempts}
                      </Typography>
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-gray-600">
                        Replay Attacks
                      </Typography>
                      <Typography variant="body2" className="font-semibold">
                        {metrics.replayAttacks}
                      </Typography>
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-gray-600">
                        Penetration Tests
                      </Typography>
                      <Typography variant="body2" className="font-semibold">
                        {metrics.penetrationTests}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent className="p-6">
                  <Typography variant="h6" className="font-semibold mb-4">
                    Security Status
                  </Typography>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-gray-600">
                        Rate Limit Hits
                      </Typography>
                      <Typography variant="body2" className="font-semibold">
                        {metrics.rateLimitHits}
                      </Typography>
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-gray-600">
                        Suspicious Requests
                      </Typography>
                      <Typography variant="body2" className="font-semibold">
                        {metrics.suspiciousRequests}
                      </Typography>
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-gray-600">
                        API Abuse
                      </Typography>
                      <Typography variant="body2" className="font-semibold">
                        {metrics.apiAbuse}
                      </Typography>
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-gray-600">
                        Session Hijacks
                      </Typography>
                      <Typography variant="body2" className="font-semibold">
                        {metrics.sessionHijacks}
                      </Typography>
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-gray-600">
                        Brute Force
                      </Typography>
                      <Typography variant="body2" className="font-semibold">
                        {metrics.bruteForce}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Events Tab */}
      {currentTab === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Recent Security Events
              </Typography>
              <SecurityEventList
                events={recentEvents}
                onEventClick={handleEventClick}
                loading={loading}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Other tabs would be implemented similarly */}
      {currentTab === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Threat Analysis
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Threat analysis features will be implemented here.
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Event Details Dialog */}
      <Dialog
        open={eventDialogOpen}
        onClose={handleCloseEventDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Security Event Details
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="subtitle2" className="font-semibold">
                    Event Type
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {selectedEvent.type.replace(/_/g, ' ').toUpperCase()}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" className="font-semibold">
                    Severity
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {selectedEvent.severity.toUpperCase()}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" className="font-semibold">
                    IP Address
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {selectedEvent.ip}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" className="font-semibold">
                    Timestamp
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {selectedEvent.timestamp.toLocaleString()}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" className="font-semibold">
                    Endpoint
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {selectedEvent.endpoint}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" className="font-semibold">
                    Method
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {selectedEvent.method}
                  </Typography>
                </div>
              </div>
              
              {selectedEvent.metadata && (
                <div>
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    Metadata
                  </Typography>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEventDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SecurityDashboard;
