import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Form, Button, Container } from 'react-bootstrap';
import SideNavbar from '../SideNavbar'; // Adjust the import path as necessary
import StudentSidebarData from './StudentSidebarData'; // Adjust the import path as necessary
import '../../css/student/Enroll.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

// Styles for the enrollment container
const EnrollmentContainer = styled(Container)`
  background-color: #e8f1f2;
  color: #000;
  padding: 40px;
  border-radius: 10px;
  max-width: 600px;
  margin-top: 20px;
`;

const EnrollButton = styled(Button)`
  background-color: #5a67d8;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  width: 100px;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const CourseButton = styled(Button)`
  background-color: #4c6ef5;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  cursor: pointer;
  margin-top: 10px;
  width: auto;
  min-width: 300px;
  &:hover {
    background-color: #8ca9ff;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  width: 100%;
  background-color: #e8f1f2;
  min-height: 100vh;
  padding-top: 20px;
`;

const EnrollPageContainer = styled.div`
  display: flex;
  width: 100%;
  background-color: #e8f1f2; /* Match the background color */
`;

const Header = styled.h2`
  font-weight: bold;
  margin-bottom: 10px;
`;

const SubHeader = styled.p`
  font-size: 18px;
  margin-bottom: 20px;
`;

const Enroll = () => {
  const [courseCode, setCourseCode] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [userid, setUserid] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setIsActive(courseCode.length > 0);

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const decodedToken = jwtDecode(token);
    setUserid(decodedToken.userid);
  }, [courseCode]);

  const handleEnroll = async () => {
    if (isActive) {
      try {
        const response = await fetch('/api/manage/check-access-code-and-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accesscode: courseCode, userid: userid }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage(`Success: ${data.message}`);
          localStorage.setItem('token', data.token);
          return;
        } else {
          setMessage(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Error enrolling in course:', error);
        setMessage('Error: Server error');
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <EnrollPageContainer>
      <SideNavbar data={StudentSidebarData} toggleSidebar={toggleSidebar} />
      <MainContent className={isSidebarExpanded ? 'sidebar-expanded' : ''}>
        <Header>Enroll in a course</Header>
        <SubHeader>Enter the access code sent by your instructor to gain access</SubHeader>
        <EnrollmentContainer className="d-flex flex-column align-items-center justify-content-center">
          <Form>
            <Form.Group controlId="courseCode" className="d-flex">
              <Form.Control
                type="text"
                placeholder="Enter access code"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="me-2"
              />
              <EnrollButton onClick={handleEnroll} disabled={!isActive}>
                Enroll
              </EnrollButton>
            </Form.Group>
          </Form>
        </EnrollmentContainer>
        {message && <p>{message}</p>}
      </MainContent>
    </EnrollPageContainer>
  );
};

export default Enroll;
