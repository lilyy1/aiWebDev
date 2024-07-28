import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/teacher/SingleAnnouncementTeacher.css'; // Import the CSS file
import SideNavbar from '../SideNavbar'; // Import the SideNavbar component
import TeacherSidebarData from './TeacherSidebarData'; // Import sidebar data
import { AiOutlineEdit } from 'react-icons/ai'; // Import the edit icon
import { jwtDecode } from 'jwt-decode';

const SingleAnnouncementTeacher = () => {
  const { announcementid } = useParams();
  const [roleid, setRoleid] = useState('');
  const [announcement, setAnnouncement] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const token = localStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      setRoleid(decodedToken.roleid);
      try {
        const response = await fetch(`/api/announcements/${announcementid}`);
        if (response.ok) {
          const data = await response.json();
          setAnnouncement(data);
          setForm({ title: data.title, content: data.content });
        } else {
          throw new Error('Failed to fetch announcement');
        }
      } catch (error) {
        console.error('Error fetching announcement:', error);
        navigate('/announcementsteacherview');
      }
    };

    fetchAnnouncement();
  }, [announcementid, navigate]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSaveClick = async () => {
    try {
      const response = await fetch(`/api/announcements/${announcementid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const updatedAnnouncement = await response.json();
        setAnnouncement(updatedAnnouncement);
        setIsEditing(false);
      } else {
        throw new Error('Failed to save announcement');
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  if (!announcement) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="single-announcement-container">
      <SideNavbar data={TeacherSidebarData} toggleSidebar={toggleSidebar} />
      <div className={`single-announcement-content ${isSidebarExpanded ? 'sidebar-expanded' : ''}`}>
        <div className="single-announcement-header">
          <h2>COSC 341 - Announcements</h2>
        </div>
        <div className="announcement-detail">
          <div className="announcement-header">
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  className="announcement-title-input"
                />
                <button className="save-button" onClick={handleSaveClick}>
                  Save
                </button>
              </>
            ) : (
              <>
                <h1 className="announcement-title">{announcement.title}</h1>

                {roleid !== 4 && (
                  <button className="edit-button" onClick={handleEditClick}>
                    <AiOutlineEdit size={24} />
                  </button>
                )}
              </>
            )}
          </div>
          <p className="announcement-date">{new Date(announcement.dateposted).toLocaleString()}</p>
          {isEditing ? (
            <textarea
              name="content"
              value={form.content}
              onChange={handleInputChange}
              className="announcement-content-input"
            />
          ) : (
            <p className="announcement-content">{announcement.content}</p>
          )}
        </div>
        <button className="back-button-sannouncement" onClick={() => navigate('/announcementsteacherview')}>Back</button>
      </div>
    </div>
  );
};

export default SingleAnnouncementTeacher;
