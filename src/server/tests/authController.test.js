const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('../src/routes/authRoutes'); // Adjust the path to your auth routes
const { User } = require('../src/models');
const bcrypt = require('bcryptjs');

jest.mock('../src/models');
jest.mock('bcryptjs');

const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeAll(async () => {
    // Set up initial user data
    User.create.mockResolvedValue({
      email: 'test@example.com',
      passwordhash: 'hashedpassword',
      verificationcode: 'S1FHHQ',
    });
  });

  afterAll(async () => {
    // Clean up test data
    await User.destroy({ where: { email: 'test@example.com' } });
  });

  describe('POST /forgot-password', () => {
    it('should return a success message if email is provided', async () => {
      User.findOne.mockResolvedValue({
        email: 'test@example.com',
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Password reset code sent to your email');
    });

    it('should return an error if email is not provided', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: '' });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Email is required');
    });

    it('should return an error if no user found with the given email', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('No user found with this email');
    });
  });

  describe('POST /reset-password', () => {
    it('should reset the password if valid email and code are provided', async () => {
      User.findOne.mockResolvedValue({
        email: 'test@example.com',
        passwordhash: 'hashedpassword',
        verificationcode: 'S1FHHQ',
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          email: 'test@example.com',
          code: 'S1FHHQ',
          password: 'NewPassword123!',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Password reset successful');
    });

    it('should return an error if email, code, or password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ email: '', code: '', password: '' });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Email, code, and password are required');
    });

    it('should return an error if code or email is invalid', async () => {
      User.findOne.mockResolvedValue({
        email: 'test@example.com',
        passwordhash: 'hashedpassword',
        verificationcode: 'S1FHHQ',
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          email: 'test@example.com',
          code: 'WRONGCODE',
          password: 'NewPassword123!',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Invalid code or email');
    });
  });
});
