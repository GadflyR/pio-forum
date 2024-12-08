import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Forum.css';

const Forum = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();

  // Fetch messages in real-time
  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const user = auth.currentUser;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        createdBy: user.displayName || 'Anonymous',
        photoURL: user.photoURL || '',
        timestamp: new Date(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await auth.signOut(); // Sign out the user
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h1 className="forum-title">Welcome to the Forum</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>

      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className="message-card">
            <div className="message-header">
            <img
              src={message.photoURL || '/default-avatar.png'} // Fallback to default avatar
              alt="User Avatar"
              className="message-avatar"
              onError={(e) => (e.target.src = '/default-avatar.png')} // Handle broken image URLs
            />
              <strong className="message-author">{message.createdBy}</strong>
            </div>
            <p className="message-text">{message.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forum;
