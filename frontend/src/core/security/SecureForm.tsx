'use client';

// Secure Form Component
// Provides secure form handling with built-in security measures

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  AlertTitle,
  LinearProgress,
  Typography,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
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
  Lock,
  Visibility,
  VisibilityOff,
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
  Save,
  Cancel,
  Edit,
  Delete,
  Add,
  Remove,
  Check,
  Close,
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
  Tag as TagIcon,
  Language as LanguageIcon,
  Translate as TranslateIcon,
  SearchOff as SearchOffIcon,
  Search as SearchIcon2,
  Clear as ClearIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  CheckCircle as CheckCircleIcon2,
  Warning as WarningIcon2,
  Error as ErrorIcon2,
  Info as InfoIcon2,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clientSecurityManager, securityUtils } from './middleware';
import { securityManager, SecurityEventType } from './index';
import { cn } from '../utils';

// Form field types
export type FormFieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'slider'
  | 'rating'
  | 'autocomplete'
  | 'file'
  | 'date'
  | 'time'
  | 'datetime';

// Form field configuration
export interface FormFieldConfig {
  name: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  validation?: z.ZodSchema;
  options?: Array<{ value: any; label: string; disabled?: boolean }>;
  multiple?: boolean;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  accept?: string;
  maxSize?: number;
  security?: {
    sanitize?: boolean;
    encrypt?: boolean;
    mask?: boolean;
    audit?: boolean;
  };
  helpText?: string;
  errorText?: string;
}

// Form configuration
export interface SecureFormConfig {
  title?: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  showProgress?: boolean;
  showSecurity?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
  validation?: {
    mode: 'onChange' | 'onBlur' | 'onSubmit';
    reValidateMode: 'onChange' | 'onBlur' | 'onSubmit';
  };
  security?: {
    enableCSRF: boolean;
    enableRateLimit: boolean;
    enableInputValidation: boolean;
    enableAuditLogging: boolean;
  };
  styling?: {
    variant: 'outlined' | 'filled' | 'standard';
    size: 'small' | 'medium';
    fullWidth: boolean;
  };
}

// Form props
export interface SecureFormProps {
  fields: FormFieldConfig[];
  config?: SecureFormConfig;
  onSubmit: (data: any) => Promise<void> | void;
  onCancel?: () => void;
  onSave?: (data: any) => Promise<void> | void;
  initialData?: any;
  loading?: boolean;
  error?: string;
  success?: string;
  className?: string;
}

