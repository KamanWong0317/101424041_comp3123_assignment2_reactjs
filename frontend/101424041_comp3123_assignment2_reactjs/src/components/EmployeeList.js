import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { TextField, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';


function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [searchText, setSearchText] = useState(''); 
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

// londing employee list 
  useEffect(() => {
    fetchEmployees(); 
    }, [token]);
  
  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/v1/emp/employees', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    
      if (response.data && response.data.emp) {
        setEmployees(response.data.emp);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

//  button function
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDelete = async(id) =>{
    const confirmDelete = window.confirm('Are you sure you want to delete this employee?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:4000/api/v1/emp/employees`, {
          params: { eid: id },
          headers: {
          Authorization: `Bearer ${token}`,
          },
        });
        alert('Employee deleted successfully');

        setEmployees((prevEmployees) => prevEmployees.filter((emp) => emp._id !== id));
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Failed to delete employee');
      }
    }
  };

  const handleSearch = async () => {
    if (searchText.trim() === '') {
      fetchEmployees();
      return;
    }
    
    try {
      const response = await axios.get(`http://localhost:4000/api/v1/emp/employees/search/${searchText}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    
      if (response.data && response.data.employees) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error('Error searching employees:', error);
      alert('No employees found matching the criteria');
      setEmployees([]); 
    }
  };

  return (
    <div>
        <Button variant="contained" color="error" onClick={handleLogout}>Logout</Button>
        <div class="searchbar">
            <h3>Search Employees</h3>
                <TextField
                label="Search by Department or Position"
                variant="outlined"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                />
      <Button variant="contained" color="inherit" onClick={handleSearch}>
        Search
      </Button>
        </div>

        <div class="list" >
        <h1>Employee List</h1>
        <Button variant="contained" color="success" onClick={() => navigate('/add')}>Add Employee</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.length > 0 ? (
            employees.map((employee) => (
              <TableRow key={employee._id}>
                <TableCell>{employee._id}</TableCell>
                <TableCell>{employee.first_name} {employee.last_name}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => navigate(`/update/${employee._id}`)}>Update</Button>
                  <Button variant="contained" color="secondary" onClick={() => navigate(`/employee/${employee._id}`)}>View</Button>
                  <Button variant="contained" color="error" onClick={() => handleDelete(employee._id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">No employees found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
        </div>
    </div>
  );
}

export default EmployeeList;
