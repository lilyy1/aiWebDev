import React, { useState, useEffect } from 'react';
import '../../css/Modal.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AddAssignmentModal = ({ isOpen, onRequestClose }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    submissionType: '',
    answerKey: null,
    rubric: null,
    aiPrompt: '',
    availableFrom: '',
    availableTo: '',
    maxScore: '',
  });
  const [courseid, setCourseid] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    setCourseid(decodedToken.courseid);
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
  }, [navigate]);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setForm((prevForm) => ({
        ...prevForm,
        [name]: checked ? value : '',
      }));
    } else if (type === 'file') {
      const file = files[0];
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage('File size exceeds the 5MB limit.');
        setShowErrorModal(true);
      } else {
        setForm({
          ...form,
          [name]: file,
        });
      }
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('courseid', courseid);
    formData.append('assignmentname', form.title);
    formData.append('assignmentdescription', form.description);
    formData.append('submissiontype', form.submissionType);
    formData.append('prompt', form.aiPrompt);
    formData.append('maxscore', form.maxScore);
    formData.append('startdate', form.availableFrom);
    formData.append('enddate', form.availableTo);

    if (form.answerKey) {
      formData.append('answerKey', form.answerKey);
    }

    if (form.rubric) {
      formData.append('rubric', form.rubric);
    }

    try {
      const response = await fetch('/api/assignments/create-assignments', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage('Assignment created successfully!');
        setTimeout(() => {
          setSuccessMessage('');
          onRequestClose();
          window.location.reload(); // Refresh the page
        }, 1000);
      } else {
        setErrorMessage(result.error || 'Failed to create the assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      setErrorMessage('Error creating assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onRequestClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Add Assignment</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Assignment Title
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
          <div className="submission-type">
            <label>Submission Type</label>
            <label>
              <input
                type="radio"
                value="file"
                name="submissionType"
                checked={form.submissionType === 'file'}
                onChange={handleChange}
                required
              />
              File (.html, .javascript, .css)
            </label>
            <label>
              <input
                type="radio"
                value="link"
                name="submissionType"
                checked={form.submissionType === 'link'}
                onChange={handleChange}
                required
              />
              Link
            </label>
          </div>
          <div className="file-upload">
            <label>
              Upload Answer Key
              <input
                type="file"
                name="answerKey"
                onChange={handleChange}
              />
            </label>
            <label>
              Upload Rubric
            <input
              type="file"
              name="rubric"
              onChange={handleChange}
            />
            </label>
          </div>
          <label>
            AI Prompt
            <textarea
              name="aiPrompt"
              value={form.aiPrompt}
              onChange={handleChange}
              required
            />
            <p>AI checker will use this prompt for grading your student's work. You may adjust the AI's leniency for example </p>
          </label>
          <div className="date-fields">
            <label>
              Available From
              <input
                type="date"
                name="availableFrom"
                value={form.availableFrom}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Until
              <input
                type="date"
                name="availableTo"
                value={form.availableTo}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Max Score
              <input
                type="number"
                name="maxScore"
                value={form.maxScore}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
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

export default AddAssignmentModal;