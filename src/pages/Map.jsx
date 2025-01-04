import React, { useState } from 'react';
import axios from 'axios';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Icons for owned and external tolls
const ownedTollIcon = new Icon({
  iconUrl: '/assets/mytollMarker.png', // Replace with actual path
  iconSize: [33, 60],
});

const externalTollIcon = new Icon({
  iconUrl: '/assets/otherMarker.png', // Replace with actual path
  iconSize: [33, 60],
});

const InteractiveMapPage = () => {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    operator: sessionStorage.getItem('OpID'),
  });

  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true); // Controls the accordion expansion state
  const isAdmin = sessionStorage.getItem('OpID') === 'admin'; // Check if the logged-in user is admin
  const username=sessionStorage.getItem('username');

  const handleApplyFilters = async () => {
    const { fromDate, toDate, operator } = filters;

    // Validation for missing fields
    if (!fromDate) {
      alert('Please select a "From Date".');
      return;
    }
    if (!toDate) {
      alert('Please select a "To Date".');
      return;
    }
    if (!operator) {
      alert('Please provide an "Operator ID".');
      return;
    }
    setLoading(true);

    try {
      const formattedDateFrom = new Date(fromDate).toISOString().slice(0, 10).replace(/-/g, '');
      const formattedDateTo = new Date(toDate).toISOString().slice(0, 10).replace(/-/g, '');

      // Retrieve the token from sessionStorage
      const token = sessionStorage.getItem('authToken');

      // Check if the token exists
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const apiUrl = `https://softeng24-26-446700.ue.r.appspot.com/api/operatorPassSummary/${operator}/${formattedDateFrom}/${formattedDateTo}`;


      const response = await axios.get(apiUrl, {
        headers: {
          'X-OBSERVATORY-AUTH': token, // Use the dynamically retrieved token
        },
      });

      const data = response.data;


      if (data.tollStations) {
        // Parse response to map stations
        const mappedStations = data.tollStations.map((station, index) => ({
          id: index,
          name: station.stationName,
          position: { lat: station.lat, lng: station.long },
          isOwned: station.stationOperator === operator,
          details: 
            
            station.stationOperator === username ?  
            `
            <strong>${station.stationName}</strong><br/>
            Operator: ${station.stationOperator}<br/>
            🛵: €${station.Price1.toFixed(2)}<br/>
            🚗: €${station.Price2.toFixed(2)}<br/>
            🚐: €${station.Price3.toFixed(2)}<br/>
            🚚: €${station.Price4.toFixed(2)}<br/>
            Passes: ${station.nPasses}<br/>
            Total Charges: €${station.totalPassCharge.toFixed(2)}<br/>
          `            
          :`
            <strong>${station.stationName}</strong><br/>
            Operator: ${station.stationOperator}<br/>
            🛵: €${station.Price1.toFixed(2)}<br/>
            🚗: €${station.Price2.toFixed(2)}<br/>
            🚐: €${station.Price3.toFixed(2)}<br/>
            🚚: €${station.Price4.toFixed(2)}<br/>
            Passes by ${username} tags: ${station.nPasses}<br/>
            Total Charges: €${station.totalPassCharge.toFixed(2)}<br/>
          `,
          icon: station.stationOperator === username ? ownedTollIcon : externalTollIcon,
        }));

        setStations(mappedStations);
      } else {
        alert('No data available for the selected filters.');
        setStations([]);
      }
    } catch (error) {
      console.error(error);
      alert('Error loading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Collapsible Filters Accordion */}
      <Accordion
        expanded={expanded}
        sx={{
          width: expanded ? 300 : 50,
          flexShrink: 0,
          marginRight: 2,
          transition: 'width 0.3s',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded && <Typography variant="h6">Filters</Typography>}
        </AccordionSummary>
        {expanded && (
          <AccordionDetails>
            <TextField
              label="From Date"
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              fullWidth
              sx={{ marginBottom: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="To Date"
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              fullWidth
              sx={{ marginBottom: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            {isAdmin && (
              <TextField
                label="Operator ID"
                value={filters.operator}
                onChange={(e) => setFilters({ ...filters, operator: e.target.value })}
                fullWidth
                sx={{ marginBottom: 2 }}
              />
            )}
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load Data'}
            </Button>
          </AccordionDetails>
        )}
      </Accordion>

      {/* Map Container */}
      <Box sx={{ flexGrow: 1, height: '100%' }}>
        <MapContainer
          center={[37.9838, 23.7275]} // Athens, Greece
          zoom={10}
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">
              OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Displaying Markers Without Clustering */}
          {stations.map((station) => (
            <Marker
              key={station.id}
              position={station.position}
              icon={station.icon}
              eventHandlers={{
                mouseover: (e) => {
                  e.target.openPopup(); // Open popup on hover
                },
                mouseout: (e) => {
                  e.target.closePopup(); // Close popup when no longer hovering
                },
              }}
            >
              <Popup>
                <div dangerouslySetInnerHTML={{ __html: station.details }} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default InteractiveMapPage;
