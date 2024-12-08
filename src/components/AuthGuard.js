import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import { Navigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    console.error("Error with Firebase Authentication:", error);
    return <p>Error: {error.message}</p>;
  }

  return user ? children : <Navigate to="/login" />;
};

export default AuthGuard;
