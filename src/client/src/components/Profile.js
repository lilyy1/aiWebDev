import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import SideNavbar from './SideNavbar';
import StudentSidebarData from './student/StudentSidebarData';
import TeacherSidebarData from './teacher/TeacherSidebarData';
import AdminSidebarData from './Admin/AdminSidebarData';

const backgroundAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const ProfileGlobalStyle = createGlobalStyle`
  body.profile-page, html.profile-page {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    height: 100%;
    background: linear-gradient(135deg, #4169E1 0%, #ffffff 100%);
    background-size: 200% 200%;
    animation: ${backgroundAnimation} 15s ease-in-out infinite;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  #root {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
`;

const ProfileContainer = styled(Container)`
  color: #000000;
  padding: 40px 20px;
  text-align: left;
  max-width: 800px;
  margin: 0 auto;
  background-color: #f9f9f9;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
`;

const ProfileTitle = styled.h1`
  font-size: 2.5em;
  font-weight: bold;
  font-family: 'Roboto', sans-serif;
  color: #2c3e50;
  margin: 20px 0;
`;

const StyledButton = styled(Button)`
  font-size: 18px;
  margin: 10px 0;
  padding: 10px 20px;
  background-color: #1e90ff;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #104e8b;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 8px 18px;
  }

  @media (max-width: 576px) {
    font-size: 14px;
    padding: 6px 16px;
  }
`;

const InfoCard = styled(Card)`
  margin: 10px 0;
  padding: 20px;
  border: none;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled(Card.Title)`
  font-size: 1.3em;
  margin-bottom: 10px;
  color: #2c3e50;
`;

const CardText = styled(Card.Text)`
  font-size: 1em;
  color: #2c3e50;
  background-color: #ffffff;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

function Profile() {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('profile-page');

    return () => {
      document.body.classList.remove('profile-page');
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
      } else {
        const response = await fetch(`/api/protected`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.log('Failed to fetch data');
        } else {
          const data = await response.json();
          const id = data.user.userid;
          const resp = await fetch(`/api/profile/${id}`, {});
          if (!resp.ok) {
            console.log('Failed to fetch data');
          } else {
            const profile = await resp.json();
            setUser(profile);
          }
        }
      }
    };

    fetchData();
  }, [navigate]);

  const roleMapping = {
    1: 'Student',
    2: 'Admin',
    3: 'Instructor',
    4: 'TA',
  };

  const sidebarDataMapping = {
    1: StudentSidebarData,
    2: AdminSidebarData,
    3: TeacherSidebarData,
    4: TeacherSidebarData,
  };

  const role = roleMapping[user.roleid] || 'N/A';
  const sidebarData = sidebarDataMapping[user.roleid];

  return (
    <>
      <ProfileGlobalStyle />
      <div className="profile-page">
        <SideNavbar data={sidebarData} />
        <ProfileContainer>
          <Row className="align-items-center">
            <Col xs={12}>
              <ProfileTitle>Profile</ProfileTitle>
            </Col>
            <Col xs={12} sm={9} style={{minWidth: '500px'}}>
              <h3 style={{ marginLeft: '20px' }}>{`${user.firstname} ${user.lastname}`}</h3>
            </Col>
          </Row>
          <InfoCard>
            <CardTitle>Role</CardTitle>
            <CardText>{role}</CardText>
          </InfoCard>
          <InfoCard>
            <CardTitle>Course</CardTitle>
            <CardText>COSC 341</CardText>
          </InfoCard>
          <InfoCard>
            <CardTitle>Email</CardTitle>
            <CardText>{user.email}</CardText>
          </InfoCard>
          <Link to="/edit">
            <StyledButton>Edit</StyledButton>
          </Link>
        </ProfileContainer>
      </div>
    </>
  );
}

export default Profile;