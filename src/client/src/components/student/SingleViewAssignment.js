import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SideNavbar from '../SideNavbar';
import StudentSidebarData from './StudentSidebarData'; // Import StudentSidebarData
import '../../css/student/SingleAssignment.css';
import { jwtDecode } from 'jwt-decode';

const SingleViewAssignment = () => {
    const { assignmentId } = useParams();
    const [file, setFile] = useState(null);
    const [link, setLink] = useState('');
    const [assignment, setAssignment] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        let userid;
        try {
            userid = decodedToken.userid;
            console.log("client user id: ", userid);
        } catch {
            console.log("no user id");
        }
        const fetchAssignment = async () => {
            try {
                const response = await fetch(`/api/assignments/${assignmentId}`);
                const data = await response.json();
                setAssignment(data);
            } catch (error) {
                console.error('Error fetching assignment:', error);
            }
        };

        const fetchSubmission = async () => {
            try {
                const response = await fetch(`/api/submissions/${assignmentId}/${userid}`);
                const data = await response.json();
                setSubmission(data);
            } catch (error) {
                console.error('Error fetching submission:', error);
            }
        };

        fetchAssignment();
        fetchSubmission();
    }, [assignmentId]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleLinkChange = (e) => {
        setLink(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        if (assignment.submissiontype === 'file') {
            if (!file) {
                setErrorMessage('Please choose a file to submit');
                return;
            }
            formData.append('file', file);
        } else if (assignment.submissiontype === 'link') {
            if (!link) {
                setErrorMessage('Please provide a link to submit');
                return;
            }
            formData.append('link', link);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                setShowSuccess(true);
                setErrorMessage('');
            } else {
                const result = await response.json();
                setErrorMessage(result.error || 'Failed to submit assignment');
            }
        } catch (error) {
            console.error('Error submitting assignment:', error);
            setErrorMessage('Error submitting assignment');
        }
    };

    if (!assignment) {
        return <div>Loading...</div>;
    }

    const handleDownloadRubric = async () => {
        if (assignment?.assignmentid) {
            try {
                const response = await fetch(`/api/assignments/${assignment.assignmentid}/rubric`, {
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
                    // Add more 
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

    const handleDownloadSubmission = async () => {
        if (submission?.submissionid) {
            try {
                const response = await fetch(`/api/submissions/file/${submission.submissionid}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to download submission');
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
                    // Add more
                };

                let filename;
                const contentDisposition = response.headers.get('Content-Disposition');
                if (mimeTypesToExtensions[contentType]) {
                    const extension = mimeTypesToExtensions[contentType];
                    filename = `submission.${extension}`; 
                } else if (contentDisposition && contentDisposition.includes('filename=')) {
                    filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
                } else {
                    filename = 'submission';
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
                console.error('Failed to download submission', err);
            }
        }
      };

    return (
        <div className="single-assignment-container">
            <SideNavbar data={StudentSidebarData} toggleSidebar={toggleSidebar} /> {/* Include SideNavbar with StudentSidebarData */}
            <div className="single-assignment-page">
                <h2 className="course-title">COSC 341 101 2024W &gt; Assignments</h2>
                <h2 className="assignment-title">{assignment.assignmentname}</h2>
                <div className="assignment-details">
                    <p><strong>Due:</strong> {new Date(assignment.enddate).toLocaleDateString()} {assignment.dueTime} | <strong>Points:</strong> {assignment.maxscore} | <strong>Submission type:</strong> {assignment.submissiontype}</p>
                </div>
                <div className="assignment-info">
                    <p>{assignment.assignmentdescription}</p>
                    <p>*Please make sure that the uploaded file is 5MB or smaller*</p>
                </div>
                <div className="assignment-resources">
                    <p>Here are some resources you can look at: <a href={assignment.resourcesLink}>{assignment.resources}</a></p>
                    <button className="button-submit" onClick={handleDownloadRubric} disabled={!assignment.rubric}>
                        Download Rubric
                    </button>
                </div>
                <div></div>
                {submission && submission.contentlink && (
                    <div>
                        <p>Submitted Link: <a href={submission.contentlink} target="_blank" rel="noopener noreferrer">{submission.contentlink}</a></p>
                    </div>
                )}
                <div></div>
                <div className="upload-section">
                    {assignment.submissiontype === 'file' ? (
                        <input type="file" onChange={handleFileChange} />
                    ) : (
                        <input type="text" placeholder="Enter the link" value={link} onChange={handleLinkChange} />
                    )}
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>
                {submission && (!submission.contentlink) && submission.content && (
                    <div className="assignment-buttons">
                        <button className="button-submit" onClick={handleDownloadSubmission}>Download submission</button>
                    </div>
                )}
                <button className="button-submit" onClick={handleSubmit}>
                    {submission && submission.content ? 'Resubmit' : 'Submit'}
                </button>
                {showSuccess && <div className="success-message">Assignment submitted successfully!</div>}
            </div>
        </div>
    );
};

export default SingleViewAssignment;
