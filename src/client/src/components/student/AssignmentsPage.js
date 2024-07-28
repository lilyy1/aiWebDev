import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SideNavbar from '../SideNavbar';
import StudentSidebarData from './StudentSidebarData';
import '../../css/student/AssignmentsPage.css';
import { jwtDecode } from 'jwt-decode';

const AssignmentsPage = () => {
    // const { courseId } = useParams();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [isLabExpanded, setIsLabExpanded] = useState(true);
    const [isWeeklyExpanded, setIsWeeklyExpanded] = useState(true);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        const decodedToken = jwtDecode(token);
        const userid = decodedToken.userid;
        const courseid = decodedToken.courseid;
        const fetchedAssignments = async () => {
            try {
                const response = await fetch(`/api/assignments-page/student/?courseid=${courseid}&userid=${userid}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    console.log('Error fetching assignments:', errorText);
                    return;
                }
                const data = await response.json();
                setAssignments(data);
            } catch (error) {
                console.log('Error fetching assignments:', error);
            }
        };

        fetchedAssignments();
    }, []);

    // const labAssignments = assignments.filter(a => a.title.includes('Lab'));
    // const weeklyAssignments = assignments.filter(a => a.title.includes('Weekly'));
    const labAssignments = assignments;
    console.log("lab assignments:", labAssignments);

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    return (
        <div className="assignments-container">
            <SideNavbar data={StudentSidebarData} toggleSidebar={toggleSidebar} /> {/* Include SideNavbar with StudentSidebarData */}
            <div className={`assignments-content ${isSidebarExpanded ? 'sidebar-expanded' : ''}`}>
                <div className="assignments-header">
                    <h2>Assignments</h2>
                </div>
                <div className="assignment-list">
                    <div className="assignments-list-title" onClick={() => setIsLabExpanded(!isLabExpanded)}>
                        Upcoming Assignments <span>{isLabExpanded ? '▼' : '►'}</span>
                    </div>
                    {isLabExpanded && (
                        <div className="assignments-list">
                            {labAssignments.map((assignment) => (
                                <Link to={`/assignments/${assignment.assignmentid}`} key={assignment.assignmentid} className="assignment-item">
                                    <div className="assignment-details">
                                        <span className="assignment-name">{assignment.assignmentname}</span>
                                        <span className="assignment-due-date">
                                            Due {new Date(assignment.enddate).toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })} | {(assignment.submission && assignment.submission.grade !== null) ? assignment.submission.grade : '-'}/{assignment.maxscore} pts
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignmentsPage;
     
    
