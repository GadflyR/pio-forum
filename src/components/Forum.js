// src/components/Forum.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
  deleteDoc,
  getDocs,
  writeBatch,
  where,
  updateDoc,
} from 'firebase/firestore';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Box,
  CircularProgress,
  IconButton,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ChannelList from './ChannelList';
import MessageBoard from './MessageBoard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GoogleIcon from '@mui/icons-material/Google';

const Forum = ({ toggleTheme, mode, user, isAdmin }) => {
  const [activeChannel, setActiveChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(true);

  // State for Profile Menu (Optional)
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Fetching channels from Firestore with real-time updates
  useEffect(() => {
    if (!user) return; // Ensure user is authenticated

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
  }, [user, activeChannel, isAdmin]);

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
          {/* User Information */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Tooltip title={user.isAnonymous ? 'Anonymous User' : 'Signed in with Google'}>
                {user.isAnonymous ? (
                  <AccountCircleIcon fontSize="large" />
                ) : user.photoURL ? (
                  <Avatar
                    alt={user.displayName}
                    src={user.photoURL}
                    onClick={handleMenuOpen}
                    sx={{ cursor: 'pointer' }}
                  />
                ) : (
                  <Avatar onClick={handleMenuOpen} sx={{ cursor: 'pointer' }}>
                    {user.displayName.charAt(0)}
                  </Avatar>
                )}
              </Tooltip>
              <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1">
                  {user.isAnonymous ? 'Anonymous User' : user.displayName}
                </Typography>
                {/* Add Google Icon if signed in via Google */}
                {!user.isAnonymous && (
                  <GoogleIcon fontSize="small" color="primary" sx={{ ml: 0.5 }} />
                )}
              </Box>
              {/* Profile Menu (Optional) */}
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                {/* Add more menu items as needed */}
              </Menu>
            </Box>
          )}
          {/* Logout Button */}
          {user && (
            <Button color="inherit" onClick={handleLogout} sx={{ ml: 2 }}>
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
