import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import styled, { createGlobalStyle, keyframes } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
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
  height: 100vh;
  background: linear-gradient(135deg, #4169E1 0%, #ffffff 100%);
  background-size: 200% 200%;
  animation: ${backgroundAnimation} 15s ease-in-out infinite;
`;

const LoginContainer = styled(Container)`
  padding: 40px;
  border-radius: 10px;
  max-width: 600px;
  margin: 0 auto;

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
  color: #ffffff;
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
  color: #ffffff;
  animation: ${slideInFromRight} 1s ease-out !important;

  @media (max-width: 768px) {
    font-size: 22px;
  }

  @media (max-width: 576px) {
    font-size: 18px;
  }
`;

const StyledForm = styled(Form)`
  background-color: transparent;
  padding: 20px;
  border-radius: 5px;
  color: #ffffff;

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

const Login = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

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
    } else if (form.password.length < 8) {
      isValid = false;
      errors.password = 'Password must be at least 8 characters';
    }

    setErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await fetch(`/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });

        const result = await response.json();
        if (response.ok) {
          localStorage.setItem('token', result.token);
          navigate('/dashboard');
        } else {
          setErrors({
            ...errors,
            login: 'Incorrect email or password',
          });
          console.error('Failed to login:', result);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <>
      <GlobalStyle />
      <FullScreenContainer>
        <LoginContainer>
          <FormTitle>AIDE</FormTitle>
          <FormSubtitle>Sign In</FormSubtitle>
          <StyledForm onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                placeholder="Enter your email"
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
            {errors.login && <p className="alert alert-danger">{errors.login}</p>}
            <StyledButton type="submit">Sign In</StyledButton>
          </StyledForm>
          <div className="mt-3 text-left">
            <span>Don't have an account? </span>
            <Link to="/register">Sign up</Link>
          </div>
          <div className="mt-3 text-left">
            <span>Forgot Your Password? </span>
            <Link to="/forgot-password">Forgot Password</Link>
          </div>
        </LoginContainer>
      </FullScreenContainer>
    </>
  );
};

export default Login;





