import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  alpha,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';

const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorations */}
      <Box
        sx={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(colors.primary, 0.15)} 0%, transparent 70%)`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(colors.secondary, 0.1)} 0%, transparent 70%)`,
        }}
      />

      <Container maxWidth="sm">
        <Box
          sx={{
            background: `linear-gradient(135deg, ${alpha(colors.bgCard, 0.8)} 0%, ${alpha(colors.bgSecondary, 0.6)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(colors.border, 0.3)}`,
            borderRadius: 4,
            p: { xs: 4, sm: 6 },
            boxShadow: `0 20px 60px ${alpha('#000', 0.4)}`,
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 32px ${alpha(colors.primary, 0.4)}`,
              }}
            >
              <FitnessCenterIcon sx={{ color: '#fff', fontSize: 40 }} />
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: `linear-gradient(135deg, ${colors.textPrimary} 0%, ${alpha(colors.textPrimary, 0.8)} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
            }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Sign in to continue to FitTrack
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                background: alpha(colors.error, 0.1),
                border: `1px solid ${alpha(colors.error, 0.3)}`,
                '& .MuiAlert-icon': {
                  color: colors.error,
                },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ position: 'relative', mb: 3 }}>
              <TextField
                fullWidth
                type="password"
                label="Password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                InputProps={{
                  startAdornment: (
                    <LockOutlinedIcon
                      sx={{
                        color: colors.textSecondary,
                        mr: 1,
                        fontSize: 20,
                      }}
                    />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: alpha(colors.bgSecondary, 0.5),
                  },
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !password}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                boxShadow: `0 8px 24px ${alpha(colors.primary, 0.4)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
                  boxShadow: `0 12px 32px ${alpha(colors.primary, 0.5)}`,
                },
                '&:disabled': {
                  background: alpha(colors.border, 0.3),
                  boxShadow: 'none',
                },
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Footer */}
          <Typography
            variant="caption"
            align="center"
            color="text.secondary"
            sx={{ display: 'block', mt: 4 }}
          >
            Your personal fitness dashboard
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
