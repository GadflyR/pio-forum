import React from 'react';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import './LogoutButton.css'; // Import CSS file for styling

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error("Logout Error:", error.message);
      alert("Failed to logout. Please try again.");
    }
  };

  return (
    <button className="logout-button" onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;