// Secure form component
export const SecureForm: React.FC<SecureFormProps> = ({
  fields,
  config = {},
  onSubmit,
  onCancel,
  onSave,
  initialData = {},
  loading = false,
  error,
  success,
  className,
}) => {
  // Default configuration
  const defaultConfig: SecureFormConfig = {
    title: 'Secure Form',
    description: 'Fill out the form below with secure validation',
    submitText: 'Submit',
    cancelText: 'Cancel',
    showProgress: true,
    showSecurity: true,
    autoSave: false,
    autoSaveInterval: 30000,
    validation: {
      mode: 'onChange',
      reValidateMode: 'onChange',
    },
    security: {
      enableCSRF: true,
      enableRateLimit: true,
      enableInputValidation: true,
      enableAuditLogging: true,
    },
    styling: {
      variant: 'outlined',
      size: 'medium',
      fullWidth: true,
    },
  };

  const finalConfig = { ...defaultConfig, ...config };
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [securityScore, setSecurityScore] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Create form schema from fields
  const createFormSchema = useCallback(() => {
    const schemaFields: Record<string, z.ZodSchema> = {};
    
    fields.forEach(field => {
      let fieldSchema: z.ZodSchema;
      
      switch (field.type) {
        case 'email':
          fieldSchema = z.string().email('Invalid email address');
          break;
        case 'password':
          fieldSchema = z.string().min(8, 'Password must be at least 8 characters');
          break;
        case 'number':
          fieldSchema = z.number().min(field.min || 0).max(field.max || Infinity);
          break;
        case 'tel':
          fieldSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number');
          break;
        case 'url':
          fieldSchema = z.string().url('Invalid URL');
          break;
        case 'textarea':
          fieldSchema = z.string().max(1000, 'Text too long');
          break;
        default:
          fieldSchema = z.string();
      }
      
      if (field.required) {
        fieldSchema = fieldSchema.nonempty('This field is required');
      } else {
        fieldSchema = fieldSchema.optional();
      }
      
      if (field.validation) {
        fieldSchema = field.validation;
      }
      
      schemaFields[field.name] = fieldSchema;
    });
    
    return z.object(schemaFields);
  }, [fields]);

  const formSchema = createFormSchema();

  // Initialize form
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: finalConfig.validation?.mode,
    reValidateMode: finalConfig.validation?.reValidateMode,
    defaultValues: initialData,
  });

  // Watch form values for auto-save
  const watchedValues = watch();

  // Auto-save functionality
  useEffect(() => {
    if (finalConfig.autoSave && isDirty) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setTimeout(async () => {
        if (onSave) {
          setAutoSaveStatus('saving');
          try {
            await onSave(getValues());
            setAutoSaveStatus('saved');
            setTimeout(() => setAutoSaveStatus('idle'), 2000);
          } catch (error) {
            setAutoSaveStatus('error');
            setTimeout(() => setAutoSaveStatus('idle'), 3000);
          }
        }
      }, finalConfig.autoSaveInterval);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [watchedValues, isDirty, finalConfig.autoSave, finalConfig.autoSaveInterval, onSave, getValues]);

  // Calculate security score
  useEffect(() => {
    let score = 0;
    const totalFields = fields.length;
    
    fields.forEach(field => {
      if (field.required) score += 1;
      if (field.validation) score += 1;
      if (field.security?.sanitize) score += 1;
      if (field.security?.encrypt) score += 1;
      if (field.security?.audit) score += 1;
    });
    
    setSecurityScore(Math.round((score / (totalFields * 5)) * 100));
  }, [fields]);

  // Handle form submission
  const handleFormSubmit = async (data: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmitProgress(0);
    
    try {
      // Security validation
      if (finalConfig.security?.enableInputValidation) {
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string') {
            const sanitized = clientSecurityManager.sanitizeInput(value);
            if (sanitized !== value) {
              throw new Error(`Invalid input detected in field: ${key}`);
            }
          }
        }
      }
      
      // Rate limiting check
      if (finalConfig.security?.enableRateLimit) {
        if (!clientSecurityManager.checkRateLimit()) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
      }
      
      // CSRF token check
      if (finalConfig.security?.enableCSRF) {
        const csrfToken = clientSecurityManager.getCSRFToken();
        if (!csrfToken) {
          throw new Error('Security token missing. Please refresh the page.');
        }
      }
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSubmitProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      
      // Submit form
      await onSubmit(data);
      
      setSubmitProgress(100);
      
      // Log successful submission
      if (finalConfig.security?.enableAuditLogging) {
        securityManager.logSecurityEvent(SecurityEventType.API_ABUSE, 'low', {
          action: 'form_submission',
          formTitle: finalConfig.title,
          fields: Object.keys(data),
        });
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Log security event
      if (finalConfig.security?.enableAuditLogging) {
        securityManager.logSecurityEvent(SecurityEventType.SUSPICIOUS_REQUEST, 'medium', {
          action: 'form_submission_failed',
          formTitle: finalConfig.title,
          error: error.message,
        });
      }
      
      throw error;
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };

  // Render form field
  const renderField = (field: FormFieldConfig) => {
    const hasError = !!errors[field.name];
    const errorMessage = errors[field.name]?.message || field.errorText;

    return (
      <Controller
        key={field.name}
        name={field.name}
        control={control}
        render={({ field: controllerField }) => (
          <Box className="mb-4">
            {field.type === 'text' && (
              <TextField
                {...controllerField}
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                disabled={field.disabled || loading}
                error={hasError}
                helperText={errorMessage || field.helpText}
                variant={finalConfig.styling?.variant}
                size={finalConfig.styling?.size}
                fullWidth={finalConfig.styling?.fullWidth}
                onChange={(e) => {
                  const value = field.security?.sanitize 
                    ? clientSecurityManager.sanitizeInput(e.target.value)
                    : e.target.value;
                  controllerField.onChange(value);
                }}
              />
            )}

            {field.type === 'email' && (
              <TextField
                {...controllerField}
                type="email"
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                disabled={field.disabled || loading}
                error={hasError}
                helperText={errorMessage || field.helpText}
                variant={finalConfig.styling?.variant}
                size={finalConfig.styling?.size}
                fullWidth={finalConfig.styling?.fullWidth}
                onChange={(e) => {
                  const value = field.security?.sanitize 
                    ? clientSecurityManager.sanitizeInput(e.target.value)
                    : e.target.value;
                  controllerField.onChange(value);
                }}
              />
            )}

            {field.type === 'password' && (
              <TextField
                {...controllerField}
                type="password"
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                disabled={field.disabled || loading}
                error={hasError}
                helperText={errorMessage || field.helpText}
                variant={finalConfig.styling?.variant}
                size={finalConfig.styling?.size}
                fullWidth={finalConfig.styling?.fullWidth}
                onChange={(e) => {
                  const value = field.security?.sanitize 
                    ? clientSecurityManager.sanitizeInput(e.target.value)
                    : e.target.value;
                  controllerField.onChange(value);
                }}
              />
            )}

            {field.type === 'textarea' && (
              <TextField
                {...controllerField}
                multiline
                rows={field.rows || 4}
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                disabled={field.disabled || loading}
                error={hasError}
                helperText={errorMessage || field.helpText}
                variant={finalConfig.styling?.variant}
                size={finalConfig.styling?.size}
                fullWidth={finalConfig.styling?.fullWidth}
                onChange={(e) => {
                  const value = field.security?.sanitize 
                    ? clientSecurityManager.sanitizeInput(e.target.value)
                    : e.target.value;
                  controllerField.onChange(value);
                }}
              />
            )}

            {field.type === 'select' && (
              <FormControl
                fullWidth={finalConfig.styling?.fullWidth}
                error={hasError}
                disabled={field.disabled || loading}
                size={finalConfig.styling?.size}
              >
                <InputLabel>{field.label}</InputLabel>
                <Select
                  {...controllerField}
                  label={field.label}
                  multiple={field.multiple}
                >
                  {field.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {(errorMessage || field.helpText) && (
                  <Typography variant="caption" color={hasError ? 'error' : 'textSecondary'}>
                    {errorMessage || field.helpText}
                  </Typography>
                )}
              </FormControl>
            )}

            {field.type === 'checkbox' && (
              <FormControlLabel
                control={
                  <Checkbox
                    {...controllerField}
                    checked={controllerField.value || false}
                    disabled={field.disabled || loading}
                  />
                }
                label={field.label}
              />
            )}

            {field.type === 'switch' && (
              <FormControlLabel
                control={
                  <Switch
                    {...controllerField}
                    checked={controllerField.value || false}
                    disabled={field.disabled || loading}
                  />
                }
                label={field.label}
              />
            )}

            {field.type === 'slider' && (
              <Box>
                <Typography gutterBottom>{field.label}</Typography>
                <Slider
                  {...controllerField}
                  value={controllerField.value || 0}
                  min={field.min || 0}
                  max={field.max || 100}
                  step={field.step || 1}
                  disabled={field.disabled || loading}
                  marks
                  valueLabelDisplay="auto"
                />
                {(errorMessage || field.helpText) && (
                  <Typography variant="caption" color={hasError ? 'error' : 'textSecondary'}>
                    {errorMessage || field.helpText}
                  </Typography>
                )}
              </Box>
            )}

            {field.type === 'rating' && (
              <Box>
                <Typography gutterBottom>{field.label}</Typography>
                <Rating
                  {...controllerField}
                  value={controllerField.value || 0}
                  max={field.max || 5}
                  disabled={field.disabled || loading}
                />
                {(errorMessage || field.helpText) && (
                  <Typography variant="caption" color={hasError ? 'error' : 'textSecondary'}>
                    {errorMessage || field.helpText}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      />
    );
  };

  return (
    <Paper className={cn('p-6', className)}>
      {/* Form Header */}
      <Box className="mb-6">
        <Typography variant="h5" className="font-semibold mb-2">
          {finalConfig.title}
        </Typography>
        {finalConfig.description && (
          <Typography variant="body2" className="text-gray-600 mb-4">
            {finalConfig.description}
          </Typography>
        )}
        
        {/* Security Score */}
        {finalConfig.showSecurity && (
          <Box className="flex items-center space-x-2 mb-4">
            <Security className="w-5 h-5 text-blue-600" />
            <Typography variant="body2" className="text-gray-600">
              Security Score:
            </Typography>
            <Chip
              label={`${securityScore}%`}
              size="small"
              color={securityScore >= 80 ? 'success' : securityScore >= 60 ? 'warning' : 'error'}
            />
          </Box>
        )}
        
        {/* Auto-save Status */}
        {finalConfig.autoSave && (
          <Box className="flex items-center space-x-2 mb-4">
            {autoSaveStatus === 'saving' && (
              <>
                <LinearProgress className="w-4 h-4" />
                <Typography variant="caption" className="text-gray-600">
                  Auto-saving...
                </Typography>
              </>
            )}
            {autoSaveStatus === 'saved' && (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <Typography variant="caption" className="text-green-600">
                  Auto-saved
                </Typography>
              </>
            )}
            {autoSaveStatus === 'error' && (
              <>
                <Error className="w-4 h-4 text-red-600" />
                <Typography variant="caption" className="text-red-600">
                  Auto-save failed
                </Typography>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Form Fields */}
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Box className="space-y-4">
          {fields.map(renderField)}
        </Box>

        {/* Submit Progress */}
        {finalConfig.showProgress && isSubmitting && (
          <Box className="mt-4">
            <LinearProgress variant="determinate" value={submitProgress} />
            <Typography variant="caption" className="text-gray-600 mt-1">
              Submitting... {submitProgress}%
            </Typography>
          </Box>
        )}

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert severity="error" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                {error}
              </Alert>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert severity="success" className="mt-4">
                <AlertTitle>Success</AlertTitle>
                {success}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Actions */}
        <Box className="flex justify-end space-x-3 mt-6">
          {onCancel && (
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={isSubmitting}
              startIcon={<Cancel className="w-5 h-5" />}
            >
              {finalConfig.cancelText}
            </Button>
          )}
          
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || isSubmitting || loading}
            startIcon={isSubmitting ? <LinearProgress className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          >
            {isSubmitting ? 'Submitting...' : finalConfig.submitText}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default SecureForm;
