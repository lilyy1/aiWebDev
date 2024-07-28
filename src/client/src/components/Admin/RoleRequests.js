import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import AdminNavbar from './AdminNavbar'; 
import '../../css/Admin/RoleRequests.css'; 

const RoleRequests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/role-requests');
        const result = await response.json();
        if (response.ok) {
          setRequests(result);
        } else {
          setError(result.error || 'Failed to fetch requests');
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
        setError('Error fetching requests');
      }
    };

    fetchRequests();
  }, []);

  const handleUpdateRequest = async (requestId, status) => {
    try {
      const response = await fetch(`/api/role-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (response.ok) {
        setRequests((prevRequests) =>
          prevRequests
            .map((req) =>
              req.requestid === requestId ? { ...req, status } : req
            )
            .filter((req) => req.status !== 'Approved')
        );
      } else {
        setError(result.error || 'Failed to update request');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      setError('Error updating request');
    }
  };

  return (
    <div className="role-requests-container">
      <AdminNavbar /> {/* Include the AdminNavbar */}
      <div className="role-requests-content">
        <h2>Instructor Role Requests</h2>
        {error && <p className="error-message">{error}</p>}
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Request Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.requestid}>
                <td>{request.requestid}</td>
                <td>{request.user.firstname}</td>
                <td>{request.user.lastname}</td>
                <td>{new Date(request.requestdate).toLocaleString()}</td>
                <td>{request.status}</td>
                <td>
                  <Button
                    variant="success"
                    onClick={() => handleUpdateRequest(request.requestid, 'Approved')}
                    disabled={request.status !== 'Pending'}
                  >
                    <FaCheck />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleUpdateRequest(request.requestid, 'Rejected')}
                    disabled={request.status !== 'Pending'}
                  >
                    <FaTimes />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default RoleRequests; 