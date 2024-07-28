import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import '../../css/CreateSectionModal.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 

const ManageCourseModal = ({ show, handleClose }) => {
  const [form, setForm] = useState({
    students: null,
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, files } = e.target;
    let value = e.target.value;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: files ? files[0] : (value || ''),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let courseid = 2; 
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      try {
        const decodedToken = jwtDecode(token);
        courseid = decodedToken.courseid;
        console.log("client course id: ", courseid)
      } catch (error) {
        console.error('Invalid token:', error);
        navigate('/login');
      }
    }

    const formData = new FormData();
    if (form.students) {
      formData.append('students', form.students);
    }
    console.log('Form data being submitted:', form);
    console.log("client course id: ", courseid);

    try {
      console.log('Sending POST request to /api/manage/upload-csv/:courseid');
      const response = await fetch(`/api/manage/upload-csv/${courseid}`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        setSuccessMessage('uploaded successfully!');
        console.log('uploaded successfully:', result);
        setTimeout(() => {
          setSuccessMessage('');
          handleClose();
        }, 1000);
      } else {
        console.error('Failed upload csv:', result.error || 'Unknown error');
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error('Error uploading:', error);
      setErrorMessage('An error occurred during upload.');
    }

  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Manage Course</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formCsvFile" className="mt-3">
            <Form.Label>Upload .csv file for enrollment</Form.Label>
            <Form.Control
              type="file"
              name="students"
              accept=".csv"
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
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

export default ManageCourseModal;