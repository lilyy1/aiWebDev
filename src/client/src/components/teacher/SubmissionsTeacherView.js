import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import SideNavbar from '../SideNavbar';
import TeacherSidebarData from './TeacherSidebarData';
import '../../css/teacher/SubmissionsTeacherView.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FormControl, Dropdown } from 'react-bootstrap';

const SubmissionsTeacherView = () => {
  const [students, setStudents] = useState([]);
  const [assignment, setAssignment] = useState({});
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [roleid, setRoleid] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState('all');

  const { assignmentId } = useParams();
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const fetchSubmissions = async () => {
    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    const courseid = decodedToken.courseid;
    try {
      const response = await fetch(`/api/submissions/${assignmentId}?courseid=${courseid}`);
      const data = await response.json();
      if (response.ok) {
        setStudents(data);
      } else {
        setError('Failed to fetch submissions');
        console.error('Failed to fetch submissions:', data);
      }
    } catch (error) {
      setError('Error fetching submissions');
      console.error('Error fetching submissions:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    if (!token) {
      navigate('/login');
    } else {
      try {
        if (decodedToken.roleid !== 3 && decodedToken.roleid !== 4) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        navigate('/login');
      }
    }
    setRoleid(decodedToken.roleid);
    const courseid = decodedToken.courseid;
    console.log("submission teacher view course id: ", courseid);

    const fetchAssignment = async () => {
      try {
        const response = await fetch(`/api/assignments/${assignmentId}`);
        const data = await response.json();
        setAssignment(data);
      } catch (error) {
        console.error('Error fetching assignment:', error);
      }
    };

    fetchAssignment();
    
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`/api/submissions/${assignmentId}?courseid=${courseid}`);
        const data = await response.json();
        if (response.ok) {
          setStudents(data);
        } else {
          setError('Failed to fetch submissions');
          console.error('Failed to fetch submissions:', data);
        }
      } catch (error) {
        setError('Error fetching submissions');
        console.error('Error fetching submissions:', error);
      }
    };
    fetchSubmissions();
  }, [assignmentId, navigate]);

  const releaseGrades = async () => {
    try {
      const response = await axios.put(`/api/release-grades/${assignmentId}`);
      alert(response.data.message);
      fetchSubmissions(); // Fetch the latest submissions after releasing grades
    } catch (error) {
      console.error('Error releasing grades:', error);
      alert('Failed to release grades');
    }
  };

  const handleDownloadRubric = async () => {
    if (assignmentId) {
      try {
        const response = await fetch(`/api/assignments/${assignmentId}/rubric`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to download rubric');
        }
        console.log("response", response);

        const blob = await response.blob();
        const contentType = response.headers.get('Content-Type').split(';')[0];
        const mimeTypesToExtensions = {
          'application/javascript': 'js',
          'text/javascript': 'js',
          'text/csv': 'csv',
          'application/pdf': 'pdf',
          'text/html': 'html',
          'text/css': 'css',
          'application/x-httpd-php': 'php',
          'text/plain': 'txt',
          'application/json': 'json',
        };

        let filename;
        const contentDisposition = response.headers.get('Content-Disposition');
        if (mimeTypesToExtensions[contentType]) {
          const extension = mimeTypesToExtensions[contentType];
          filename = `rubric.${extension}`;
        } else if (contentDisposition && contentDisposition.includes('filename=')) {
          filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
        } else {
          filename = 'rubric';
        }
        console.log("filename", filename);  

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (err) {
        console.error('Failed to download rubric:', err);
      }
    }
  };

  const handleDownloadAnswerKey = async () => {
    if (assignmentId) {
      try {
        const response = await fetch(`/api/assignments/${assignmentId}/answerkey`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to download answer key');
        }
        console.log("response", response);

        const blob = await response.blob();
        const contentType = response.headers.get('Content-Type').split(';')[0];
        const mimeTypesToExtensions = {
          'application/javascript': 'js',
          'text/javascript': 'js',
          'text/csv': 'csv',
          'application/pdf': 'pdf',
          'text/html': 'html',
          'text/css': 'css',
          'application/x-httpd-php': 'php',
          'text/plain': 'txt',
          'application/json': 'json',
        };

        let filename;
        const contentDisposition = response.headers.get('Content-Disposition');
        if (mimeTypesToExtensions[contentType]) {
          const extension = mimeTypesToExtensions[contentType];
          filename = `answerkey.${extension}`;
        } else if (contentDisposition && contentDisposition.includes ('filename=')) {
          filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
        } else {
          filename = 'answerkey';
        }
        console.log("filename", filename);

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (err) {
        console.error('Failed to download answer key:', err);
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterCriteria(e);
  };

  const filteredStudents = students
    .filter(student =>
      student.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.userid.toString().includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(student => {
      if (filterCriteria === 'all') return true;
      if (filterCriteria === 'submitted') return student.submissions && student.submissions[0];
      if (filterCriteria === 'notsubmitted') return !(student.submissions && student.submissions[0]);
      return true;
    });

  return (
    <div className="submissions-container">
      <SideNavbar data={TeacherSidebarData} toggleSidebar={toggleSidebar} />
      <div className={`submissions-content ${isSidebarExpanded ? "sidebar-expanded" : ""}`}>
        <div className="content-wrapper">
          {error && <div className="alert alert-danger">{error}</div>} {/* Display error message if any */}
          <div className="submissions-header">
            <h2>Assignment Submissions</h2>
          </div>
          <div className="search-sort-filter">
            <Dropdown onSelect={handleFilterChange}>
              <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                Add filter
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="all">All Students</Dropdown.Item>
                <Dropdown.Item eventKey="submitted">Submitted</Dropdown.Item>
                <Dropdown.Item eventKey="notsubmitted">Not Submitted</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <FormControl
              type="text"
              placeholder="Search for a submission"
              className="mr-sm-2"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="submissions-list">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Student ID</th>
                  <th>Email address</th>
                  <th>Submitted</th>
                  <th>Grade & Feedback</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => {
                  let gradeStatus = "Pending";
                  let status = "No";
                  let rowClass = index % 2 === 0 ? 'even-row' : 'odd-row';
                  if (student.submissions && student.submissions[0]) {
                    gradeStatus = student.submissions[0].grade == null ? "Pending" : "Completed";
                    status = "Yes";
                  }
                  return (
                    <tr key={student.userid} className={rowClass}>
                      <td className="submission-cell">{student.firstname}{' '}{student.lastname}</td>
                      <td className="submission-cell">{student.userid}</td>
                      <td className="submission-cell">{student.email}</td>
                      <td className="submission-cell">{status}</td>
                      <td className={`submission-cell ${gradeStatus === "Pending" ? "pending" : "completed"}`}>{gradeStatus}</td>
                      <td className="submission-cell">
                        {gradeStatus === "Completed" &&
                          (
                            <Link to={`/gradesandfeedback/${student.submissions[0].submissionid}`} className="view-submission-button">View</Link>
                          )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {roleid !== 4 && (
            <button className="release-grades-button" onClick={releaseGrades}>Release Grades</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionsTeacherView;






