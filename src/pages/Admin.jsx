import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import axios from 'axios';

const Dashboard = () => {
  const [healthStatus, setHealthStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetFeedback, setResetFeedback] = useState('');
  const [passFile, setPassFile] = useState(null);
  const [passesFeedback, setPassesFeedback] = useState('');

  const handleHealthCheck = async () => {
    try {
      setIsLoading(true);

      // Retrieve the token from sessionStorage
      const token = sessionStorage.getItem('authToken');

      // Check if the token exists
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      // Make the API call with the stored token
      const response = await axios.get('https://softeng24-26-446700.ue.r.appspot.com/api/admin/healthcheck', {
        headers: {
          'X-OBSERVATORY-AUTH': token, // Use the dynamically retrieved token
        },
      });

      // Ensure the response has data
      if (response.data && response.data.status) {
        const { status, n_stations, n_tags, n_passes } = response.data;

        if (status === 'OK') {
          setHealthStatus(
            `Healthy: Stations - ${n_stations}, Tags - ${n_tags}, Passes - ${n_passes}`
          );
        } else {
          setHealthStatus('Health check failed: Database issue detected.');
        }
      } else {
        // Handle unexpected response structure
        setHealthStatus('Unexpected response structure from health check API.');
      }
    } catch (error) {
      // Handle HTTP errors
      if (error.response) {
        // Specific error responses from backend
        if (error.response.status === 401) {
          setHealthStatus('Unauthorized: Invalid or missing auth key.');
        } else if (error.response.data && error.response.data.message) {
          setHealthStatus(`Error: ${error.response.data.message}`);
        } else {
          setHealthStatus('Unexpected error response from backend.');
        }
      } else if (error.request) {
        // No response received
        setHealthStatus('No response from server. Please check the network or backend.');
      } else {
        // Other errors
        setHealthStatus(`Unexpected error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetStations = async () => {
    try {
      setIsLoading(true);

      // Retrieve the token from sessionStorage
      const token = sessionStorage.getItem('authToken');

      // Check if the token exists
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      // Make the API call with the stored token
      const response = await axios.post(
        'https://softeng24-26-446700.ue.r.appspot.com/api/admin/resetstations',
        {}, // Send an empty object as the POST body
        {
          headers: {
            'X-OBSERVATORY-AUTH': token, // Use the dynamically retrieved token
          },
        }
      );

      // Check the response and update feedback
      if (response.data.status === "OK") {
        setResetFeedback('Stations reset successful.');
      } else if (response.data.status === "failed" && response.data.info) {
        setResetFeedback(`Error: ${response.data.info}`);
      } else {
        setResetFeedback('Unexpected response from the server.');
      }
    } catch (error) {
      // Handle errors
      if (error.response) {
        // Server responded with an error
        if (error.response.status === 401) {
          setResetFeedback('Unauthorized: Invalid or missing auth key.');
        } else {
          setResetFeedback(
            `Error: ${error.response.data.info || 'Unexpected server error.'}`
          );
        }
      } else if (error.request) {
        // No response from the server
        setResetFeedback('No response from the server. Please check your network or backend.');
      } else {
        // Other errors
        setResetFeedback(`Unexpected error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasses = async () => {
    try {
      setIsLoading(true);

      // Retrieve the token from sessionStorage
      const token = sessionStorage.getItem('authToken');

      // Check if the token exists
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      // Make the API call with the stored token
      const response = await axios.post(
        'https://softeng24-26-446700.ue.r.appspot.com/api/admin/resetpasses',
        {}, // Send an empty object as the POST body
        {
          headers: {
            'X-OBSERVATORY-AUTH': token, // Use the dynamically retrieved token
          },
        }
      );

      // Check the response and update feedback
      if (response.data.status === "OK") {
        setResetFeedback('Passes reset successful.');
      } else if (response.data.status === "failed" && response.data.info) {
        setResetFeedback(`Error: ${response.data.info}`);
      } else {
        setResetFeedback('Unexpected response from the server.');
      }
    } catch (error) {
      // Handle errors
      if (error.response) {
        // Server responded with an error
        if (error.response.status === 401) {
          setResetFeedback('Unauthorized: Invalid or missing auth key.');
        } else {
          setResetFeedback(
            `Error: ${error.response.data.info || 'Unexpected server error.'}`
          );
        }
      } else if (error.request) {
        // No response from the server
        setResetFeedback('No response from the server. Please check your network or backend.');
      } else {
        // Other errors
        setResetFeedback(`Unexpected error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPasses = async () => {
    if (!passFile) {
      setPassesFeedback('Please select a CSV file to upload.');
      return;
    }

    try {
      setIsLoading(true);

      const token = sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const formData = new FormData();
      formData.append('file', passFile);

      const response = await axios.post(
        'https://softeng24-26-446700.ue.r.appspot.com/api/admin/addpasses',
        formData,
        {
          headers: {
            'X-OBSERVATORY-AUTH': token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.status === 'OK') {
        setPassesFeedback('Passes added successfully!');
      } else {
        setPassesFeedback(`Error: ${response.data.info || 'Unexpected server error.'}`);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setPassesFeedback('Unauthorized: Invalid or missing auth key.');
        } else {
          setPassesFeedback(
            `Error: ${error.response.data.info || 'Unexpected server error.'}`
          );
        }
      } else if (error.request) {
        setPassesFeedback('No response from the server. Please check your network or backend.');
      } else {
        setPassesFeedback(`Unexpected error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Full-screen spinner */}
      <Backdrop open={isLoading} style={{ zIndex: 9999, color: '#fff' }}>
        <CircularProgress size={64} />
      </Backdrop>

      <Grid container spacing={2}>
        {/* System Health Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">System Health</Typography>
              <Typography variant="body2">Check database connectivity.</Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="primary"
                onClick={handleHealthCheck}
                disabled={isLoading}
              >
                Check Health
              </Button>
              {isLoading ? null : (
                <Alert
                  severity={healthStatus.startsWith('Healthy') ? 'success' : 'error'}
                  style={{ marginTop: '10px' }}
                >
                  {healthStatus || 'Not Checked'}
                </Alert>
              )}
            </CardActions>
          </Card>
        </Grid>

        {/* Data Reset Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Data Reset</Typography>
              <Typography variant="body2">
                Reset stations or passes from the database.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleResetStations}
                disabled={isLoading}
              >
                Reset Stations
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={handleResetPasses}
                disabled={isLoading}
              >
                Reset Passes
              </Button>
            </CardActions>
            {resetFeedback && (
              <Alert severity={resetFeedback.includes('Error') ? 'error' : 'success'}>
                {resetFeedback}
              </Alert>
            )}
          </Card>
        </Grid>

        {/* Add Passes Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Add Passes</Typography>
              <Typography variant="body2">Upload CSV to add new pass data.</Typography>
              <TextField
                label="CSV File"
                variant="outlined"
                fullWidth
                type="file"
                inputProps={{
                  style: {
                    textAlign: 'center', // Center the "Browse... No file selected" text
                  },
                }}
                onChange={(e) => setPassFile(e.target.files[0])}
              />
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddPasses}
                disabled={isLoading}
              >
                Upload
              </Button>
            </CardActions>
            {passesFeedback && (
              <Alert severity={passesFeedback.includes('Error') ? 'error' : 'success'}>
                {passesFeedback}
              </Alert>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
