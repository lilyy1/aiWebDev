import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActiveCourses from './ActiveCourses';
import Announcements from './Announcements';
import Assignments from './Assignments';
import CalendarComponent from '../CalendarComponent';
import { jwtDecode } from 'jwt-decode';
import '../../css/Dashboard.css';

function StudentDashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [courseid, setCourseId] = useState(null);
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
      const courseid = decodedToken.courseid;
      setName(decodedToken.firstname);
      setCourseId(courseid);

      try {
        const userRes = await fetch(`/api/protected`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!userRes.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userRes.json();
        setUser(userData.user);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }

      try {
        const courseRes = await fetch(`/api/course/${courseid}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourse(courseData);
        } else {
          throw new Error('Failed to fetch course data');
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
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
        const assignmentsRes = await fetch(`/api/assignments-page/student/?courseid=${courseid}&userid=${userid}`, {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="student-dashboard-content">
      <div className="dashboard-header">
        <h2>Welcome, {name}</h2>
      </div>
      <div className="top-section">
        {courseid && <ActiveCourses />}
        <CalendarComponent />
      </div>
      <div className="full-width-section">
        <Announcements announcements={announcements} />
      </div>
      <div className="full-width-section">
        <Assignments assignments={assignments} />
      </div>
    </div>
  );
}

export default StudentDashboard;

