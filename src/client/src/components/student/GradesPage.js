import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SideNavbar from '../SideNavbar';
import StudentSidebarData from './StudentSidebarData';
import '../../css/student/GradesPage.css';
import { jwtDecode } from 'jwt-decode';

const GradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        const userid = decodedToken.userid;

        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`/api/view-grades?userid=${userid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.log(response);
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setGrades(data);
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };

    fetchGrades();
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const totalGrade = grades.reduce((acc, grade) => acc + grade.grade, 0);
  const totalMaxScore = grades.reduce((acc, grade) => acc + grade.assignment.maxscore, 0);
  const totalPercentage = totalMaxScore ? ((totalGrade / totalMaxScore) * 100).toFixed(2) : 0;

  return (
    <div className="grades-container">
      <SideNavbar data={StudentSidebarData} toggleSidebar={toggleSidebar} />
      <div className={`grades-content ${isSidebarExpanded ? "sidebar-expanded" : ""}`}>
        <div className="grades-header">
        </div>
        <div className="grades-list-title">{'COSC 341 > Grades'}</div>
        <div className="grades-list">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Due</th>
                <th>Status</th>
                <th>Score</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade, index) => (
                <tr key={index}>
                  <td>{grade.assignment.assignmentname}</td>
                  <td>{new Date(grade.assignment.enddate).toLocaleString()}</td>
                  <td>{grade.status}</td>
                  <td>{grade.grade}/{grade.assignment.maxscore}</td>
                  <td>
                    {grade.feedback ? (
                      <Link to={`/feedback/${grade.submissionid}`}>View Feedback</Link>
                    ) : (
                      'No Feedback'
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="4">Total</td>
                <td>{totalPercentage}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GradesPage;