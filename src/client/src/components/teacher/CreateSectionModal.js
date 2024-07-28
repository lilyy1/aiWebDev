import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import '../../css/CreateSectionModal.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const CreateSectionModal = ({ show, handleClose }) => {
  const [term, setTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const decodedToken = jwtDecode(token);
    const userid = decodedToken.userid;
    try {
      const response = await fetch(`/api/create-section?userid=${userid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          term: term,
          startDate: startDate,
          endDate: endDate,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setSuccessMessage('Course created successfully!');
        setTimeout(() => {
          setSuccessMessage('');
          handleClose();
          window.location.reload();
        }, 1000);
        localStorage.setItem('token', result.token);
      } else {
        setErrorMessage(result.error || 'Failed to create course');
      }
    } catch (error) {
      setErrorMessage('Error: ' + error.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create Course</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <Form>
          <Form.Group controlId="formTerm">
            <Form.Label>Term</Form.Label>
            <Form.Control
              type="number"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Enter term"
              required
            />
          </Form.Group>
          <Form.Group controlId="formStartDate">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Enter start date"
              required
            />
          </Form.Group>
          <Form.Group controlId="formEndDate">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Enter end date"
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Publish
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateSectionModal;
