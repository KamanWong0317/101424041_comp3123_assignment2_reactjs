import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Typography, Button, Box, Paper } from '@mui/material';


function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/v1/emp/employees/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEmployee(response.data.emp);
      } catch (error) {
        console.error('Error fetching employee details:', error);
        alert('Failed to fetch employee details');
        navigate('/employees'); 
      }
    };
    fetchEmployee();
  }, [id, token, navigate]);

  if (!employee) {
    return <p>Loading employee details...</p>;
  }

  return (
    <Box sx={{ padding: 4 }}>
    <Typography variant="h4" gutterBottom>
      Employee Details
    </Typography>
    <Button
      variant="contained"
      color="error"
      onClick={() => navigate('/employees')}
      sx={{ marginBottom: 2 }}
    >
      Back to List
    </Button>
    <Paper elevation={3} sx={{ padding: 3 }}>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body1"><strong>First Name:</strong> {employee.first_name}</Typography>
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body1"><strong>Last Name:</strong> {employee.last_name}</Typography>
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body1"><strong>Email:</strong> {employee.email}</Typography>
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body1"><strong>Position:</strong> {employee.position}</Typography>
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body1"><strong>Salary:</strong> {employee.salary}</Typography>
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body1"><strong>Department:</strong> {employee.department}</Typography>
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body1"><strong>Date of Joining:</strong> {new Date(employee.date_of_joining).toLocaleDateString()}</Typography>
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body1"><strong>Last Updated:</strong> {new Date(employee.updated_at).toLocaleDateString()}</Typography>
      </Box>
    </Paper>
  </Box>
  );
}

export default EmployeeDetail;
