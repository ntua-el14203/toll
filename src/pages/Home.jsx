import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MapIcon from '@mui/icons-material/Map';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DashboardIcon from '@mui/icons-material/Dashboard';
import axios from 'axios';

const HomePage = ({ isLoggedIn, login }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchOperatorByUsername = async (username) => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await axios.get(`https://softeng24-26-446700.ue.r.appspot.com/api/operatorID/${username}`, {
        headers: {
          'X-OBSERVATORY-AUTH': token,
        },
      });
      const { OpID } = response.data;

      sessionStorage.setItem('OpID', OpID);
      console.log('OpID fetched and saved:', OpID);
    } catch (error) {
      console.error('Error fetching OpID:', error);
      setError('Failed to fetch operator details.');
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const loginData = {
      username,
      password,
    };

    try {
      const response = await axios.post(
        'https://softeng24-26-446700.ue.r.appspot.com/api/login',
        new URLSearchParams(loginData),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      if (response.status === 200) {
        setLoading(false);

        // Save token and username in sessionStorage
        const { token } = response.data;
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('username', username);

        // Fetch OpID and save it to sessionStorage
        await fetchOperatorByUsername(username);

        login(); // Call the login function passed via props
      }
    } catch (err) {
      setLoading(false);

      if (err.response) {
        setError(err.response.data.message || 'Invalid credentials');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  const handleCardClick = (path) => {
    if (!isLoggedIn) {
      setError('Please log in to access this page.');
      return;
    }
    navigate(path);
  };

  return (
    <>
      <Container sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ color: 'black' }}>
          Streamlined Toll Operations & Analytics
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ color: 'gray' }}>
          View, settle, and analyze toll data from various perspectives.
        </Typography>
      </Container>

      <Grid container spacing={4} sx={{ padding: '0 16px' }}>
        <Grid item xs={12} md={5}>
          {!isLoggedIn ? (
            <Card sx={{ padding: 2, maxWidth: 400, margin: '0 auto' }}>
              <Typography variant="h5" align="center" sx={{ marginBottom: 2 }}>
                Login
              </Typography>

              {error && (
                <Alert severity="error" sx={{ marginBottom: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleLogin}>
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{ marginBottom: 2 }}
                />
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ marginBottom: 2 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  color="primary"
                  disabled={loading}
                  sx={{ marginBottom: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Login'}
                </Button>
              </form>
            </Card>
          ) : (
            <Container sx={{ py: 4 }}>
              <Typography
                variant="h5"
                align="center"
                sx={{ marginBottom: 2, color: 'black', fontSize: '1.5rem' }}
              >
                Welcome!
              </Typography>
              <Typography variant="body1" align="center" sx={{ color: 'black' }}>
                You have successfully logged in!
              </Typography>
            </Container>
          )}
        </Grid>

        <Grid item xs={12} md={7}>
          <Container sx={{ py: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper
                  sx={{
                    padding: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: 300,
                    margin: '0 auto',
                  }}
                  onClick={() => handleCardClick('/map')}
                >
                  <MapIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: 'black' }}>
                    Map
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ color: 'gray' }}>
                    Visualize toll data on a map, and explore regions and toll roads.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper
                  sx={{
                    padding: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: 300,
                    margin: '0 auto',
                  }}
                  onClick={() => handleCardClick('/debts')}
                >
                  <AttachMoneyIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: 'black' }}>
                    Debts
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ color: 'gray' }}>
                    View and settle outstanding debts related to toll usage.
                  </Typography>
                </Paper>
              </Grid>

              {/* Admin Card - Only visible if the OpID is 'admin' */}
              {sessionStorage.getItem('OpID') === 'admin' && (
                <Grid item xs={12} sm={6}>
                  <Paper
                    sx={{
                      padding: 2,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      maxWidth: 300,
                      margin: '0 auto',
                    }}
                    onClick={() => handleCardClick('/admin')}
                  >
                    <DashboardIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'black' }}>
                      Admin Dashboard
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ color: 'gray' }}>
                      Manage the system, users, and settings.
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Container>
        </Grid>
      </Grid>
    </>
  );
};

export default HomePage;
