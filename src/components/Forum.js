// src/components/Forum.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import ChannelList from './ChannelList';
import MessageBoard from './MessageBoard';
import { ADMIN_UID } from './config/admin';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Box,
  CircularProgress,
  IconButton,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Forum = ({ toggleTheme, mode }) => {
  const [activeChannel, setActiveChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(true);

  // Fetching channels from Firestore with real-time updates
  useEffect(() => {
    const channelsCollection = collection(db, 'channels');
    const q = query(channelsCollection);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const channelsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChannels(channelsData);
        console.log('Fetched Channels:', channelsData);
        if (channelsData.length > 0 && !activeChannel) {
          setActiveChannel({ id: channelsData[0].id, name: channelsData[0].name });
          console.log('Default Channel Set to:', channelsData[0].name);
        } else if (channelsData.length === 0 && isAdmin) {
          // Automatically create a default channel for admin if none exist
          addDoc(channelsCollection, { name: 'General' })
            .then((docRef) => {
              console.log('Default channel created with ID:', docRef.id);
            })
            .catch((error) => {
              console.error('Error creating default channel:', error);
            });
        }
        setLoadingChannels(false);
      },
      (error) => {
        console.error('Error fetching channels:', error);
        setLoadingChannels(false);
      }
    );

    return () => unsubscribe();
  }, [db, activeChannel, isAdmin]);

  // Check user authentication and admin status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log('Authenticated User:', currentUser);
        setIsAdmin(currentUser.uid === ADMIN_UID);
        console.log('Is Admin:', currentUser.uid === ADMIN_UID);
      } else {
        setUser(null);
        setIsAdmin(false);
        console.log('User logged out.');
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Forum Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pioexplore Forum
          </Typography>
          {/* Theme Toggle Button */}
          <IconButton color="inherit" onClick={toggleTheme}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          {/* Logout Button */}
          {user && (
            <Button color="inherit" onClick={handleLogout}>
              Log Out
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Forum Body */}
      <Grid container spacing={2} sx={{ padding: 2 }}>
        {/* Channel List */}
        <Grid item xs={12} md={3}>
          {loadingChannels ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ChannelList
              channels={channels}
              setActiveChannel={setActiveChannel}
              activeChannel={activeChannel}
              isAdmin={isAdmin}
            />
          )}
        </Grid>

        {/* Message Board */}
        <Grid item xs={12} md={9}>
          <MessageBoard activeChannel={activeChannel} user={user} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Forum;
