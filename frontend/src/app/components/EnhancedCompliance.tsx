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
  Security,
  Assessment,
  Warning,
  CheckCircle,
  Error,
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
import { useLanguage } from '../hooks/useLanguage';
import { useRBAC } from '../../core/rbac/context';
import { ProtectedComponent, FeatureGate, PermissionGate } from '../../core/rbac/components';
import { ValidatedInput, ValidatedSelectInput, ValidatedTextarea, ValidatedForm } from '../../design-system/components/ValidatedInput';
import { validationSchemas } from '../../core/validation/schemas';
import { cn } from '../../core/utils';

// Compliance interfaces
interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  score: number;
  status: 'compliant' | 'warning' | 'non-compliant';
  lastAssessment: Date;
  nextAssessment: Date;
  requirements: ComplianceRequirement[];
  documents: ComplianceDocument[];
}

interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  status: 'compliant' | 'warning' | 'non-compliant';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: Date;
  assignedTo: string;
  documents: string[];
}

interface ComplianceDocument {
  id: string;
  title: string;
  type: string;
  status: 'approved' | 'pending' | 'rejected';
  lastReview: Date;
  nextReview: Date;
  reviewer: string;
}

interface RiskAssessment {
  id: string;
  title: string;
  description: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  probability: number;
  impact: number;
  mitigation: string;
  owner: string;
  dueDate: Date;
  documents: string[];
}

// Compliance Framework Card
interface ComplianceFrameworkCardProps {
  framework: ComplianceFramework;
  onView: (framework: ComplianceFramework) => void;
  onAssess: (framework: ComplianceFramework) => void;
}

const ComplianceFrameworkCard: React.FC<ComplianceFrameworkCardProps> = ({
  framework,
  onView,
  onAssess,
}) => {
  const getStatusColor = (status: string) => {
    const colors = {
      compliant: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      'non-compliant': 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.warning;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      compliant: <CheckCircle className="w-5 h-5 text-green-600" />,
      warning: <Warning className="w-5 h-5 text-yellow-600" />,
      'non-compliant': <Error className="w-5 h-5 text-red-600" />,
    };
    return icons[status] || icons.warning;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Security className="w-6 h-6 text-blue-600" />
                <Typography variant="h6" className="font-semibold text-gray-900">
                  {framework.name}
                </Typography>
              </div>
              
              <Typography variant="body2" className="text-gray-600 mb-3">
                {framework.description}
              </Typography>
              
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(framework.status)}
                  <Chip
                    label={framework.status}
                    size="small"
                    className={cn('capitalize', getStatusColor(framework.status))}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Typography variant="body2" className="text-gray-600">
                    Score:
                  </Typography>
                  <Typography variant="body2" className={cn('font-semibold', getScoreColor(framework.score))}>
                    {framework.score}%
                  </Typography>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Assessment:</span>
                  <span className="font-medium">
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }).format(framework.lastAssessment)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Next Assessment:</span>
                  <span className="font-medium">
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }).format(framework.nextAssessment)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Requirements:</span>
                  <span className="font-medium">{framework.requirements.length}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Documents:</span>
                  <span className="font-medium">{framework.documents.length}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outlined"
              size="small"
              onClick={() => onView(framework)}
            >
              View Details
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => onAssess(framework)}
            >
              Run Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Risk Assessment Card
interface RiskAssessmentCardProps {
  risk: RiskAssessment;
  onView: (risk: RiskAssessment) => void;
  onEdit: (risk: RiskAssessment) => void;
}

