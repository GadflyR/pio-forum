// src/App.js
import React from 'react';
import Forum from './components/Forum';

const App = ({ toggleTheme, mode }) => {
  return <Forum toggleTheme={toggleTheme} mode={mode} />;
};

export default App;
