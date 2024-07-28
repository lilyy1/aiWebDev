import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const FullScreenContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #4169E1 0%, #ffffff 100%);
  background-size: 200% 200%;
  animation: ${backgroundAnimation} 15s ease-in-out infinite;
`;

const MainContentContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.6);
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  max-width: 700px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 30px;
  }

  @media (max-width: 576px) {
    padding: 20px;
  }
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #ffffff;
  animation: slideInFromLeft 1s ease-out;

  @media (max-width: 768px) {
    font-size: 36px;
  }

  @media (max-width: 576px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  font-size: 26px;
  color: #ffffff;
  margin-bottom: 40px;
  animation: slideInFromRight 1s ease-out;

  @media (max-width: 768px) {
    font-size: 22px;
  }

  @media (max-width: 576px) {
    font-size: 18px;
  }
`;

const ButtonGroup = styled.div`
  .btn {
    font-size: 18px;
    margin: 10px;
    padding: 10px 20px;
    transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out;

    &:hover {
      transform: scale(1.1);
      background-color: #104e8b;
    }
  }

  .btn-primary {
    background-color: #1e90ff;
    border: none;
  }

  .btn-secondary {
    background-color: #d6d6ea !important;
    border: none;
    color: black !important;
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

function MainContent() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <>
      <GlobalStyle />
      <FullScreenContainer>
        <MainContentContainer>
          <Title>AIDE</Title>
          <Subtitle>Welcome to AIDE, your AI-enabled Web Development Learning platform.</Subtitle>
          <ButtonGroup>
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/register" className="btn btn-secondary">Sign Up</Link>
          </ButtonGroup>
        </MainContentContainer>
      </FullScreenContainer>
    </>
  );
}

export default MainContent;

  
