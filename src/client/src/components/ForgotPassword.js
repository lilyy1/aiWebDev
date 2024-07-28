import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle, keyframes } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
    background: linear-gradient(135deg, #4169E1 0%, #ffffff 100%);
    display: grid;
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

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const FullScreenContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #4169E1 0%, #ffffff 100%);
  background-size: 200% 200%;
  animation: ${backgroundAnimation} 15s ease-in-out infinite;
`;

const ForgotPasswordContainer = styled(Container)`
  padding: 40px;
  border-radius: 10px;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 30px;
  }

  @media (max-width: 576px) {
    padding: 20px;
  }
`;

const ForgotPasswordTitle = styled.h2`
  font-size: 28px;
  margin-bottom: 20px;
  color: #00000;
  animation: ${slideInFromLeft} 1s ease-out;

  @media (max-width: 768px) {
    font-size: 24px;
  }

  @media (max-width: 576px) {
    font-size: 20px;
  }
`;

const ForgotPasswordForm = styled(Form)`
  animation: ${fadeIn} 1s ease-in-out, ${slideInFromRight} 1s ease-out;
  background-color: transparent;
  padding: 20px;
  border-radius: 5px;
  color: #000000;
  width: 100%;

  .form-group {
    margin-bottom: 15px;
    animation: ${slideInFromRight} 1s ease-out;
    transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out;
  }

  .form-group label {
    font-size: 20px;
    color: #000000;
    padding-right: 4px;
    display: block;
    text-align: left;
    color: #ffffff;
  }

  .form-control {
    height: 40px;
    border-radius: 5px;
    animation: ${slideInFromRight} 1s ease-out;
    transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out;
    margin-bottom: 13px;
    background-color: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.3);
    color: #ffffff;
    width: 100%;
    max-width: 100%;
  }

  @media (max-width: 768px) {
    .form-group label {
      font-size: 18px;
    }

    .form-control {
      height: 35px;
      font-size: 16px;
    }
  }

  @media (max-width: 576px) {
    .form-group label {
      font-size: 16px;
    }

    .form-control {
      height: 30px;
      font-size: 14px;
    }
  }
`;

const StyledButton = styled(Button)`
  font-size: 18px;
  margin: 10px 0;
  padding: 10px 20px;
  transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out;
  background-color: #1e90ff;
  border: none;

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

const ForgotPasswordAlert = styled(Alert)`
  font-size: 20px;
  margin-bottom: 40px;
  animation: ${slideInFromRight} 1s ease-out;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 576px) {
    font-size: 16px;
  }
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }); 

      const result = await response.json();
      if (response.ok) {
        setMessage(result.message);
        setError('');
        setShowModal(true); 
      } else {
        setError(result.error);
        setMessage('');
      }
    } catch (error) {
      setError('An error occurred while sending the request.');
      setMessage('');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate(`/reset-password?email=${encodeURIComponent(email)}`); 
  };

  return (
    <>
      <GlobalStyle />
      <FullScreenContainer>
        <ForgotPasswordContainer>
          <Row className="justify-content-md-center">
            <Col md={12}>
              <ForgotPasswordTitle>Forgot Password</ForgotPasswordTitle>
              {message && <ForgotPasswordAlert variant="success">{message}</ForgotPasswordAlert>}
              {error && <ForgotPasswordAlert variant="danger">{error}</ForgotPasswordAlert>}
              <ForgotPasswordForm onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>
                <StyledButton variant="primary" type="submit">
                  Submit
                </StyledButton>
              </ForgotPasswordForm>
            </Col>
          </Row>

          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Success</Modal.Title>
            </Modal.Header>
            <Modal.Body>Email sent successfully! Please check your email for the reset code.</Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={handleCloseModal}>
                OK
              </Button>
            </Modal.Footer>
          </Modal>
        </ForgotPasswordContainer>
      </FullScreenContainer>
    </>
  );
};

export default ForgotPassword;

