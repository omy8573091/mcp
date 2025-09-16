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
  Settings,
  Person,
  Security,
  Notifications,
  Language,
  Palette,
  Storage,
  Cloud,
  Api,
  Integration,
  Backup,
  Restore,
  Download,
  Upload,
  Refresh,
  Save,
  Cancel,
  Edit,
  Delete,
  Add,
  Remove,
  Check,
  Close,
  Warning,
  Error,
  Info,
  CheckCircle,
  Lock,
  Public,
  Group,
  People,
  Schedule,
  Category,
  Label,
  Tag,
  Language as LanguageIcon,
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
  Language as LanguageIcon2,
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
  Language as LanguageIcon3,
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
  Refresh as RefreshIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  FolderOpen,
  FileCopy,
  MoveToInbox,
  RestoreFromTrash,
  MoreVert,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon3,
  Category as CategoryIcon,
  Label as LabelIcon,
  Tag as TagIcon3,
  Language as LanguageIcon4,
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
  Language as LanguageIcon5,
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

// Settings interfaces
interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    avatar?: string;
    bio?: string;
    phone?: string;
    timezone: string;
    language: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      desktop: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private' | 'team';
      dataSharing: boolean;
      analytics: boolean;
    };
    display: {
      density: 'compact' | 'comfortable' | 'spacious';
      sidebar: 'collapsed' | 'expanded';
      animations: boolean;
    };
  };
  security: {
    twoFactor: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    loginNotifications: boolean;
    apiAccess: boolean;
  };
}

interface OrganizationSettings {
  general: {
    name: string;
    domain: string;
    description?: string;
    logo?: string;
    timezone: string;
    language: string;
  };
  storage: {
    maxFileSize: number;
    maxStorage: number;
    retentionPeriod: number;
    compression: boolean;
  };
  integrations: {
    sso: boolean;
    ldap: boolean;
    api: boolean;
    webhooks: boolean;
  };
  compliance: {
    frameworks: string[];
    auditLogs: boolean;
    dataRetention: number;
    encryption: boolean;
  };
}

