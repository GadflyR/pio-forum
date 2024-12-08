import React from 'react';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/forum'); // Redirect to the forum after successful login
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
      alert("Failed to login. Please try again.");
    }
    const user = auth.currentUser;
    console.log('User Info:', user);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Login</h2>
      <button onClick={handleGoogleLogin} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
