import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Forum from './components/Forum';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/forum"
          element={
            <AuthGuard>
              <Forum />
            </AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
