'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
  Button,
  Tooltip,
  Badge,
  Fade,
  Zoom,
  Slide,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Document,
  Search,
  Upload,
  Security,
  Assessment,
  People,
  Settings,
  Notifications,
  Refresh,
  MoreVert,
  ArrowForward,
  CheckCircle,
  Warning,
  Error,
  Info,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { useRBAC } from '../../core/rbac/context';
import { ProtectedComponent, FeatureGate } from '../../core/rbac/components';
import { cn } from '../../core/utils';

// Enhanced Stat Card Component
interface StatCardProps {
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
  permission?: string;
  feature?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  trend,
  onClick,
  loading = false,
  permission,
  feature,
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

  const cardContent = (
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
              <ArrowForward className="w-5 h-5 text-gray-400" />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  if (permission || feature) {
    return (
      <ProtectedComponent
        requiredPermissions={permission ? [permission] : []}
        requiredFeatures={feature ? [feature] : []}
        fallbackMessage={`${title} requires additional permissions`}
      >
        {cardContent}
      </ProtectedComponent>
    );
  }

  return cardContent;
};

// Recent Activity Component
interface ActivityItem {
  id: string;
  type: 'upload' | 'search' | 'share' | 'delete' | 'update';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'upload',
      title: 'New Document Uploaded',
      description: 'Policy_2024.pdf uploaded successfully',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      user: 'John Doe',
      status: 'success',
    },
    {
      id: '2',
      type: 'search',
      title: 'Search Performed',
      description: 'Searched for "compliance guidelines"',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      user: 'Jane Smith',
      status: 'info',
    },
    {
      id: '3',
      type: 'share',
      title: 'Document Shared',
      description: 'Risk_Assessment.xlsx shared with team',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      user: 'Mike Johnson',
      status: 'success',
    },
    {
      id: '4',
      type: 'update',
      title: 'Document Updated',
      description: 'Updated Security_Policy.docx',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      user: 'Sarah Wilson',
      status: 'warning',
    },
  ]);

  const getActivityIcon = (type: string) => {
    const icons = {
      upload: <Upload className="w-5 h-5" />,
      search: <Search className="w-5 h-5" />,
      share: <People className="w-5 h-5" />,
      delete: <Error className="w-5 h-5" />,
      update: <Settings className="w-5 h-5" />,
    };
    return icons[type] || <Document className="w-5 h-5" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      success: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      error: 'text-red-600 bg-red-100',
      info: 'text-blue-600 bg-blue-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
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

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Typography variant="h6" className="font-semibold text-gray-900">
            Recent Activity
          </Typography>
          <IconButton size="small">
            <Refresh className="w-5 h-5" />
          </IconButton>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={cn('p-2 rounded-full', getStatusColor(activity.status))}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Typography variant="body2" className="font-medium text-gray-900">
                      {activity.title}
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </Typography>
                  </div>
                  
                  <Typography variant="body2" className="text-gray-600 mt-1">
                    {activity.description}
                  </Typography>
                  
                  <Typography variant="caption" className="text-gray-500">
                    by {activity.user}
                  </Typography>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button
            variant="outlined"
            size="small"
            className="w-full"
            endIcon={<ArrowForward className="w-4 h-4" />}
          >
            View All Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Quick Actions Component
const QuickActions: React.FC = () => {
  const { t } = useLanguage();
  const { hasPermission, hasFeature } = useRBAC();

  const actions = [
    {
      id: 'upload',
      title: 'Upload Document',
      description: 'Upload new documents to the system',
      icon: <Upload className="w-6 h-6" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      permission: 'upload:files',
      feature: 'document_upload',
      href: '/upload',
    },
    {
      id: 'search',
      title: 'Search Documents',
      description: 'Find documents using AI-powered search',
      icon: <Search className="w-6 h-6" />,
      color: 'bg-green-500 hover:bg-green-600',
      permission: 'search:basic',
      feature: 'ai_search',
      href: '/search',
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Access detailed analytics and reports',
      icon: <Assessment className="w-6 h-6" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      permission: 'analytics:view',
      feature: 'advanced_analytics',
      href: '/analytics',
    },
    {
      id: 'compliance',
      title: 'Compliance Check',
      description: 'Run compliance assessments',
      icon: <Security className="w-6 h-6" />,
      color: 'bg-orange-500 hover:bg-orange-600',
      permission: 'compliance:view',
      feature: 'compliance_reports',
      href: '/compliance',
    },
  ];

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <Typography variant="h6" className="font-semibold text-gray-900 mb-6">
          Quick Actions
        </Typography>

        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const hasAccess = (!action.permission || hasPermission(action.permission)) &&
                            (!action.feature || hasFeature(action.feature));

            const actionButton = (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className={cn(
                    'w-full h-24 flex flex-col items-center justify-center space-y-2 text-white rounded-xl transition-all duration-200',
                    action.color,
                    !hasAccess && 'opacity-50 cursor-not-allowed'
                  )}
                  disabled={!hasAccess}
                  href={action.href}
                >
                  {action.icon}
                  <div className="text-center">
                    <Typography variant="body2" className="font-semibold">
                      {action.title}
                    </Typography>
                    <Typography variant="caption" className="opacity-90">
                      {action.description}
                    </Typography>
                  </div>
                </Button>
              </motion.div>
            );

            if (!hasAccess) {
              return (
                <ProtectedComponent
                  key={action.id}
                  requiredPermissions={action.permission ? [action.permission] : []}
                  requiredFeatures={action.feature ? [action.feature] : []}
                  fallbackMessage={`${action.title} requires additional permissions`}
                >
                  {actionButton}
                </ProtectedComponent>
              );
            }

            return actionButton;
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// System Status Component
const SystemStatus: React.FC = () => {
  const [status, setStatus] = useState({
    system: 'operational',
    database: 'operational',
    storage: 'operational',
    api: 'operational',
  });

  const getStatusColor = (status: string) => {
    const colors = {
      operational: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      error: 'text-red-600 bg-red-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      operational: <CheckCircle className="w-4 h-4" />,
      warning: <Warning className="w-4 h-4" />,
      error: <Error className="w-4 h-4" />,
    };
    return icons[status] || <Info className="w-4 h-4" />;
  };

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <Typography variant="h6" className="font-semibold text-gray-900 mb-6">
          System Status
        </Typography>

        <div className="space-y-4">
          {Object.entries(status).map(([service, serviceStatus]) => (
            <div key={service} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={cn('p-2 rounded-full', getStatusColor(serviceStatus))}>
                  {getStatusIcon(serviceStatus)}
                </div>
                <Typography variant="body2" className="font-medium text-gray-900 capitalize">
                  {service}
                </Typography>
              </div>
              <Chip
                label={serviceStatus}
                size="small"
                className={cn('capitalize', getStatusColor(serviceStatus))}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <Typography variant="caption" className="text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Enhanced Dashboard Component
const EnhancedDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalUsers: 0,
    storageUsed: 0,
    complianceScore: 0,
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setStats({
        totalDocuments: 1247,
        totalUsers: 89,
        storageUsed: 75,
        complianceScore: 92,
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <Typography variant="h4" className="font-bold text-gray-900">
            {t('dashboard.title')}
          </Typography>
          <Typography variant="body1" className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your documents.
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
            startIcon={<Notifications className="w-5 h-5" />}
          >
            Notifications
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Documents"
              value={stats.totalDocuments.toLocaleString()}
              change={{ value: 12, type: 'increase' }}
              icon={<Document className="w-8 h-8" />}
              color="primary"
              loading={loading}
              permission="documents:read"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Users"
              value={stats.totalUsers}
              change={{ value: 5, type: 'increase' }}
              icon={<People className="w-8 h-8" />}
              color="success"
              loading={loading}
              permission="users:view"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Storage Used"
              value={`${stats.storageUsed}%`}
              change={{ value: -2, type: 'decrease' }}
              icon={<Assessment className="w-8 h-8" />}
              color="warning"
              loading={loading}
              feature="advanced_analytics"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Compliance Score"
              value={`${stats.complianceScore}%`}
              change={{ value: 3, type: 'increase' }}
              icon={<Security className="w-8 h-8" />}
              color="info"
              loading={loading}
              feature="compliance_reports"
            />
          </Grid>
        </Grid>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <RecentActivity />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <div className="space-y-3">
              <QuickActions />
              <SystemStatus />
            </div>
          </Grid>
        </Grid>
      </motion.div>
    </div>
  );
};

export default EnhancedDashboard;
