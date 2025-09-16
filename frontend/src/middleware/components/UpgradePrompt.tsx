'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Typography, Box } from '@mui/material';
import { Upgrade, Star, Security, Speed } from '@mui/icons-material';

interface UpgradePromptProps {
  requiredTier?: string;
  requiredFeature?: string;
  onUpgrade?: () => void;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  requiredTier,
  requiredFeature,
  onUpgrade,
}) => {
  const getUpgradeMessage = () => {
    if (requiredFeature) {
      return `This feature requires ${requiredFeature} which is not available in your current plan.`;
    }
    
    if (requiredTier) {
      return `This feature requires a ${requiredTier} subscription or higher.`;
    }
    
    return 'This feature is not available in your current plan.';
  };
  
  const getUpgradeBenefits = () => {
    if (requiredTier === 'pro') {
      return [
        'Advanced analytics and reporting',
        'Priority support',
        'Custom branding',
        'SSO integration',
        'Unlimited storage',
      ];
    }
    
    if (requiredTier === 'standard') {
      return [
        'Advanced search capabilities',
        'API access',
        'Audit logs',
        'Bulk operations',
        'Workflow automation',
      ];
    }
    
    return [
      'More storage space',
      'Advanced features',
      'Priority support',
      'Custom integrations',
    ];
  };
  
  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 2 }}>
      <CardHeader>
        <CardTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Upgrade color="primary" />
          Upgrade Required
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {getUpgradeMessage()}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Upgrade benefits:
          </Typography>
          {getUpgradeBenefits().map((benefit, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Star color="primary" sx={{ fontSize: 16 }} />
              <Typography variant="body2">{benefit}</Typography>
            </Box>
          ))}
        </Box>
        
        <Button
          variant="contained"
          fullWidth
          onClick={onUpgrade}
          sx={{ mb: 2 }}
        >
          Upgrade Now
        </Button>
        
        <Typography variant="caption" color="text.secondary">
          Contact your administrator to upgrade your subscription.
        </Typography>
      </CardContent>
    </Card>
  );
};
