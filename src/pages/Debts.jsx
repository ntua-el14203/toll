import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  Paper,
} from '@mui/material';
import axios from 'axios';

const DebtsPage = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [operatorID, setOperatorID] = useState('');
  const [data, setData] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const isAdmin = sessionStorage.getItem('OpID') === 'admin'; // Check if the user is an admin

  const handleLoadData = async () => {
    try {
      if (!dateFrom) {
        alert('Please select a "Date From".');
        return;
      }
      if (!dateTo) {
        alert('Please select a "Date To".');
        return;
      }
      if (isAdmin && !operatorID) {
        alert('Please provide an "Operator ID".');
        return;
      }

      const operator = isAdmin ? operatorID : sessionStorage.getItem('OpID');
      const formattedDateFrom = new Date(dateFrom).toISOString().slice(0, 10).replace(/-/g, '');
      const formattedDateTo = new Date(dateTo).toISOString().slice(0, 10).replace(/-/g, '');

      // Retrieve the token from sessionStorage
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const apiUrl = `https://softeng24-26-446700.ue.r.appspot.com/api/owedBy/${operator}/${formattedDateFrom}/${formattedDateTo}`;

      const response = await axios.get(apiUrl, {
        headers: {
          'X-OBSERVATORY-AUTH': token,
        },
      });

      if (response.status === 200) {
        const fetchedData = response.data.tOpList;

        const formattedData = fetchedData.map((entry, index) => ({
          id: index + 1,
          operator: entry.tollOpID,
          cost: entry.passesCost,
        }));

        setData(formattedData);

        const total = formattedData.reduce((acc, row) => acc + row.cost, 0);
        setTotalAmount(total);
      } else if (response.status === 204) {
        alert('No data found for the selected period.');
        setData([]);
        setTotalAmount(0);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('An error occurred while loading data. Please try again.');
    }
  };

  const handleSettleDebt = (debt) => {
    setSelectedDebt(debt);
    setConfirmOpen(true);
  };

  const handleConfirmSettlement = async () => {
    try {
      const operator = isAdmin ? operatorID : sessionStorage.getItem('OpID');
      const tollOperatorID = selectedDebt.operator;
      const formattedDateFrom = new Date(dateFrom).toISOString().slice(0, 10).replace(/-/g, '');
      const formattedDateTo = new Date(dateTo).toISOString().slice(0, 10).replace(/-/g, '');

      const token = sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const apiUrl = `https://softeng24-26-446700.ue.r.appspot.com/api/settleDebts/${operator}/${tollOperatorID}/${formattedDateFrom}/${formattedDateTo}`;

      const response = await axios.post(apiUrl, {}, {
        headers: {
          'X-OBSERVATORY-AUTH': token,
        },
      });

      if (response.status === 200) {
        alert('Debt successfully settled!');

        const updatedData = data.filter((d) => d.id !== selectedDebt.id);
        setData(updatedData);
        const updatedTotal = updatedData.reduce((acc, row) => acc + row.cost, 0);
        setTotalAmount(updatedTotal);

        setSelectedDebt(null);
        setConfirmOpen(false);
      } else if (response.status === 204) {
        alert('No debts were found to settle.');
        setConfirmOpen(false);
      }
    } catch (error) {
      console.error('Error settling debt:', error);
      alert('An error occurred while settling debt. Please try again.');
    }
  };

  const handleCloseDialog = () => {
    setConfirmOpen(false);
    setSelectedDebt(null);
  };

  return (
    <>
      <Container maxWidth="md">
        <Box mt={4} mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            Debts & Payments
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            View and settle toll debts.
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mt={2} mb={2} gap={2}>
          <TextField
            label="Date From"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Date To"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          {isAdmin && (
            <TextField
              label="Operator ID"
              value={operatorID}
              onChange={(e) => setOperatorID(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          )}
          <Button variant="contained" color="primary" onClick={handleLoadData}>
            Load Data
          </Button>
        </Box>

        <Paper elevation={3} sx={{ padding: '16px', backgroundColor: '#fff' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Operator
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Cost
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell align="center">{row.operator}</TableCell>
                    <TableCell align="center">€{row.cost.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleSettleDebt(row)}
                      >
                        Settle Debt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Typography sx={{  color: 'black', fontSize: '1.5rem' }}>Total: €{totalAmount.toFixed(2)}</Typography>
        </Box>

        <Dialog open={confirmOpen} onClose={handleCloseDialog}>
          <Box p={3}>
            <Typography variant="h6">Confirm Payment</Typography>
            <Typography>
              Pay €{selectedDebt ? selectedDebt.cost.toFixed(2) : 0} to{' '}
              {selectedDebt ? selectedDebt.operator : ''}?
            </Typography>
            <Box mt={2} display="flex" gap={1}>
              <Button onClick={handleConfirmSettlement} color="primary">
                Confirm
              </Button>
              <Button onClick={handleCloseDialog}>Cancel</Button>
            </Box>
          </Box>
        </Dialog>
      </Container>
    </>
  );
};

export default DebtsPage;
