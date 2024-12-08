import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to the Student Forum</h1>
      <p>A place to share your ideas, ask questions, and collaborate with fellow students.</p>

      <div style={{ marginTop: '20px' }}>
        <Link to="/login" style={{ marginRight: '15px', textDecoration: 'none' }}>
          <button style={{ padding: '10px 20px', fontSize: '16px' }}>Login</button>
        </Link>
        <Link to="/forum" style={{ textDecoration: 'none' }}>
          <button style={{ padding: '10px 20px', fontSize: '16px' }}>Enter Forum</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
