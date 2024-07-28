import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

const EditUserProfile = () => {
  const { userid } = useParams();
  const navigate = useNavigate();
  const authToken = localStorage.getItem('token');

  const [user, setUser] = useState({});
  const [roles, setRoles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('None');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    // Fetch user data
    fetch(`/api/users/${userid}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then((userData) => {
        console.log('User data:', userData);
        setUser(userData);
        setSelectedRole(userData.roleid);
        if (userData.enrollments && userData.enrollments.length > 0) {
          setSelectedCourse(userData.enrollments[0].courseid);
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });

    // Fetch roles
    fetch('/api/roles', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch roles');
        }
        return response.json();
      })
      .then((rolesData) => {
        console.log('Roles data:', rolesData);
        setRoles(rolesData);
      })
      .catch((error) => {
        console.error('Error fetching roles:', error);
      });

    // Fetch courses
    fetch('/api/courses', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        return response.json();
      })
      .then((coursesData) => {
        console.log('Courses data:', coursesData);
        setCourses(coursesData);
      })
      .catch((error) => {
        console.error('Error fetching courses:', error);
      });
  }, [userid, authToken]);

  const handleSaveChanges = () => {
    fetch(`/api/users/${userid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        roleid: selectedRole,
        courseid: selectedCourse !== 'None' ? selectedCourse : null,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error saving changes');
        }
        alert('Changes saved successfully');
        navigate('/admin-dashboard'); // Redirect to admin dashboard or any other page
      })
      .catch((error) => {
        alert('Error saving changes');
        console.error('Error:', error);
      });
  };

  const handleDeleteUser = () => {
    fetch(`/api/users/${userid}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error deleting user');
        }
        alert('User deleted successfully');
        navigate('/admin-dashboard'); // Redirect to admin dashboard or any other page
      })
      .catch((error) => {
        alert('Error deleting user');
        console.error('Error:', error);
      });
  };

  return (
    <Container>
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <h2>Edit User Profile</h2>
          <Form>
            <Form.Group controlId="formFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" value={user.firstname || ''} readOnly />
            </Form.Group>

            <Form.Group controlId="formLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" value={user.lastname || ''} readOnly />
            </Form.Group>

            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={user.email || ''} readOnly />
            </Form.Group>

            <Form.Group controlId="formCourse">
              <Form.Label>Course</Form.Label>
              <Form.Control as="select" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                <option value="None">None</option>
                {courses.map((course) => (
                  <option key={course.courseid} value={course.courseid}>
                    {course.term} - {course.accesscode}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formRole">
              <Form.Label>Role</Form.Label>
              <Form.Control as="select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                {roles.map((role) => (
                  <option key={role.roleid} value={role.roleid}>
                    {role.rolename}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Button variant="danger" onClick={handleDeleteUser}>Delete User</Button>
            <Button variant="primary" onClick={handleSaveChanges} className="ml-2">Save Changes</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default EditUserProfile;
