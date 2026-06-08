import { createTheme } from '@mui/material/styles';

// Create MUI theme with AgriSmart branding - integrated with Tailwind colors
const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Lightened Forest Green
      light: '#dcfce7', // Lighter container
      dark: '#1b5e20', // Dark contrast
      contrastText: '#fff',
    },
    secondary: {
      main: '#16a34a', // Brighter Leaf Green
      light: '#bbf7d0', // Lighter container
      dark: '#14532d', // Dark contrast
      contrastText: '#fff',
    },
    success: {
      main: '#2e7d32',
      light: '#dcfce7',
      dark: '#1b5e20',
    },
    warning: {
      main: '#45300d', // Stitch tertiary
      light: '#ffddb1',
      dark: '#5a431f',
    },
    error: {
      main: '#ba1a1a', // Stitch error
      light: '#ffdad6',
      dark: '#93000a',
    },
    info: {
      main: '#436746', // Stitch surface-tint
      light: '#c4edc3',
      dark: '#2b4e30',
    },
    background: {
      default: '#f9f9f9', // Stitch background / surface
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1c1c', // Stitch on-surface
      secondary: '#424841', // Stitch on-surface-variant
    },
  },
  typography: {
    fontFamily: '"Inter", "system-ui", "sans-serif"',
    h1: {
      fontSize: '32px',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8, // Stitch ROUND_EIGHT / DEFAULT shape
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: '0.95rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: '#10b981',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#10b981',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

export default muiTheme;
