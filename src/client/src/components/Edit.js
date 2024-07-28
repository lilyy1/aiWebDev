import React, { useEffect, useState } from 'react';
import { Form, Container, Card, Button, Row, Col, Image } from 'react-bootstrap';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
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

const EditGlobalStyle = createGlobalStyle`
  body.edit-page, html.edit-page {
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

const EditContainer = styled(Container)`
  color: #000000;
  padding: 40px 20px;
  text-align: center;
  max-width: 1000px; /* Increased from 800px to 1000px */
  margin: 0 auto;
  background-color: #f9f9f9;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
`;

const EditTitle = styled.h1`
  font-size: 2.5em;
  font-weight: bold;
  font-family: 'Roboto', sans-serif;
  color: #2c3e50;
  margin: 20px 0;
`;

const CustomInput = styled(Form.Control)`
  background-color: #fff !important;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 10px;
  margin-bottom: 15px;
`;

const StyledForm = styled(Form)`
  background-color: transparent;
  padding: 20px;
  border-radius: 5px;
  text-align: left;
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

const UploadButton = styled(Button)`
  font-size: 0.9em;
  background-color: #28a745;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 5px 10px;
  margin-top: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;

  &:hover {
    background-color: #218838;
  }
`;

const CenteredUploadButton = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const ProfileImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

function Edit() {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [userId, setUserId] = useState(null);
  const [profilePic, setProfilePic] = useState('https://via.placeholder.com/150');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('edit-page');

    return () => {
      document.body.classList.remove('edit-page');
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

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
        setUserId(data.user.userid);
        const resp = await fetch(`/api/profile/${data.user.userid}`);
        if (!resp.ok) {
          console.log('Failed to fetch data');
        } else {
          const profile = await resp.json();
          setFirstname(profile.firstname);
          setLastname(profile.lastname);
          setEmail(profile.email);
          setRoleId(profile.roleid);
          setProfilePic(profile.profilePic || 'https://via.placeholder.com/150'); // Assuming profilePic field is present in profile
        }
      }
    };

    fetchData();
  }, [navigate]);

  const handleConfirmChanges = async () => {
    if (!firstname) {
      alert('First name cannot be empty.');
      return;
    }
    if (!lastname) {
      alert('Last name cannot be empty.');
      return;
    }
    if (!email) {
      alert('Email cannot be empty.');
      return;
    } else if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const response = await fetch(`/api/profile/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstname, lastname, email, profilePic }),
    });

    if (!response.ok) {
      console.log('Failed to update profile');
    } else {
      navigate('/profile');
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('profilePic', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`/api/profile/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      setProfilePic(result.profilePicUrl); // Assuming the response contains the URL of the uploaded picture
    } else {
      console.log('Failed to upload profile picture');
    }
  };

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
  
  const role = roleMapping[roleId] || 'N/A';
  const sidebarData = sidebarDataMapping[roleId];

  return (
    <>
      <EditGlobalStyle />
      <div className="edit-page">
        <SideNavbar data={sidebarData} />
        <EditContainer>
          <EditTitle>Edit Profile</EditTitle>
          <Card className="fade-in mt-4" style={{ maxWidth: '1000px', margin: '0 auto' }}> {/* Increased to match EditContainer */}
            <Row className="no-gutters">
              {/* <Col xs={12} sm={3}>
                <ProfileImageWrapper>
                  <Image src={profilePic} roundedCircle style={{ maxWidth: '100%', height: 'auto' }} />
                  <CenteredUploadButton>
                    <UploadButton as="label">
                      Upload
                      <input type="file" onChange={handleProfilePicChange} hidden />
                    </UploadButton>
                  </CenteredUploadButton>
                </ProfileImageWrapper>
              </Col> */}
              <Col xs={12} sm={9} style={{ minWidth: '500px', maxWidth: '100%', marginTop: '10px' }}>
                <Card.Body className="profile-details">
                  <StyledForm>
                    <Form.Group controlId="formFirstName">
                      <Form.Label>First Name</Form.Label>
                      <CustomInput
                        type="text"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group controlId="formLastName">
                      <Form.Label>Last Name</Form.Label>
                      <CustomInput
                        type="text"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group controlId="formEmail">
                      <Form.Label>Email</Form.Label>
                      <CustomInput
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </Form.Group>
                  </StyledForm>
                </Card.Body>
              </Col>
            </Row>
          </Card>
          <StyledButton onClick={handleConfirmChanges}>Confirm Changes</StyledButton>
        </EditContainer>
      </div>
    </>
  );
}

export default Edit;