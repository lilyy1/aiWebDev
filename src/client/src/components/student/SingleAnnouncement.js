import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/student/SingleAnnouncement.css'; // Import the CSS file
import SideNavbar from '../SideNavbar'; // Import the SideNavbar component
import StudentSidebarData from './StudentSidebarData'; // Import sidebar data

const SingleAnnouncement = () => {
  const { announcementid } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await fetch(`/api/announcements/${announcementid}`);
        if (response.ok) {
          const data = await response.json();
          setAnnouncement(data);
        } else {
          throw new Error('Failed to fetch announcement');
        }
      } catch (error) {
        console.error('Error fetching announcement:', error);
        navigate('/announcementsstudentview');
      }
    };

    fetchAnnouncement();
  }, [announcementid, navigate]);

  if (!announcement) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="single-announcement-container">
      <SideNavbar data={StudentSidebarData} toggleSidebar={toggleSidebar} />
      <div className={`single-announcement-content ${isSidebarExpanded ? 'sidebar-expanded' : ''}`}>
        <div className="single-announcement-header">
          <h2>COSC 341 - Announcements</h2>
        </div>
        <div className="announcement-detail">
          <h1 className="announcement-title">{announcement.title}</h1>
          <p className="announcement-date">{new Date(announcement.dateposted).toLocaleString()}</p>
          <p className="announcement-content">{announcement.content}</p>
        </div>
        <button className="backbutton" onClick={() => navigate('/announcementsstudentview')}>Back</button>
      </div>
    </div>
  );
};

export default SingleAnnouncement;
