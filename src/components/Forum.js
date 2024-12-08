// src/components/Forum.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, onSnapshot, addDoc, doc, deleteDoc, getDocs, writeBatch, where, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import ChannelList from './ChannelList';
import MessageBoard from './MessageBoard';
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

const Forum = ({ toggleTheme, mode, user, isAdmin }) => {
  const [activeChannel, setActiveChannel] = useState(null);
  const [channels, setChannels] = useState([]);
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
  }, [activeChannel, isAdmin]);

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
          {activeChannel ? (
            <MessageBoard activeChannel={activeChannel} user={user} />
          ) : (
            <Typography variant="h6" align="center" sx={{ mt: 4 }}>
              No channels available.
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Forum;
