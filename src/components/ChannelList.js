// src/components/ChannelList.js
import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Snackbar,
  Alert,
  Button,
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ChannelList = ({ channels, setActiveChannel, activeChannel, isAdmin }) => {
  const [newChannelName, setNewChannelName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Snackbar state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleAddChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) {
      setError('Channel name cannot be empty.');
      setSuccess('');
      setSnackbarMessage('Channel name cannot be empty.');
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      return;
    }

    try {
      // Prevent duplicate channel names
      const existingChannel = channels.find(
        (channel) => channel.name.toLowerCase() === newChannelName.trim().toLowerCase()
      );
      if (existingChannel) {
        setError('Channel name already exists.');
        setSuccess('');
        setSnackbarMessage('Channel name already exists.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        return;
      }

      // Add channel to Firestore
      await addDoc(collection(db, 'channels'), { name: newChannelName.trim() });
      setNewChannelName('');
      setError('');
      setSuccess('Channel added successfully!');
      setSnackbarMessage('Channel added successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      console.log('Channel added:', newChannelName.trim());
    } catch (error) {
      console.error('Error adding channel:', error);
      setError('Failed to add channel. Please try again.');
      setSuccess('');
      setSnackbarMessage('Failed to add channel.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleRenameChannel = async (channel) => {
    const newName = prompt('Enter the new name for the channel:', channel.name);
    if (newName && newName.trim() !== '') {
      try {
        const channelRef = doc(db, 'channels', channel.id);
        await updateDoc(channelRef, { name: newName.trim() });
        setSnackbarMessage(`Channel renamed to "${newName.trim()}"`);
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        console.log(`Channel renamed to: ${newName.trim()}`);
      } catch (error) {
        console.error('Error renaming channel:', error);
        setSnackbarMessage('Failed to rename channel.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } else {
      alert('Channel name cannot be empty.');
    }
  };

  const handleDeleteChannel = async (channel) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the channel "${channel.name}"? This action cannot be undone.`
    );
    if (confirmDelete) {
      try {
        const channelRef = doc(db, 'channels', channel.id);
        await deleteDoc(channelRef);
        console.log(`Channel deleted: ${channel.name}`);

        // Delete associated messages
        await deleteAssociatedMessages(channel.id);
        setSnackbarMessage(`Channel "${channel.name}" deleted successfully.`);
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      } catch (error) {
        console.error('Error deleting channel:', error);
        setSnackbarMessage('Failed to delete channel.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    }
  };

  const deleteAssociatedMessages = async (channelId) => {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, where('channelId', '==', channelId));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);

      querySnapshot.forEach((messageDoc) => {
        batch.delete(messageDoc.ref);
      });

      await batch.commit();
      console.log('Associated messages deleted.');
    } catch (error) {
      console.error('Error deleting associated messages:', error);
      setSnackbarMessage('Failed to delete associated messages.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setSnackbarMessage('');
  };

  return (
    <Box
      sx={{
        padding: 2,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        boxShadow: 3,
        height: '80vh',
        overflowY: 'auto',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Channels
      </Typography>
      <List>
        {channels.map((channel) => (
          <ListItem
            button
            key={channel.id}
            selected={activeChannel && activeChannel.id === channel.id}
            onClick={() => setActiveChannel(channel)}
            sx={{
              borderRadius: 1,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.main',
                },
              },
              '&:hover': {
                backgroundColor: 'grey.200',
              },
            }}
          >
            <ListItemText primary={`# ${channel.name}`} />
            {isAdmin && (
              <Box>
                <IconButton edge="end" aria-label="edit" size="small" onClick={() => handleRenameChannel(channel)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" size="small" onClick={() => handleDeleteChannel(channel)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </ListItem>
        ))}
      </List>

      {/* Add Channel Form - Visible Only to Admin */}
      {isAdmin && (
        <Box component="form" onSubmit={handleAddChannel} sx={{ mt: 2 }}>
          <TextField
            label="New Channel Name"
            variant="outlined"
            size="small"
            fullWidth
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 1 }}>
            Add Channel
          </Button>
        </Box>
      )}

      {/* Snackbar for Notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChannelList;
