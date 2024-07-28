const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const profileController = require('../src/controllers/profileController');
const { User } = require('../src/models');
require('dotenv').config({ path: '.env.test' });

jest.mock('../src/models', () => {
  const mockUserInstance = {
    save: jest.fn().mockResolvedValue({
      userid: 1,
      firstname: 'newUser',
      lastname: 'newUser2',
      email: 'user6@gmail.com',
    }),
  };
  const mockUserModel = {
    findOne: jest.fn().mockResolvedValue(mockUserInstance),
  };
  return { User: mockUserModel };
});

const app = express();
app.use(bodyParser.json());
app.get('/api/profile/:id', profileController.getUserProfile);
app.put('/api/profile/:id', profileController.updateUserProfile);

describe('Profile Controller', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('GET /api/profile/:id', () => {
    it('should return user data for a valid ID', async () => {
      const user = {
        userid: 1,
        firstname: 'user',
        lastname: 'user',
        roleid: 1,
        email: 'user5@gmail.com',
      };

      User.findOne.mockResolvedValue(user);

      const res = await request(app).get('/api/profile/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(user);
    });

    it('should return 500 if there is an error', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/profile/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Database error');
    });
  });

  describe('PUT /api/profile/:id', () => {
    it('should update user data for a valid ID', async () => {
      const user = {
        userid: 1,
        firstname: 'user',
        lastname: 'user',
        roleid: 1,
        email: 'user5@gmail.com',
      };

      User.findOne.mockResolvedValue(user);
      user.save = jest.fn().mockResolvedValue({
        ...user,
        firstname: 'newUser',
        lastname: 'newUser2',
        email: 'user6@gmail.com'
      });

      const res = await request(app)
        .put('/api/profile/1')
        .send({
          firstname: 'newUser',
          lastname: 'newUser2',
          email: 'user6@gmail.com'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        userid: 1,
        firstname: 'newUser',
        lastname: 'newUser2',
        roleid: 1,
        email: 'user6@gmail.com'
      });
    });

    it('should return 404 if user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/profile/1')
        .send({
          firstname: 'newUser',
          lastname: 'newUser2',
          email: 'user6@gmail.com'
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'User not found');
    });

    it('should return 500 if there is an error', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/profile/1')
        .send({
          firstname: 'newUser',
          lastname: 'newUser2',
          email: 'user6@gmail.com'
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Database error');
    });
  });
});