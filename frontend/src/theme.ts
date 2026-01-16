import { createTheme, alpha } from '@mui/material/styles';

// Modern fitness app color palette
const colors = {
  // Primary gradient colors
  primary: '#6366f1', // Indigo
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',

  // Accent colors
  accent: '#22c55e', // Green for success/progress
  accentLight: '#4ade80',

  // Secondary
  secondary: '#f472b6', // Pink

  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Dark backgrounds
  bgPrimary: '#0f0f23',
  bgSecondary: '#1a1a2e',
  bgCard: '#16213e',
  bgCardHover: '#1e2a4a',

  // Text
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',

  // Borders
  border: '#334155',
  borderLight: '#475569',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary,
      light: colors.primaryLight,
      dark: colors.primaryDark,
    },
    secondary: {
      main: colors.secondary,
    },
    success: {
      main: colors.success,
    },
    warning: {
      main: colors.warning,
    },
    error: {
      main: colors.error,
    },
    info: {
      main: colors.info,
    },
    background: {
      default: colors.bgPrimary,
      paper: colors.bgCard,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    divider: colors.border,
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: colors.textSecondary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `linear-gradient(135deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 100%)`,
          backgroundAttachment: 'fixed',
        },
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: colors.bgSecondary,
        },
        '::-webkit-scrollbar-thumb': {
          background: colors.border,
          borderRadius: '4px',
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: colors.borderLight,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${alpha(colors.bgCard, 0.8)} 0%, ${alpha(colors.bgSecondary, 0.6)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(colors.border, 0.3)}`,
          borderRadius: 20,
          boxShadow: `0 8px 32px ${alpha('#000', 0.3)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: alpha(colors.primary, 0.3),
            boxShadow: `0 12px 40px ${alpha('#000', 0.4)}, 0 0 0 1px ${alpha(colors.primary, 0.1)}`,
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: `linear-gradient(180deg, ${colors.bgSecondary} 0%, ${colors.bgPrimary} 100%)`,
          borderRight: `1px solid ${alpha(colors.border, 0.3)}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(90deg, ${alpha(colors.bgSecondary, 0.9)} 0%, ${alpha(colors.bgCard, 0.9)} 100%)`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(colors.border, 0.3)}`,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 500,
          transition: 'all 0.2s ease',
        },
        contained: {
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
          boxShadow: `0 4px 14px ${alpha(colors.primary, 0.4)}`,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
            boxShadow: `0 6px 20px ${alpha(colors.primary, 0.5)}`,
          },
        },
        outlined: {
          borderColor: alpha(colors.primary, 0.5),
          '&:hover': {
            borderColor: colors.primary,
            background: alpha(colors.primary, 0.1),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
        },
        filled: {
          background: alpha(colors.primary, 0.2),
          color: colors.primaryLight,
          '&:hover': {
            background: alpha(colors.primary, 0.3),
          },
        },
        outlined: {
          borderColor: alpha(colors.border, 0.5),
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          padding: '12px 16px',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            background: `linear-gradient(135deg, ${alpha(colors.primary, 0.2)} 0%, ${alpha(colors.primary, 0.1)} 100%)`,
            borderLeft: `3px solid ${colors.primary}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha(colors.primary, 0.25)} 0%, ${alpha(colors.primary, 0.15)} 100%)`,
            },
          },
          '&:hover': {
            background: alpha(colors.bgCardHover, 0.5),
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          background: alpha(colors.bgCard, 0.5),
          borderRadius: '16px !important',
          border: `1px solid ${alpha(colors.border, 0.3)}`,
          marginBottom: 12,
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: '0 0 12px 0',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          minHeight: '56px',
          '&.Mui-expanded': {
            minHeight: '56px',
          },
        },
        content: {
          '&.Mui-expanded': {
            margin: '12px 0',
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            color: colors.textSecondary,
            fontWeight: 600,
            borderBottom: `1px solid ${alpha(colors.border, 0.3)}`,
          },
          '& .MuiTableCell-body': {
            borderBottom: `1px solid ${alpha(colors.border, 0.2)}`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderColor: alpha(colors.border, 0.3),
            },
            '&:hover fieldset': {
              borderColor: alpha(colors.primary, 0.5),
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: `linear-gradient(135deg, ${colors.bgCard} 0%, ${colors.bgSecondary} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(colors.border, 0.3)}`,
          borderRadius: 24,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: colors.bgCard,
          border: `1px solid ${alpha(colors.border, 0.3)}`,
          borderRadius: 8,
          fontSize: '0.8rem',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: colors.primary,
        },
      },
    },
  },
});

export default theme;

// Export colors for use in components
export { colors };
