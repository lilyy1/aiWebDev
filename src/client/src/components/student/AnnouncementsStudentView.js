import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { AiOutlineBell } from "react-icons/ai";
import { Link } from "react-router-dom";
import '../../css/teacher/AssignmentsTeacherView.css';
import { jwtDecode } from 'jwt-decode';
import SideNavbar from '../SideNavbar';
import StudentSidebarData from '../student/StudentSidebarData'

const SubNav = ({ currentPage, sidebarExpanded }) => (
  <div className={`sub-nav ${sidebarExpanded ? 'sidebar-expanded' : ''}`}>
    <div className={`sub-nav-item ${currentPage === 'assignments' ? 'active' : ''}`}>
      <Link to="/assignments-page/1">Assignments</Link>
    </div>
    <div className={`sub-nav-item ${currentPage === 'announcements' ? 'active' : ''}`}>
      <Link to="/announcementsstudentview">Announcements</Link>
    </div>
  </div>
);

const AnnouncementsStudentView = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded)
  };

  useEffect(() => {

    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const decodedToken = jwtDecode(token);
      const courseid = decodedToken.courseid; 
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const announcementsRes = await fetch(`/api/announcements/announcements-page/?courseid=${courseid}`, {});
        console.log(announcementsRes);
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
  }, []); 

  return (
    <div className="assignments-container">
      <SideNavbar data={StudentSidebarData} toggleSidebar={toggleSidebar} />
      <div className={`assignments-content ${isSidebarExpanded ? "sidebar-expanded" : ""}`}>
        <div className="assignments-header">
          <h2>COSC 341 - Announcements</h2>
        </div>
        <div className="assignments-list-title">Announcements</div>
        <div className="assignments-list">
          {announcements
            .slice()
            .sort((a, b) => b.announcementid - a.announcementid)
            .map((announcement, index) => (
              <Link 
                key={index} 
                to={`/announcement/${announcement.announcementid}`} 
                className="assignment-item"
              >
                <AiOutlineBell />
                <div className="assignment-details">
                  <span className="assignment-name">{announcement.title}</span>
                  <span className="assignment-due-date">
                    {new Date(announcement.dateposted).toLocaleString()} | {announcement.content}
                  </span>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsStudentView;