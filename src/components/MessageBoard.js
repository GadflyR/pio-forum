// src/components/MessageBoard.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';

const MessageBoard = ({ activeChannel, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    if (!activeChannel) return;

    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('channelId', '==', activeChannel.id), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);
        setLoadingMessages(false);
      },
      (error) => {
        console.error('Error fetching messages:', error);
        setLoadingMessages(false);
      }
    );

    return () => unsubscribe();
  }, [activeChannel]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        channelId: activeChannel.id,
        text: newMessage.trim(),
        userId: user.uid,
        displayName: user.isAnonymous ? 'Anonymous' : (user.displayName || 'Anonymous'),
        createdAt: Timestamp.now(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loadingMessages) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
      <Typography variant="h6" gutterBottom>
        {activeChannel.name}
      </Typography>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', paddingRight: 2 }}>
        <List>
          {messages.map((message) => (
            <ListItem key={message.id} alignItems="flex-start">
              <ListItemText
                primary={
                  <Typography variant="subtitle2" color="text.primary">
                    {message.displayName}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {new Date(message.createdAt?.toDate()).toLocaleString()}
                    </Typography>
                    {' — '}
                    {message.text}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ display: 'flex', mt: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Type your message..."
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default MessageBoard;
