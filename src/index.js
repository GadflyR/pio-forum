// src/index.js
import React, { useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client'; // Ensure React 18+
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const Root = () => {
  const [mode, setMode] = useState('light'); // 'light' or 'dark'

  // Load saved theme preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('preferredTheme');
    if (savedMode === 'light' || savedMode === 'dark') {
      setMode(savedMode);
    }
  }, []);

  // Create a custom theme based on the current mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976d2', // Simple Blue
          },
          secondary: {
            main: '#9e9e9e', // Simple Grey
          },
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
          error: {
            main: '#f44336', // Red
          },
          success: {
            main: '#4caf50', // Green
          },
          info: {
            main: '#2196f3', // Blue
          },
          warning: {
            main: '#ff9800', // Orange
          },
        },
        typography: {
          fontFamily: 'Roboto, sans-serif',
          h6: {
            fontWeight: 600,
          },
          // Customize other typography variants as needed
        },
      }),
    [mode]
  );

  // Function to toggle between light and dark modes
  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('preferredTheme', newMode); // Persist preference
      return newMode;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalize CSS across browsers */}
      <App toggleTheme={toggleTheme} mode={mode} />
    </ThemeProvider>
  );
};

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