const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({
  risk,
  onView,
  onEdit,
}) => {
  const getLevelColor = (level: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[level] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.open;
  };

  const getRiskScore = () => {
    return Math.round((risk.probability + risk.impact) / 2);
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Warning className="w-6 h-6 text-orange-600" />
                <Typography variant="h6" className="font-semibold text-gray-900">
                  {risk.title}
                </Typography>
              </div>
              
              <Typography variant="body2" className="text-gray-600 mb-3">
                {risk.description}
              </Typography>
              
              <div className="flex items-center space-x-4 mb-3">
                <Chip
                  label={risk.level}
                  size="small"
                  className={cn('capitalize', getLevelColor(risk.level))}
                />
                <Chip
                  label={risk.status}
                  size="small"
                  className={cn('capitalize', getStatusColor(risk.status))}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Risk Score:</span>
                  <span className={cn('font-semibold', getRiskScoreColor(getRiskScore()))}>
                    {getRiskScore()}/100
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Probability:</span>
                  <span className="font-medium">{risk.probability}%</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Impact:</span>
                  <span className="font-medium">{risk.impact}%</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Owner:</span>
                  <span className="font-medium">{risk.owner}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }).format(risk.dueDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outlined"
              size="small"
              onClick={() => onView(risk)}
            >
              View Details
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => onEdit(risk)}
            >
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Enhanced Compliance Component
const EnhancedCompliance: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setFrameworks([
        {
          id: '1',
          name: 'GDPR',
          description: 'General Data Protection Regulation compliance framework',
          score: 95,
          status: 'compliant',
          lastAssessment: new Date('2024-01-15'),
          nextAssessment: new Date('2024-04-15'),
          requirements: [],
          documents: [],
        },
        {
          id: '2',
          name: 'SOX',
          description: 'Sarbanes-Oxley Act compliance framework',
          score: 90,
          status: 'compliant',
          lastAssessment: new Date('2024-01-10'),
          nextAssessment: new Date('2024-04-10'),
          requirements: [],
          documents: [],
        },
        {
          id: '3',
          name: 'HIPAA',
          description: 'Health Insurance Portability and Accountability Act',
          score: 85,
          status: 'warning',
          lastAssessment: new Date('2024-01-05'),
          nextAssessment: new Date('2024-04-05'),
          requirements: [],
          documents: [],
        },
      ]);

      setRisks([
        {
          id: '1',
          title: 'Data Access Control',
          description: 'Unauthorized access to sensitive documents',
          level: 'medium',
          status: 'in-progress',
          probability: 60,
          impact: 70,
          mitigation: 'Implement multi-factor authentication and role-based access controls',
          owner: 'John Doe',
          dueDate: new Date('2024-02-15'),
          documents: [],
        },
        {
          id: '2',
          title: 'Document Retention',
          description: 'Inadequate document retention policies',
          level: 'low',
          status: 'resolved',
          probability: 30,
          impact: 40,
          mitigation: 'Updated retention policies and automated cleanup processes',
          owner: 'Jane Smith',
          dueDate: new Date('2024-01-30'),
          documents: [],
        },
        {
          id: '3',
          title: 'Data Breach Response',
          description: 'Lack of comprehensive data breach response plan',
          level: 'high',
          status: 'open',
          probability: 40,
          impact: 90,
          mitigation: 'Develop and test data breach response procedures',
          owner: 'Mike Johnson',
          dueDate: new Date('2024-03-01'),
          documents: [],
        },
      ]);

      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { label: 'Frameworks', value: 'frameworks' },
    { label: 'Risk Assessment', value: 'risks' },
    { label: 'Requirements', value: 'requirements' },
    { label: 'Reports', value: 'reports' },
  ];

  const handleFrameworkView = (framework: ComplianceFramework) => {
    console.log('Viewing framework:', framework.name);
  };

  const handleFrameworkAssess = (framework: ComplianceFramework) => {
    console.log('Assessing framework:', framework.name);
  };

  const handleRiskView = (risk: RiskAssessment) => {
    console.log('Viewing risk:', risk.title);
  };

  const handleRiskEdit = (risk: RiskAssessment) => {
    console.log('Editing risk:', risk.title);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LinearProgress className="w-64 mb-4" />
            <Typography variant="body2" className="text-gray-600">
              Loading compliance data...
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
            Compliance Management
          </Typography>
          <Typography variant="body1" className="text-gray-600 mt-1">
            Monitor and manage compliance frameworks and risk assessments
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
            startIcon={<Add className="w-5 h-5" />}
          >
            New Assessment
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

      {/* Frameworks Tab */}
      {currentTab === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Grid container spacing={3}>
            {frameworks.map((framework, index) => (
              <Grid item xs={12} md={6} lg={4} key={framework.id}>
                <ComplianceFrameworkCard
                  framework={framework}
                  onView={handleFrameworkView}
                  onAssess={handleFrameworkAssess}
                />
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}

      {/* Risk Assessment Tab */}
      {currentTab === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Grid container spacing={3}>
            {risks.map((risk, index) => (
              <Grid item xs={12} md={6} lg={4} key={risk.id}>
                <RiskAssessmentCard
                  risk={risk}
                  onView={handleRiskView}
                  onEdit={handleRiskEdit}
                />
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}

      {/* Requirements Tab */}
      {currentTab === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Compliance Requirements
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Requirements management features will be implemented here.
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Reports Tab */}
      {currentTab === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Compliance Reports
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Report generation and export features will be implemented here.
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedCompliance;
