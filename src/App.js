// src/App.js
import React, { useState, useEffect } from 'react';
import Forum from './components/Forum';
import Login from './components/Login';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ADMIN_UID } from './components/config/admin';

const App = ({ toggleTheme, mode }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAdmin(currentUser.uid === ADMIN_UID);

        // Check if user document exists in Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          // Create user document if it doesn't exist
          await setDoc(userDocRef, {
            displayName: currentUser.displayName || 'Anonymous',
            email: currentUser.email || '',
            bio: '',
            avatarUrl: currentUser.photoURL || '',
            isAnonymous: currentUser.isAnonymous,
          });
        } else {
          // Optionally, update displayName and photoURL in Firestore
          const userData = userDocSnap.data();
          if (
            userData.displayName !== currentUser.displayName ||
            userData.avatarUrl !== currentUser.photoURL ||
            userData.isAnonymous !== currentUser.isAnonymous
          ) {
            await updateProfile(currentUser, {
              displayName: userData.displayName || currentUser.displayName,
              photoURL: userData.avatarUrl || currentUser.photoURL,
            });
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    // Optional: Add a loading spinner or placeholder
    return <div>Loading...</div>;
  }

  return user ? (
    <Forum toggleTheme={toggleTheme} mode={mode} user={user} isAdmin={isAdmin} />
  ) : (
    <Login />
  );
};

export default App;
