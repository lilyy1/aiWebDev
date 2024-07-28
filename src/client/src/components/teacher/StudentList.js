import React, { useState, useEffect } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import SideNavbar from '../SideNavbar';
import TeacherSidebarData from './TeacherSidebarData';
import AddStudentModal from './AddStudentModal'; 
import '../../css/teacher/StudentList.css';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const [roleid, setRoleid] = useState('');
  const [courseDetails, setCourseDetails] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const decodedToken = jwtDecode(token);
    setRoleid(decodedToken.roleid);

    if (decodedToken.roleid !== 3 && decodedToken.roleid !== 4) {
      navigate('/dashboard');
    }

    const courseid = decodedToken.courseid;

    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`/api/courses/${courseid}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Course not found');
        }
        const data = await response.json();
        setCourseDetails(data);
      } catch (err) {
        console.error('Failed to fetch course details:', err);
      }
    };
    fetchCourseDetails();

    const fetchStudents = async () => {
      try {
        const response = await fetch(`/api/students?courseid=${courseid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (response.ok) {
          setStudents(result);
        } else {
          console.error('Error fetching students:', result);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    fetchStudents();
  }, [navigate]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async (studentId) => {
    try {
      const response = await fetch(`/api/enrollments/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setStudents(students.filter(student => student.userid !== studentId));
      } else {
        console.error('Error deleting student:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleAddStudent = async (email) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, courseid: courseDetails.course.courseid })
      });
      if (response.ok) {
        const newStudent = await response.json();
        setStudents([...students, {
          userid: newStudent.userid,
          firstname: newStudent.user.firstname,
          lastname: newStudent.user.lastname,
          email: newStudent.user.email
        }]);
        setSuccessMessage('Student has been added to the approved list. They can join the course using the access code now!');
      } else {
        console.error('Error adding student:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstname ? student.firstname.toLowerCase() : ''} ${student.lastname ? student.lastname.toLowerCase() : ''}`;
    return fullName.includes(searchTerm.toLowerCase());
  });  

  return (
    <div className="student-list-container">
      <SideNavbar data={TeacherSidebarData} />
      <div className="content">
        <div className="header">
          <h2>Students List</h2>
          {courseDetails.course?.courseid && (
            <button className="btn btn-primary add-student-btn" onClick={() => setShowAddStudentModal(true)}>Add students</button>
          )}
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for a student by name or email"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <table className="student-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Student ID</th>
              <th>Email address</th>
              <th>Class</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.userid}>
                <td>
                  <div className="student-info">
                    <span>{`${student.firstname} ${student.lastname}`}</span>
                  </div>
                </td>
                <td>{student.userid}</td>
                <td>{student.email}</td>
                <td>
                  {student.enrollment && student.enrollment.courseid
                    ? student.enrollment.courseid
                    : 'N/A'}
                </td>
                <td>
                  {roleid !== 4 && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setShowDeleteModal(student.userid)}
                    >
                      <FaTrashAlt />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Modal show={showDeleteModal !== null} onHide={() => setShowDeleteModal(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this student?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => {
              handleDelete(showDeleteModal);
              setShowDeleteModal(null);
            }}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>

        <AddStudentModal
          show={showAddStudentModal}
          onHide={() => setShowAddStudentModal(false)}
          onAddStudent={handleAddStudent}
          successMessage={successMessage}
        />
      </div>
    </div>
  );
};

export default StudentList;

