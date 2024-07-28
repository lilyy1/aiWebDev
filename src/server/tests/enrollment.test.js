const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { Enrollment, User, Course } = require('../src/models');
const { addEnrollment, deleteEnrollment } = require('../src/controllers/enrollmentController');
require('dotenv').config({ path: '.env.test' });

jest.mock('../src/models', () => {
  const mockUserInstance = {
    userid: 1,
    firstname: 'John',
    lastname: 'Doe',
    email: 'test@example.com'
  };

  const mockCourseInstance = {
    courseid: 1,
    title: 'Test Course'
  };

  const mockEnrollmentInstance = {
    enrollmentid: 1,
    userid: 1,
    courseid: 1,
    enrollmentdate: new Date(),
    toJSON: function() { return this; }
  };

  const mockUserModel = {
    findOne: jest.fn().mockResolvedValue(mockUserInstance)
  };

  const mockCourseModel = {
    findByPk: jest.fn().mockResolvedValue(mockCourseInstance)
  };

  const mockEnrollmentModel = {
    create: jest.fn().mockResolvedValue(mockEnrollmentInstance),
    destroy: jest.fn().mockResolvedValue(1) // For deleteEnrollment test
  };

  return {
    User: mockUserModel,
    Course: mockCourseModel,
    Enrollment: mockEnrollmentModel
  };
});

const app = express();
app.use(bodyParser.json());
app.post('/api/enrollments', addEnrollment);
app.delete('/api/enrollments/:userid', deleteEnrollment);

describe('Enrollment Controller', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('POST /api/enrollments', () => {
    it('should create a new enrollment', async () => {
      const newEnrollment = {
        email: 'test@example.com',
        courseid: 1
      };

      const res = await request(app)
        .post('/api/enrollments')
        .send(newEnrollment);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('enrollmentid');
      expect(res.body).toHaveProperty('userid', 1);
      expect(res.body).toHaveProperty('courseid', 1);
      expect(res.body.user).toHaveProperty('firstname', 'John');
      expect(res.body.user).toHaveProperty('lastname', 'Doe');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return 404 if user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/enrollments')
        .send({ email: 'nonexistent@example.com', courseid: 1 });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should return 404 if course is not found', async () => {
      User.findOne.mockResolvedValue({ userid: 1, firstname: 'John', lastname: 'Doe', email: 'test@example.com' });
      Course.findByPk.mockResolvedValue(null); // Ensure this returns null

      const res = await request(app)
        .post('/api/enrollments')
        .send({ email: 'test@example.com', courseid: 999 });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Course not found');
    });

    it('should return 500 if there is an internal server error', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/enrollments')
        .send({ email: 'test@example.com', courseid: 1 });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Internal server error');
    });
  });

  describe('DELETE /api/enrollments/:userid', () => {
    it('should delete an enrollment', async () => {
      const res = await request(app).delete('/api/enrollments/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Enrollment deleted successfully');
    });

    it('should return 404 if the enrollment does not exist', async () => {
      Enrollment.destroy.mockResolvedValue(0); // Mock no rows affected

      const res = await request(app).delete('/api/enrollments/1');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Enrollment not found');
    });

    it('should return 500 if there is an internal server error', async () => {
      Enrollment.destroy.mockRejectedValue(new Error('Database error'));

      const res = await request(app).delete('/api/enrollments/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Internal server error');
    });
  });
});
