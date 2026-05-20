import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import { BackButton } from './BackButton';

interface FormPageLayoutProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

export const FormPageLayout = ({
  title,
  subtitle,
  backTo,
  backLabel = "Volver",
  children,
  maxWidth = 'md'
}: FormPageLayoutProps) => {
  return (
    <Container maxWidth={maxWidth} sx={{ animation: 'fadeIn 0.5s ease-in-out', py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <BackButton to={backTo} label={backLabel} variant="dual" />
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: '-0.05em',
            mt: 1,
            mb: 0.5
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: 3, 
          border: '1px solid', 
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        {children}
      </Paper>
    </Container>
  );
};
