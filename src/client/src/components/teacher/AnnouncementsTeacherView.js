import React, { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { AiOutlineBell } from "react-icons/ai";
import AddAnnouncementModal from "./AddAnnouncementModal"; // Import the modal component
import '../../css/teacher/AssignmentsTeacherView.css';
import { jwtDecode } from 'jwt-decode';
import SideNavbar from '../SideNavbar';
import TeacherSidebarData from './TeacherSidebarData'
import { Button, Modal } from 'react-bootstrap';

const AnnouncementsTeacherView = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [roleid, setRoleid] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      const courseid = decodedToken.courseid;
      if (!token) {
        navigate('/login');
      } else {
        try {
          if (decodedToken.roleid !== 3 && decodedToken.roleid !== 4) {
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Invalid token:', error);
          navigate('/login');
        }
      }
      setRoleid(decodedToken.roleid);
      try {
        const announcementsRes = await fetch(`/api/announcements/announcements-page/?courseid=${courseid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (announcementsRes.ok) {
          const announcementsData = await announcementsRes.json();
          setAnnouncements(announcementsData);
        } else {
          throw new Error('Failed to fetch announcements');
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };
    fetchData();
  }, [navigate]);

  const deleteAnnouncement = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        console.log('Error deleting announcement:', response.statusText);
        return;
      }
      setAnnouncements(announcements.filter(announcement => announcement.announcementid !== id));
    } catch (error) {
      console.log('Error deleting announcement:', error);
    }
  }

  return (
    <div className="assignments-container">
      <SideNavbar data={TeacherSidebarData} toggleSidebar={toggleSidebar} />
      <div className={`assignments-content ${isSidebarExpanded ? "sidebar-expanded" : ""}`}>
        <div className="assignments-header">
          <h2>COSC 341 - Announcements</h2>
          <div className="assignments-actions">
            {roleid !== 4 && (
              <Button variant="primary" onClick={openModal}>
                + Announcement
              </Button>
            )}
          </div>
        </div>
        <div className="assignments-list-title">Announcements</div>
        <div className="assignments-list">
          {announcements.map((announcement) => (
            <div key={announcement.announcementid} className="assignment-item">
              <AiOutlineBell />
              <div className="assignment-details">
                <Link to={`/announcementsteacherview/${announcement.announcementid}`}>
                  <span className="assignment-name">{announcement.title}</span>
                </Link>
                <span className="assignment-due-date">
                  {new Date(announcement.dateposted).toLocaleString()} | {announcement.content}
                </span>
              </div>
              <div className="assignment-actions">
              {roleid !== 4 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeleteModal(announcement.announcementid)}
                >
                  Delete
                </Button>
              )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <AddAnnouncementModal isOpen={modalIsOpen} onRequestClose={closeModal} onAnnouncementCreated={closeModal} />
      
      <Modal show={showDeleteModal !== null} onHide={() => setShowDeleteModal(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this announcement?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => {
            deleteAnnouncement(showDeleteModal);
            setShowDeleteModal(null);
          }}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AnnouncementsTeacherView;
