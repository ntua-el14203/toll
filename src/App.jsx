import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

import Home from './pages/Home.jsx';
import InteractiveMapPage from './pages/Map.jsx';
import Debts from './pages/Debts.jsx';
import Admin from './pages/Admin.jsx';
import AppBarComponent from './components/AppBarComponent';
import FooterComponent from './components/FooterComponent';

function App() {
  // State to manage login status
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem('authToken'));

  // Function to handle login
  const login = () => {
    setIsLoggedIn(true);
  };

  // Function to handle logout
  const logout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="App"> {/* This div now takes the full width and height */}
      
      <AppBarComponent isLoggedIn={isLoggedIn} logout={logout} /> {/* Fixed header component */}
      
      <main> {/* Main content area that takes up remaining space */}
        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} login={login} />} />
          <Route path="/map" element={<InteractiveMapPage />} />
          <Route path="/debts" element={<Debts />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      
      <FooterComponent /> {/* Fixed footer component */}
    </div>
  );
}

export default App;
