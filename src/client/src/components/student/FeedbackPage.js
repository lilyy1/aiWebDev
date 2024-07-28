// src/components/student/FeedbackPage.js

import React, { useState, useEffect } from 'react';
import { useParams, Link , useNavigate} from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import SideNavbar from '../SideNavbar';
import StudentSidebarData from './StudentSidebarData';
import '../../css/student/FeedbackPage.css';

const FeedbackPage = () => {
  const { submissionid } = useParams();
  const [feedback, setFeedback] = useState({});
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const navigate = useNavigate();



  // useEffect(() => {
  //   // Dummy data for feedback
  //   const dummyFeedback = {
  //     assignmentName: `Assignment ${assignmentId}`,
  //     score: '15/30',
  //     average:'25.5/30',
  //     comments: 'Feedback from the AI should be inserted here'
      
  //   };
  //   setFeedback(dummyFeedback);
  // }, [assignmentId]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchFeedback = async () => {
      try {
        const response = await fetch(`/api/submissions/get/${submissionid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch feedback');
        }

        const data = await response.json();
        setFeedback({
          assignmentName: `Assignment ${data.assignmentid}`,
          score: `${data.grade}/${data.maxscore}`,
          average: `${data.averagescore}/${data.maxscore}`,
          comments: data.feedback || 'No feedback provided'
        });
      } catch (error) {
        console.error('Error fetching feedback:', error);
      }
    };

    fetchFeedback();
  }, [submissionid, navigate]);

  return (
    <div className="feedback-container">
      <SideNavbar data={StudentSidebarData} toggleSidebar={toggleSidebar} />
      <div className={`feedback-content ${isSidebarExpanded ? "sidebar-expanded" : ""}`}>
        <div className="feedback-header">
          <h2>{`COSC 341 > Grades > ${feedback.assignmentName} Feedback`}</h2>
        </div>
        <div className="feedback-score">
            <div className="score-block">
              <div>Your Score: {feedback.score}</div>
            </div>
            <div className="score-block">
            <div>Average: {feedback.average ? `${parseFloat(feedback.average).toFixed(2)}%` : 'N/A'} </div>
            </div>
          </div>
        <div className="feedback-details">
          <div className="feedback-comments">
            <h3>Comments</h3>
            <textarea readOnly value={feedback.comments} />
          </div>
        </div>
      </div>
      <Link to="/grades-page" className="back-button">Go Back</Link>
    </div>
    
  );
};

export default FeedbackPage;
