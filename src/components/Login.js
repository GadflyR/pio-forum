// src/components/Login.js
import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between login and register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const googleProvider = new GoogleAuthProvider();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSnackbarMessage('Logged in successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.message);
      setSnackbarMessage('Failed to log in.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSnackbarMessage('Registered and logged in successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Registration Error:', err);
      setError(err.message);
      setSnackbarMessage('Failed to register.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      setSnackbarMessage('Logged in with Google!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError(err.message);
      setSnackbarMessage('Failed to sign in with Google.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setSnackbarMessage('');
  };

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
      <Grid item xs={10} sm={6} md={4}>
        <Box
          sx={{
            padding: 4,
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="h5" gutterBottom align="center">
            {isRegistering ? 'Register' : 'Login'}
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <Box component="form" onSubmit={isRegistering ? handleRegister : handleLogin} sx={{ mt: 2 }}>
            <TextField
              label="Email"
              variant="outlined"
              type="email"
              fullWidth
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              fullWidth
              required
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              {isRegistering ? 'Register' : 'Login'}
            </Button>
          </Box>
          <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleGoogleSignIn}
          >
            Sign in with Google
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Button variant="text" onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? 'Login' : 'Register'}
            </Button>
          </Typography>
        </Box>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Grid>
    </Grid>
  );
};

export default Login;
