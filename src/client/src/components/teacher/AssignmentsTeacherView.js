import React, { useState, useEffect } from "react";
import { FaFileAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import SideNavbar from '../SideNavbar';
import TeacherSidebarData from './TeacherSidebarData';
import AddAssignmentModal from "./AddAssignmentModal";
import '../../css/teacher/AssignmentsTeacherView.css';
import { jwtDecode } from "jwt-decode"; 
import { Button, Modal, Form } from 'react-bootstrap';

const AssignmentsTeacherView = () => {
  const [assignments, setAssignments] = useState([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [roleid, setRoleid] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showEditPromptModal, setShowEditPromptModal] = useState(null);
  const [newPrompt, setNewPrompt] = useState('');
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  useEffect(() => {
    const fetchAssignments = async () => {
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
      const userid = decodedToken.userid;
      const courseid = decodedToken.courseid;
      setRoleid(decodedToken.roleid);

      try {
        const response = await fetch(`/api/assignments-page/?courseid=${courseid}&userid=${userid}`, {
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

    fetchAssignments();
  }, [navigate]);

  const deleteAssignment = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/assignments-page/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        console.log('Error deleting assignment:', response.statusText);
        return;
      }
      setAssignments(assignments.filter(assignment => assignment.assignmentid !== id));
    } catch (error) {
      console.log('Error deleting assignment:', error);
    }
  };

  const editPrompt = async (id, prompt) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/assignments-page/${id}/prompt`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPrompt: prompt })
      });
      if (!response.ok) {
        console.log('Error updating prompt:', response.statusText);
        return;
      }
      const data = await response.json();
      console.log('Prompt updated successfully:', data);
      setAssignments(assignments.map(assignment =>
        assignment.assignmentid === id ? { ...assignment, prompt } : assignment
      ));
    } catch (error) {
      console.log('Error updating prompt:', error);
    }
  };

  const handleEditPrompt = (assignmentId) => {
    setShowEditPromptModal(assignmentId);
    const assignment = assignments.find(a => a.assignmentid === assignmentId);
    setNewPrompt(assignment.prompt);
  };

  const handleSavePrompt = async () => {
    if (showEditPromptModal !== null) {
      await editPrompt(showEditPromptModal, newPrompt);
      // Re-fetch assignments to get the updated prompt
      const token = localStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      const userid = decodedToken.userid;
      const courseid = decodedToken.courseid;

      try {
        const response = await fetch(`/api/assignments-page/?courseid=${courseid}&userid=${userid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setAssignments(data);
      } catch (error) {
        console.log('Error fetching assignments:', error);
      }
      setShowEditPromptModal(null);
    }
  };

  return (
    <div className="assignments-container">
      <SideNavbar data={TeacherSidebarData} toggleSidebar={toggleSidebar} />
      <div className={`assignments-content ${isSidebarExpanded ? "sidebar-expanded" : ""}`}>
        <div className="assignments-header">
          <h2>COSC 341 - Assignments</h2>
          <div className="assignments-actions">
            {roleid !== 4 && (
              <Button variant="primary" onClick={openModal}>
                + Assignment
              </Button>
            )}
          </div>
        </div>
        <div className="assignments-list-title">Assignments</div>
        <div className="assignments-list">
          {assignments.map((assignment) => (
            <div key={assignment.assignmentid} className="assignment-item">
              <FaFileAlt />
              <Link to={`/submissionsteacherview/${assignment.assignmentid}`} className="assignment-details">
                <span className="assignment-name">{assignment.assignmentname}</span>
                <span className="assignment-due-date">
                  Due {new Date(assignment.enddate).toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}  | {assignment.maxscore} pts
                </span>
              </Link>
              <div className="assignment-actions">
                {roleid !== 4 && (
                  <>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setShowDeleteModal(assignment.assignmentid)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditPrompt(assignment.assignmentid)}
                    >
                      Edit AI Prompt
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <AddAssignmentModal isOpen={modalIsOpen} onRequestClose={closeModal} />

      <Modal show={showDeleteModal !== null} onHide={() => setShowDeleteModal(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this assignment?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => {
            deleteAssignment(showDeleteModal);
            setShowDeleteModal(null);
          }}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditPromptModal !== null} onHide={() => setShowEditPromptModal(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit AI Prompt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formPrompt">
              <Form.Label>New AI Prompt</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditPromptModal(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSavePrompt}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default AssignmentsTeacherView;