// Settings Section Component
interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  icon,
  children,
  expanded = false,
  onToggle,
}) => {
  return (
    <Accordion expanded={expanded} onChange={onToggle}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            {icon}
          </div>
          <div>
            <Typography variant="h6" className="font-semibold">
              {title}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              {description}
            </Typography>
          </div>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div className="pt-4">
          {children}
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

// Main Enhanced Settings Component
const EnhancedSettings: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    profile: {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      timezone: 'UTC',
      language: 'en',
    },
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false,
        desktop: true,
      },
      privacy: {
        profileVisibility: 'team',
        dataSharing: false,
        analytics: true,
      },
      display: {
        density: 'comfortable',
        sidebar: 'expanded',
        animations: true,
      },
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginNotifications: true,
      apiAccess: false,
    },
  });
  const [organizationSettings, setOrganizationSettings] = useState<OrganizationSettings>({
    general: {
      name: '',
      domain: '',
      timezone: 'UTC',
      language: 'en',
    },
    storage: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxStorage: 100 * 1024 * 1024 * 1024, // 100GB
      retentionPeriod: 365,
      compression: true,
    },
    integrations: {
      sso: false,
      ldap: false,
      api: false,
      webhooks: false,
    },
    compliance: {
      frameworks: [],
      auditLogs: true,
      dataRetention: 2555, // 7 years
      encryption: true,
    },
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setUserSettings(prev => ({
        ...prev,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@company.com',
          username: 'johndoe',
          timezone: 'UTC',
          language: 'en',
        },
      }));
      setOrganizationSettings(prev => ({
        ...prev,
        general: {
          name: 'Acme Corporation',
          domain: 'acme.com',
          timezone: 'UTC',
          language: 'en',
        },
      }));
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { label: 'Profile', value: 'profile' },
    { label: 'Preferences', value: 'preferences' },
    { label: 'Security', value: 'security' },
    { label: 'Organization', value: 'organization' },
    { label: 'Integrations', value: 'integrations' },
    { label: 'Advanced', value: 'advanced' },
  ];

  const handleSave = () => {
    console.log('Saving settings...');
    // Implement save logic
  };

  const handleReset = () => {
    console.log('Resetting settings...');
    // Implement reset logic
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LinearProgress className="w-64 mb-4" />
            <Typography variant="body2" className="text-gray-600">
              Loading settings...
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
            Settings
          </Typography>
          <Typography variant="body1" className="text-gray-600 mt-1">
            Manage your account and application preferences
          </Typography>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outlined"
            startIcon={<Refresh className="w-5 h-5" />}
            onClick={() => setLoading(true)}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<Save className="w-5 h-5" />}
            onClick={handleSave}
          >
            Save Changes
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

      {/* Profile Tab */}
      {currentTab === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6">
            <CardContent className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Profile Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <ValidatedInput
                    label="First Name"
                    value={userSettings.profile.firstName}
                    onChange={(e) => setUserSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, firstName: e.target.value }
                    }))}
                    validationConfig={{
                      schema: validationSchemas.firstName,
                      validateOnChange: true,
                    }}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <ValidatedInput
                    label="Last Name"
                    value={userSettings.profile.lastName}
                    onChange={(e) => setUserSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, lastName: e.target.value }
                    }))}
                    validationConfig={{
                      schema: validationSchemas.lastName,
                      validateOnChange: true,
                    }}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <ValidatedInput
                    label="Email"
                    type="email"
                    value={userSettings.profile.email}
                    onChange={(e) => setUserSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, email: e.target.value }
                    }))}
                    validationConfig={{
                      schema: validationSchemas.email,
                      validateOnChange: true,
                    }}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <ValidatedInput
                    label="Username"
                    value={userSettings.profile.username}
                    onChange={(e) => setUserSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, username: e.target.value }
                    }))}
                    validationConfig={{
                      schema: validationSchemas.username,
                      validateOnChange: true,
                    }}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <ValidatedInput
                    label="Phone"
                    type="tel"
                    value={userSettings.profile.phone || ''}
                    onChange={(e) => setUserSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, phone: e.target.value }
                    }))}
                    validationConfig={{
                      schema: validationSchemas.phone,
                      validateOnChange: true,
                    }}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <ValidatedSelectInput
                    label="Timezone"
                    value={userSettings.profile.timezone}
                    onChange={(value) => setUserSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, timezone: value }
                    }))}
                    options={[
                      { value: 'UTC', label: 'UTC' },
                      { value: 'America/New_York', label: 'Eastern Time' },
                      { value: 'America/Chicago', label: 'Central Time' },
                      { value: 'America/Denver', label: 'Mountain Time' },
                      { value: 'America/Los_Angeles', label: 'Pacific Time' },
                      { value: 'Europe/London', label: 'London' },
                      { value: 'Europe/Paris', label: 'Paris' },
                      { value: 'Asia/Tokyo', label: 'Tokyo' },
                    ]}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <ValidatedTextarea
                    label="Bio"
                    value={userSettings.profile.bio || ''}
                    onChange={(e) => setUserSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, bio: e.target.value }
                    }))}
                    rows={3}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Preferences Tab */}
      {currentTab === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="space-y-6">
            <SettingsSection
              title="Appearance"
              description="Customize the look and feel of the application"
              icon={<Palette className="w-6 h-6 text-blue-600" />}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={userSettings.preferences.theme}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, theme: e.target.value }
                      }))}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="auto">Auto</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Display Density</InputLabel>
                    <Select
                      value={userSettings.preferences.display.density}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          display: { ...prev.preferences.display, density: e.target.value }
                        }
                      }))}
                    >
                      <MenuItem value="compact">Compact</MenuItem>
                      <MenuItem value="comfortable">Comfortable</MenuItem>
                      <MenuItem value="spacious">Spacious</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <div className="space-y-2">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userSettings.preferences.display.animations}
                          onChange={(e) => setUserSettings(prev => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              display: { ...prev.preferences.display, animations: e.target.checked }
                            }
                          }))}
                        />
                      }
                      label="Enable animations"
                    />
                  </div>
                </Grid>
              </Grid>
            </SettingsSection>

            <SettingsSection
              title="Notifications"
              description="Configure how you receive notifications"
              icon={<Notifications className="w-6 h-6 text-blue-600" />}
            >
              <div className="space-y-4">
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.preferences.notifications.email}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: { ...prev.preferences.notifications, email: e.target.checked }
                        }
                      }))}
                    />
                  }
                  label="Email notifications"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.preferences.notifications.push}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: { ...prev.preferences.notifications, push: e.target.checked }
                        }
                      }))}
                    />
                  }
                  label="Push notifications"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.preferences.notifications.desktop}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: { ...prev.preferences.notifications, desktop: e.target.checked }
                        }
                      }))}
                    />
                  }
                  label="Desktop notifications"
                />
              </div>
            </SettingsSection>

            <SettingsSection
              title="Privacy"
              description="Control your privacy and data sharing preferences"
              icon={<Security className="w-6 h-6 text-blue-600" />}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Profile Visibility</InputLabel>
                    <Select
                      value={userSettings.preferences.privacy.profileVisibility}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          privacy: { ...prev.preferences.privacy, profileVisibility: e.target.value }
                        }
                      }))}
                    >
                      <MenuItem value="public">Public</MenuItem>
                      <MenuItem value="team">Team Only</MenuItem>
                      <MenuItem value="private">Private</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <div className="space-y-2">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userSettings.preferences.privacy.dataSharing}
                          onChange={(e) => setUserSettings(prev => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              privacy: { ...prev.preferences.privacy, dataSharing: e.target.checked }
                            }
                          }))}
                        />
                      }
                      label="Allow data sharing for analytics"
                    />
                  </div>
                </Grid>
              </Grid>
            </SettingsSection>
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {currentTab === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="space-y-6">
            <SettingsSection
              title="Authentication"
              description="Manage your authentication and security settings"
              icon={<Lock className="w-6 h-6 text-blue-600" />}
            >
              <div className="space-y-4">
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.security.twoFactor}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, twoFactor: e.target.checked }
                      }))}
                    />
                  }
                  label="Two-factor authentication"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.security.loginNotifications}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, loginNotifications: e.target.checked }
                      }))}
                    />
                  }
                  label="Login notifications"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.security.apiAccess}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, apiAccess: e.target.checked }
                      }))}
                    />
                  }
                  label="API access"
                />
              </div>
            </SettingsSection>

            <SettingsSection
              title="Session Management"
              description="Configure session timeout and password policies"
              icon={<Schedule className="w-6 h-6 text-blue-600" />}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Session Timeout (minutes)</InputLabel>
                    <Select
                      value={userSettings.security.sessionTimeout}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, sessionTimeout: e.target.value }
                      }))}
                    >
                      <MenuItem value={15}>15 minutes</MenuItem>
                      <MenuItem value={30}>30 minutes</MenuItem>
                      <MenuItem value={60}>1 hour</MenuItem>
                      <MenuItem value={120}>2 hours</MenuItem>
                      <MenuItem value={480}>8 hours</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Password Expiry (days)</InputLabel>
                    <Select
                      value={userSettings.security.passwordExpiry}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, passwordExpiry: e.target.value }
                      }))}
                    >
                      <MenuItem value={30}>30 days</MenuItem>
                      <MenuItem value={60}>60 days</MenuItem>
                      <MenuItem value={90}>90 days</MenuItem>
                      <MenuItem value={180}>180 days</MenuItem>
                      <MenuItem value={365}>1 year</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </SettingsSection>
          </div>
        </motion.div>
      )}

      {/* Organization Tab */}
      {currentTab === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="space-y-6">
            <SettingsSection
              title="General Information"
              description="Basic organization details and settings"
              icon={<Group className="w-6 h-6 text-blue-600" />}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <ValidatedInput
                    label="Organization Name"
                    value={organizationSettings.general.name}
                    onChange={(e) => setOrganizationSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, name: e.target.value }
                    }))}
                    validationConfig={{
                      schema: validationSchemas.documentTitle,
                      validateOnChange: true,
                    }}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <ValidatedInput
                    label="Domain"
                    value={organizationSettings.general.domain}
                    onChange={(e) => setOrganizationSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, domain: e.target.value }
                    }))}
                    validationConfig={{
                      schema: validationSchemas.url,
                      validateOnChange: true,
                    }}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <ValidatedTextarea
                    label="Description"
                    value={organizationSettings.general.description || ''}
                    onChange={(e) => setOrganizationSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, description: e.target.value }
                    }))}
                    rows={3}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </SettingsSection>

            <SettingsSection
              title="Storage Settings"
              description="Configure file storage and retention policies"
              icon={<Storage className="w-6 h-6 text-blue-600" />}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Max File Size (MB)</InputLabel>
                    <Select
                      value={Math.round(organizationSettings.storage.maxFileSize / 1024 / 1024)}
                      onChange={(e) => setOrganizationSettings(prev => ({
                        ...prev,
                        storage: { ...prev.storage, maxFileSize: e.target.value * 1024 * 1024 }
                      }))}
                    >
                      <MenuItem value={10}>10 MB</MenuItem>
                      <MenuItem value={25}>25 MB</MenuItem>
                      <MenuItem value={50}>50 MB</MenuItem>
                      <MenuItem value={100}>100 MB</MenuItem>
                      <MenuItem value={250}>250 MB</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Retention Period (days)</InputLabel>
                    <Select
                      value={organizationSettings.storage.retentionPeriod}
                      onChange={(e) => setOrganizationSettings(prev => ({
                        ...prev,
                        storage: { ...prev.storage, retentionPeriod: e.target.value }
                      }))}
                    >
                      <MenuItem value={30}>30 days</MenuItem>
                      <MenuItem value={90}>90 days</MenuItem>
                      <MenuItem value={180}>180 days</MenuItem>
                      <MenuItem value={365}>1 year</MenuItem>
                      <MenuItem value={730}>2 years</MenuItem>
                      <MenuItem value={2555}>7 years</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <div className="space-y-2">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={organizationSettings.storage.compression}
                          onChange={(e) => setOrganizationSettings(prev => ({
                            ...prev,
                            storage: { ...prev.storage, compression: e.target.checked }
                          }))}
                        />
                      }
                      label="Enable file compression"
                    />
                  </div>
                </Grid>
              </Grid>
            </SettingsSection>
          </div>
        </motion.div>
      )}

      {/* Integrations Tab */}
      {currentTab === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="space-y-6">
            <SettingsSection
              title="Single Sign-On"
              description="Configure SSO integration with external providers"
              icon={<Security className="w-6 h-6 text-blue-600" />}
            >
              <div className="space-y-4">
                <FormControlLabel
                  control={
                    <Switch
                      checked={organizationSettings.integrations.sso}
                      onChange={(e) => setOrganizationSettings(prev => ({
                        ...prev,
                        integrations: { ...prev.integrations, sso: e.target.checked }
                      }))}
                    />
                  }
                  label="Enable SSO"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={organizationSettings.integrations.ldap}
                      onChange={(e) => setOrganizationSettings(prev => ({
                        ...prev,
                        integrations: { ...prev.integrations, ldap: e.target.checked }
                      }))}
                    />
                  }
                  label="Enable LDAP"
                />
              </div>
            </SettingsSection>

            <SettingsSection
              title="API & Webhooks"
              description="Manage API access and webhook integrations"
              icon={<Api className="w-6 h-6 text-blue-600" />}
            >
              <div className="space-y-4">
                <FormControlLabel
                  control={
                    <Switch
                      checked={organizationSettings.integrations.api}
                      onChange={(e) => setOrganizationSettings(prev => ({
                        ...prev,
                        integrations: { ...prev.integrations, api: e.target.checked }
                      }))}
                    />
                  }
                  label="Enable API access"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={organizationSettings.integrations.webhooks}
                      onChange={(e) => setOrganizationSettings(prev => ({
                        ...prev,
                        integrations: { ...prev.integrations, webhooks: e.target.checked }
                      }))}
                    />
                  }
                  label="Enable webhooks"
                />
              </div>
            </SettingsSection>
          </div>
        </motion.div>
      )}

      {/* Advanced Tab */}
      {currentTab === 5 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="space-y-6">
            <SettingsSection
              title="Compliance & Audit"
              description="Configure compliance frameworks and audit logging"
              icon={<Security className="w-6 h-6 text-blue-600" />}
            >
              <div className="space-y-4">
                <FormControlLabel
                  control={
                    <Switch
                      checked={organizationSettings.compliance.auditLogs}
                      onChange={(e) => setOrganizationSettings(prev => ({
                        ...prev,
                        compliance: { ...prev.compliance, auditLogs: e.target.checked }
                      }))}
                    />
                  }
                  label="Enable audit logging"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={organizationSettings.compliance.encryption}
                      onChange={(e) => setOrganizationSettings(prev => ({
                        ...prev,
                        compliance: { ...prev.compliance, encryption: e.target.checked }
                      }))}
                    />
                  }
                  label="Enable encryption at rest"
                />
              </div>
            </SettingsSection>

            <SettingsSection
              title="Backup & Recovery"
              description="Configure backup and recovery settings"
              icon={<Backup className="w-6 h-6 text-blue-600" />}
            >
              <div className="space-y-4">
                <Button
                  variant="outlined"
                  startIcon={<Backup className="w-5 h-5" />}
                >
                  Create Backup
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Restore className="w-5 h-5" />}
                >
                  Restore from Backup
                </Button>
              </div>
            </SettingsSection>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedSettings;
