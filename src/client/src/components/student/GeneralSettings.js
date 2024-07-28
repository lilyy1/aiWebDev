import React, { useState } from 'react';
import SideNavbar from '../SideNavbar';
import StudentSidebarData from './StudentSidebarData';
import { jwtDecode } from 'jwt-decode';
import '../../css/student/GeneralSettings.css';

function GeneralSettings() {
  const [isInstructor, setIsInstructor] = useState(false);
  const [requestStatus, setRequestStatus] = useState('');

  const handleCheckboxChange = () => {
    setIsInstructor(!isInstructor);
  };

  const handleSendRequest = async () => {
    if (isInstructor) {
      alert('Request sent to the administrator');
      try {
        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userid;

        const response = await fetch('/api/role-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userid: userId }),
        });

        if (response.status === 201) {
          setRequestStatus('Request submitted successfully');
        } else {
          setRequestStatus('Error submitting request');
        }
      } catch (error) {
        console.error('Error submitting role request:', error);
        setRequestStatus('Error submitting request');
      }
    }
  };

  return (
    <div className="general-settings-container">
      <SideNavbar data={StudentSidebarData} />
      <div className="general-settings-content">
        <h1>Settings</h1>
        <div className="settings-item">
          <label>
            <input
              type="checkbox"
              checked={isInstructor}
              onChange={handleCheckboxChange}
            />
            <h5> I am an Instructor </h5>
          </label>
        </div>
        <div className="settings-item">
          <button
            className="send-request-btn"
            onClick={handleSendRequest}
            disabled={!isInstructor}
          >
            Send Request
          </button>
        </div>
        {requestStatus && <p>{requestStatus}</p>}
      </div>
    </div>
  );
}

export default GeneralSettings;
