import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Modal } from 'react-bootstrap';
import styled, { createGlobalStyle, keyframes } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: auto;
  }
`;

const backgroundAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const slideInFromLeft = keyframes`
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInFromRight = keyframes`
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const FullScreenContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #4169E1 0%, #ffffff 100%);
  background-size: 200% 200%;
  animation: ${backgroundAnimation} 15s ease-in-out infinite;
  padding: 20px;
  box-sizing: border-box;
`;

const RegistrationFormContainer = styled(Container)`
  padding: 40px;
  border-radius: 10px;
  max-width: 600px;
  width: 100%;
  background: transparent;

  @media (max-width: 768px) {
    padding: 30px;
  }

  @media (max-width: 576px) {
    padding: 20px;
  }
`;

const FormTitle = styled.h1`
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #4169E1;
  animation: ${slideInFromLeft} 1s ease-out !important;

  @media (max-width: 768px) {
    font-size: 36px;
  }

  @media (max-width: 576px) {
    font-size: 28px;
  }
`;

const FormSubtitle = styled.p`
  font-size: 26px;
  margin-bottom: 40px;
  animation: ${slideInFromRight} 1s ease-out !important;
  color: #000;

  @media (max-width: 768px) {
    font-size: 22px;
  }

  @media (max-width: 576px) {
    font-size: 18px;
  }
`;

const CustomInput = styled(Form.Control)`
  background-color: #fff !important;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 5px;

  @media (max-width: 768px) {
    padding: 8px;
  }

  @media (max-width: 576px) {
    padding: 6px;
  }
`;

const StyledButton = styled(Button)`
  font-size: 18px;
  margin: 10px 0;
  padding: 10px 20px;
  transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out;
  background-color: #1e90ff;
  border: none;
  width: 100%;

  &:hover {
    transform: scale(1.1);
    background-color: #104e8b;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 8px 18px;
  }

  @media (max-width: 576px) {
    font-size: 14px;
    padding: 6px 16px;
  }
`;

const FormLabel = styled(Form.Label)`
  text-align: left;
  width: 100%;
  color: #000;
`;

const StyledForm = styled(Form)`
  background-color: transparent;
  padding: 20px;
  border-radius: 5px;

  .form-group {
    margin-bottom: 15px;
    transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out !important;
  }

  .form-group label {
    font-size: 20px;
    padding-right: 4px;
    display: block;
    text-align: left;
  }

  .form-control {
    height: 40px;
    border-radius: 5px;
    transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out !important;
  }

  @media (max-width: 768px) {
    .form-group label {
      font-size: 18px;
    }

    .form-control {
      height: 35px;
    }
  }

  @media (max-width: 576px) {
    .form-group label {
      font-size: 16px;
    }

    .form-control {
      height: 30px;
    }
  }
`;

const Registration = () => {
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const validate = () => {
    let isValid = true;
    let errors = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!form.firstname) {
      isValid = false;
      errors.firstname = 'First Name is required';
    }

    if (!form.lastname) {
      isValid = false;
      errors.lastname = 'Last Name is required';
    }

    if (!form.email) {
      isValid = false;
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      isValid = false;
      errors.email = 'Email address is invalid';
    }

    if (!form.password) {
      isValid = false;
      errors.password = 'Password is required';
    } else if (!passwordRegex.test(form.password)) {
      isValid = false;
      errors.password = 'Password does not meet strength requirements. It should contain at least one lowercase letter, one uppercase letter, one number, one special character, and be at least 8 characters long.';
    }

    if (!form.confirmPassword) {
      isValid = false;
      errors.confirmPassword = 'Confirm Password is required';
    } else if (form.password !== form.confirmPassword) {
      isValid = false;
      errors.confirmPassword = 'Passwords do not match';
    }

    setErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });

        const result = await response.json();
        if (response.ok) {
          setShowSuccessModal(true);
        } else if (result.error === 'Email already exists') {
          setErrorMessage('An account with this email already exists. Please try again with a different email.');
          setShowErrorModal(true);
        } else {
          console.error('Failed to submit the form:', result);
        }
      } catch (error) {
        console.error('Error submitting the form:', error.message);
      }
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/login');
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  return (
    <>
      <GlobalStyle />
      <FullScreenContainer>
        <RegistrationFormContainer className="registration-form">
          <Row className="justify-content-center">
            <Col md={8}>
              <FormTitle className="form-title">AIDE</FormTitle>
              <FormSubtitle className="form-subtitle">Create Your Account</FormSubtitle>
              <StyledForm onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formFirstName">
                  <FormLabel>First Name</FormLabel>
                  <CustomInput
                    type="text"
                    name="firstname"
                    value={form.firstname}
                    onChange={handleChange}
                    isInvalid={!!errors.firstname}
                    className="custom-input opacity-50"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.firstname}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formLastName">
                  <FormLabel>Last Name</FormLabel>
                  <CustomInput
                    type="text"
                    name="lastname"
                    value={form.lastname}
                    onChange={handleChange}
                    isInvalid={!!errors.lastname}
                    className="custom-input opacity-50"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.lastname}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formEmail">
                  <FormLabel>Email</FormLabel>
                  <CustomInput
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    className="custom-input opacity-50"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPassword">
                  <FormLabel>Password</FormLabel>
                  <CustomInput
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                    className="custom-input opacity-50"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formConfirmPassword">
                  <FormLabel>Confirm Password</FormLabel>
                  <CustomInput
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.confirmPassword}
                    className="custom-input opacity-50"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
                <StyledButton type="submit" className="form-button">Sign Up</StyledButton>
              </StyledForm>
              <div className="mt-3 text-left">
                <span>Already have an account? </span>
                <Link to="/login">Sign in</Link>
              </div>
              <div className="mt-3 text-left">
                <span>Forgot Your Password? </span>
                <Link to="/forgot-password">Forgot Password</Link>
              </div>
            </Col>
          </Row>

          <Modal show={showSuccessModal} onHide={handleCloseSuccessModal}>
            <Modal.Header closeButton>
              <Modal.Title>Registration Successful</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Your account has been successfully created. You will be redirected to the login page.
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={handleCloseSuccessModal}>
                OK
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={showErrorModal} onHide={handleCloseErrorModal}>
            <Modal.Header closeButton>
              <Modal.Title>Registration Error</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {errorMessage}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={handleCloseErrorModal}>
                OK
              </Button>
            </Modal.Footer>
          </Modal>
        </RegistrationFormContainer>
      </FullScreenContainer>
    </>
  );
};

export default Registration;


