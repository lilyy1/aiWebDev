import React, { useState, useEffect } from 'react';
import '../../css/Admin/AdminDashboard.css';


const AdminDashboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const result = await response.json();
        if (response.ok) {
          setUsers(result);
        } else {
          console.error('Error fetching users:', result);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);
  
  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-content">
        <h2>Users</h2>
        <div className="buttons-container">
          <button className="add-btn">Add Account</button>
        </div>
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Section</th>
                <th>Email address</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>{`${user.firstname} ${user.lastname}`}</td>
                  <td>{user.enrollment ? user.enrollment.courseid : user.courseinstructors ? user.courseinstructors.courseid : 'N/A'}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;