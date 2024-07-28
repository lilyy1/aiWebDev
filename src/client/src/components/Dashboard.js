import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNavbar from './SideNavbar';
import AdminNavbar from './Admin/AdminNavbar';
import StudentDashboard from './student/StudentDashboard';
import TeacherDashboard from './teacher/TeacherDashboard';
import AdminDashboard from './Admin/AdminDashboard';
import StudentSidebarData from './student/StudentSidebarData';
import TeacherSidebarData from './teacher/TeacherSidebarData';
import AdminSidebarData from './Admin/AdminSidebarData';

import { jwtDecode } from 'jwt-decode';
import '../css/Dashboard.css';

function Dashboard() { 
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const decodedToken = jwtDecode(token);
      const userid = decodedToken.userid;
      setName(decodedToken.firstname);
      let courseid;
      try {
        courseid = decodedToken.courseid;
        console.log("client course id: ", courseid);
      } catch {
        console.log("no course id");
      }
      try {
        let userRole = '';
        switch (decodedToken.roleid) {
          case 1:
            userRole = 'student';
            break;
          case 2:
            userRole = 'admin';
            break;
          case 3:
            userRole = 'teacher';
            break;
          case 4:
            userRole = 'TA';
            break;
          default:
            userRole = '';
        }
        setRole(userRole); 
      } catch (error) {
        console.error('Error decoding token:', error);
        navigate('/login');
      } finally {
        setLoading(false); 
      }

      try {
        const announcementsRes = await fetch(`/api/announcements/announcements-page/?courseid=${courseid}`, {});
        if (announcementsRes.ok) {
          const announcementsData = await announcementsRes.json();
          setAnnouncements(announcementsData);
        } else {
          throw new Error('Failed to fetch announcements');
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }

      try {
        const assignmentsRes = await fetch(`/api/assignments-page/?courseid=${courseid}&userid=${userid}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (assignmentsRes.ok) {
          const assignmentsData = await assignmentsRes.json();
          setAssignments(assignmentsData);
        } else {
          throw new Error('Failed to fetch assignments');
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
      }

      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  // Set the sidebar data based on the user's role
  const sidebarData = (role === 'teacher' || role === 'TA') ? TeacherSidebarData : role === 'student' ? StudentSidebarData : role === 'admin' ? AdminSidebarData : null;

  // If loading, show a loading indicator
  if (loading) {
    return <div>Loading...</div>;
  }

  // Conditionally render the appropriate dashboard based on the user's role
  let dashboardContent;
  let NavbarComponent;
  if (role === 'teacher' || role === 'TA') {
    dashboardContent = <TeacherDashboard />;
    NavbarComponent = <SideNavbar data={sidebarData} />;
  } else if (role === 'student') {
    dashboardContent = <StudentDashboard />;
    NavbarComponent = <SideNavbar data={sidebarData} />;
  } else if (role === 'admin') {
    dashboardContent = <AdminDashboard />;
    NavbarComponent = <AdminNavbar />;
  } else {
    // Redirect to login if role is not recognized or invalid
    console.log("Role", role);
    navigate('/login');
    return null;
  }

  return (
    <div className="dashboard-container">
      {NavbarComponent}
      <div className="dashboard-content">
        {dashboardContent}
      </div>
    </div>
  );
}

export default Dashboard;


