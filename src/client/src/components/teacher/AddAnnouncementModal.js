import React, { useState } from 'react';
import '../../css/Modal.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AddAnnouncementModal = ({ isOpen, onRequestClose }) => {

  const [form, setForm] = useState({
    title: '',
    description: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // New state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Disable the submit button
    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    const courseid = decodedToken.courseid;
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

    console.log('Form data being submitted:', form);
  
    try {
      console.log('Sending POST request to /api/announcements/create-announcement');
      const response = await fetch(`/api/announcements/create-announcement?courseid=${courseid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
  
      console.log('Received response:', response);
  
      const result = await response.json();
      console.log('Parsed response JSON:', result);
  
      if (response.ok) {
        console.log('Announcement created successfully:', result);
        setSuccessMessage('Announcement created successfully!');
        setTimeout(() => {
          setSuccessMessage('');
          onRequestClose();
          setIsSubmitting(false); // Re-enable the submit button
          window.location.reload(); // Refresh the page
        }, 1000);
      } else {
        console.error('Failed to create announcement:', result.error || 'Unknown error');
        setErrorMessage(result.error || 'Failed to create the announcement');
        setIsSubmitting(false); // Re-enable the submit button
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      setErrorMessage('Error creating announcement');
      setIsSubmitting(false); // Re-enable the submit button
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onRequestClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Add Announcement</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            Announcement Title
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </label>
          <div className="modal-buttons">
            <button type="button" onClick={onRequestClose}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAnnouncementModal;