import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import '../../css/teacher/StudentList.css';
import '../../css/Modal.css';

const AddStudentModal = ({ show, onHide, onAddStudent, successMessage }) => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (show) {
      setEmail('');
      setErrorMessage('');
    }
  }, [show]);

  const handleAdd = () => {
    if (email) {
      onAddStudent(email);
      setEmail('');
      setErrorMessage('');
    } else {
      setErrorMessage('Email is required');
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Add Students</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formStudentEmail">
            <Form.Label>Student Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter student email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleAdd}>
          Add
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddStudentModal;



