import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarComponent from '../CalendarComponent';
import CreateSectionModal from './CreateSectionModal';
import ManageCourseModal from './ManageCourseModal';
import { jwtDecode } from 'jwt-decode';
import '../../css/Dashboard.css';

function TeacherDashboard() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showManageCourseModal, setShowManageCourseModal] = useState(false);
  const [showCreateSectionModal, setShowCreateSectionModal] = useState(false);
  const [courseDetails, setCourseDetails] = useState({});
  const [roleid, setRoleid] = useState('');
  const navigate = useNavigate();

  const handleShowManageCourseModal = () => setShowManageCourseModal(true);
  
  const handleCloseManageCourseModal = () => {
    setShowManageCourseModal(false);
    setTimeout(() => {
      window.location.reload(); // Refresh the page after a delay
    }, 1000); // 1 second delay
  };

  const handleShowCreateSectionModal = () => setShowCreateSectionModal(true);
  const handleCloseCreateSectionModal = () => setShowCreateSectionModal(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const decodedToken = jwtDecode(token);
    setRoleid(decodedToken.roleid);
    let courseid;
    try {
      courseid = decodedToken.courseid;
    } catch {
      console.log("no course id");
    }

    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`/api/courses/${courseid}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log("response", response);
        if (!response.ok) {
          throw new Error('Course not found');
        }
        const data = await response.json();
        setCourseDetails(data);
        console.log("data:", data);
      } catch (err) {
        console.error('Failed to fetch course details:', err);
      }
    };

    fetchCourseDetails();
  }, [navigate]);

  const handleCopyAccessCode = async () => {
    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    const courseid = decodedToken.courseid;

    try {
      const response = await fetch(`/api/manage/access-code/${courseid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch access code');
      }
      const data = await response.json();
      const accessCode = data.accesscode;
      navigator.clipboard.writeText(accessCode);
      alert('Access code copied to clipboard');
    } catch (err) {
      console.error('Failed to copy access code:', err);
    }
  };

  const handleDownload = async () => {
    const courseid = courseDetails.course?.courseid;
    if (courseid) {
        try {
            // Make a request to your server to get the file
            const response = await fetch(`/api/manage/download-students/${courseid}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download file');
            }
            console.log("response", response);

            // Convert the response to a Blob
            const blob = await response.blob();

            // Get the filename from response headers if available
            const contentType = response.headers.get('Content-Type').split(';')[0]; 
            const extension = contentType.split('/')[1]; 
            const filename = `students.${extension}`;
            console.log("filename", filename);

            // Create a URL for the Blob and set up the download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the URL object
            URL.revokeObjectURL(link.href);

        } catch (err) {
            console.error('Failed to download file:', err);
        }
    }
};

  return (
    <div className="dashboard-container">
      <div className={`dashboard-content ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="dashboard-header">
          <h2>Dashboard</h2>
        </div>

        <div className="row">
          <div className="col-md-8">
            <div className="teacher-overview">
              <h3>Course Overview</h3>
              {courseDetails.course?.courseid ? (
                <div className="course-card">
                <h4>COSC 341: Section {courseDetails.course?.courseid}</h4>
                <p>{courseDetails.numberOfStudents} Students</p>
                <p>Course End Date: {new Date(courseDetails.course?.enddate).toLocaleDateString('en-CA',  { month: 'long', day: 'numeric',  year: 'numeric' })}</p>
                <p> Copy the access code using the button below and send it to students for them to enroll in this course.</p>
                {roleid !== 4 && (
                  <>
                <p> Upload a .csv file containing the emails and roleids of the students that are eligible to enroll.</p>
                <p> Students with a roleid of 4 will be automatically assigned as Teaching Assistants after they enroll for this course.</p>
                <p> Instructors: please make sure the .csv file exactly matches the format as the sample <a href="/files/sample.csv" download="sample.csv">here</a></p>
                </>
                )}
                <div className="course-actions">
                  <button className="btn btn-primary" onClick={handleCopyAccessCode}>Copy Access Code</button>
                  {roleid !== 4 && (
                    <>
                  <button className="btn btn-primary" onClick={handleShowManageCourseModal}>Upload .csv file</button>
                  <button className="btn btn-primary" onClick={handleDownload} disabled={!courseDetails.course?.students}>Download uploaded file</button>
                  </>
                  )}
                  </div>
                </div>
              ) : (
                <div className="no-course-message">
                  {roleid !== 4 && (
                    <>
                      <p>No course information available. Please create a new section to get started.</p>
                      <button className="btn btn-primary" onClick={handleShowCreateSectionModal}>New Section</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="col-md-4">
            <div className="calendar-section">
              <CalendarComponent />
            </div>
          </div>
        </div>
      </div>
      <ManageCourseModal show={showManageCourseModal} handleClose={handleCloseManageCourseModal} />
      <CreateSectionModal show={showCreateSectionModal} handleClose={handleCloseCreateSectionModal} />
    </div>
  );
}

export default TeacherDashboard;