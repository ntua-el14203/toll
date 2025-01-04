// src/components/AppBarComponent.jsx

import React from 'react';
import { AppBar, Toolbar, Button, Box, ButtonGroup } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AppBarComponent = ({ isLoggedIn, logout }) => {
  const navigate = useNavigate();
  const isAdmin = sessionStorage.getItem('OpID') === 'admin'; // Check if the logged-in user is admin

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem('authToken');

      if (!token) {
        alert('No authentication token found. Please log in.');
        return;
      }


      const response = await axios.post(
        'https://softeng24-26-446700.ue.r.appspot.com/api/logout',
        {},
        {
          headers: {
            'X-OBSERVATORY-AUTH': token,
          },
        }
      );

      if (response.status === 200) {
        alert('Successfully logged out.');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('OpID');
        sessionStorage.removeItem('username');
        logout(); // Call the logout function passed as a prop
        navigate('/');
      }
    } catch (err) {
      if (err.response) {
        alert(`Logout failed: ${err.response.data.message || 'Unknown error'}`);
      } else {
        alert('An error occurred. Please try again.');
      }
      console.error(err);
    }
    
  };

  const handleLoginRedirect = () => {
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo that redirects to the home page */}
        <Box
          component="img"
          src="logo.png"
          alt="Logo"
          sx={{ height: 80, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        />

        {/* Navigation Buttons */}
        <ButtonGroup variant="contained" color="primary" sx={{ display: 'flex' }}>
          <Button onClick={() => navigate('/')}>Home</Button>
          <Button onClick={() => navigate('/map')}>Map</Button>
          <Button onClick={() => navigate('/debts')}>Debts</Button>
          {isAdmin && <Button onClick={() => navigate('/admin')}>Admin</Button>}
        </ButtonGroup>

        {/* Login/Logout Button */}
        {isLoggedIn ? (
          <Button variant="outlined" color="secondary" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Button variant="outlined" color="primary" onClick={handleLoginRedirect}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
