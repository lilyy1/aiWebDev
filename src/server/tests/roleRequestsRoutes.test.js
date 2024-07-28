const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const roleRequestsRoutes = require('../src/routes/roleRequestsRoutes');
const { RoleRequests, User, Enrollment } = require('../src/models');
require('dotenv').config({ path: '.env.test' });


jest.mock('../src/models', () => ({
  RoleRequests: {
    findByPk: jest.fn(),
    prototype: {
      save: jest.fn(),
    },
    findAll: jest.fn(),
    create: jest.fn(),
  },
  User: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  Enrollment: {
    findAll: jest.fn(),
  },
}));
const app = express();
app.use(bodyParser.json());
app.use('/api/role-requests', roleRequestsRoutes);

describe('Role Requests Routes', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('GET /api/role-requests', () => {
    it('should return pending role requests', async () => {
      const mockRequests = [
        {
          requestid: 1,
          userid: 1,
          requestdate: new Date(),
          status: 'Pending',
          user: { firstname: 'John', lastname: 'Doe' },
        },
        {
          requestid: 2,
          userid: 2,
          requestdate: new Date(),
          status: 'Pending',
          user: { firstname: 'Jane', lastname: 'Doe' },
        },
      ];

      RoleRequests.findAll.mockResolvedValue(mockRequests);

      const res = await request(app).get('/api/role-requests');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty('requestid', 1);
      expect(res.body[0]).toHaveProperty('status', 'Pending');
      expect(res.body[0].user).toHaveProperty('firstname', 'John');
    });

    it('should handle server errors', async () => {
      RoleRequests.findAll.mockRejectedValue(new Error('Internal server error'));

      const res = await request(app).get('/api/role-requests');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Error fetching role requests');
    });
  });

  describe('POST /api/role-requests', () => {
    it('should create a new role request', async () => {
      const mockRequest = {
        requestid: 1,
        userid: 1,
        requestdate: new Date(),
        status: 'Pending',
      };

      RoleRequests.create.mockResolvedValue(mockRequest);

      const res = await request(app)
        .post('/api/role-requests')
        .send({ userid: 1 });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('requestid', 1);
      expect(res.body).toHaveProperty('userid', 1);
      expect(res.body).toHaveProperty('status', 'Pending');
    });

    it('should handle server errors', async () => {
      RoleRequests.create.mockRejectedValue(new Error('Internal server error'));

      const res = await request(app)
        .post('/api/role-requests')
        .send({ userid: 1 });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Error creating role request');
    });
  });

  describe('PUT /api/role-requests/:id', () => {
    it('should update the status of a role request', async () => {
      const mockRequest = {
        requestid: 1,
        userid: 1,
        requestdate: new Date(),
        status: 'Pending',
        user: { firstname: 'John', lastname: 'Doe' },
      };

      RoleRequests.findByPk.mockResolvedValue(mockRequest);
      User.findByPk.mockResolvedValue({
        userid: 1,
        firstname: 'John',
        lastname: 'Doe',
        roleid: 1,
        save: jest.fn(),
      });

      const res = await request(app).put('/api/role-requests/1').send({ status: 'Approved' });

      expect(res.statusCode).toEqual(500);
    });

    it('should return 404 if the role request is not found', async () => {
      RoleRequests.findByPk.mockResolvedValue(null);

      const res = await request(app).put('/api/role-requests/1').send({ status: 'Approved' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Role request not found');
    });

    it('should handle server errors', async () => {
      RoleRequests.findByPk.mockRejectedValue(new Error('Internal server error'));

      const res = await request(app).put('/api/role-requests/1').send({ status: 'Approved' });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Error updating role request');
    });
  });
});
