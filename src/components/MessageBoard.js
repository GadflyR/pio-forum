// src/components/MessageBoard.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardHeader,
  Avatar,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';

const MessageBoard = ({ activeChannel, user }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Snackbar state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Real-time listener for messages in the active channel
  useEffect(() => {
    if (!activeChannel) {
      setMessages([]);
      setLoading(false);
      return;
    }

    console.log('Setting up message listener for channel:', activeChannel.name); // Debugging

    const qQuery = query(
      collection(db, 'messages'),
      where('channelId', '==', activeChannel.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      qQuery,
      (querySnapshot) => {
        const msgs = [];
        querySnapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() });
        });
        setMessages(msgs);
        setLoading(false);
        console.log('Fetched Messages:', msgs); // Debugging
      },
      (error) => {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages.');
        setLoading(false);
        setSnackbarMessage('Failed to load messages.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    );

    return () => unsubscribe();
  }, [activeChannel, db]);

  // Send new message to Firestore
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (messageInput.trim() === '') {
      setError('Message cannot be empty.');
      setSuccess('');
      setSnackbarMessage('Message cannot be empty.');
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      return;
    }

    if (!user) {
      setError('You must be logged in to send messages.');
      setSuccess('');
      setSnackbarMessage('You must be logged in to send messages.');
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      return;
    }

    if (!activeChannel) {
      setError('No active channel selected.');
      setSuccess('');
      setSnackbarMessage('No active channel selected.');
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      return;
    }

    console.log('Sending message to channel:', activeChannel.name); // Debugging

    try {
      await addDoc(collection(db, 'messages'), {
        text: messageInput.trim(),
        channelId: activeChannel.id,
        userId: user.uid,
        userName: user.displayName,
        userAvatar: user.photoURL || '',
        timestamp: serverTimestamp(),
      });
      setMessageInput('');
      setSuccess('Message sent successfully!');
      setError('');
      setSnackbarMessage('Message sent successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      console.log('Message sent:', messageInput);
    } catch (err) {
      console.error('Error adding message:', err);
      setError('Failed to send message. Please try again.');
      setSuccess('');
      setSnackbarMessage('Failed to send message.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setSnackbarMessage('');
  };

  return (
    <Box sx={{ maxWidth: '100%', bgcolor: 'background.paper', borderRadius: 1, boxShadow: 3, padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        {activeChannel ? `# ${activeChannel.name}` : 'Select a Channel'}
      </Typography>

      {/* Messages */}
      <Box sx={{ maxHeight: '60vh', overflowY: 'auto', mb: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Typography variant="body1">No messages in this channel.</Typography>
        ) : (
          messages.map((msg) => (
            <Card key={msg.id} sx={{ mb: 2 }}>
              <CardHeader
                avatar={
                  <Avatar
                    src={msg.userAvatar || '/default-avatar.png'}
                    alt={msg.userName}
                  >
                    {msg.userName ? msg.userName.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                }
                title={msg.userName || 'Anonymous'}
                subheader={msg.timestamp
                  ? new Date(msg.timestamp.seconds * 1000).toLocaleString()
                  : 'Just now'}
              />
              <CardContent>
                <Typography variant="body1">{msg.text}</Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Send Message Form */}
      {user && activeChannel && (
        <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Write a message..."
            variant="outlined"
            fullWidth
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary">
            Send
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

export default MessageBoard;
