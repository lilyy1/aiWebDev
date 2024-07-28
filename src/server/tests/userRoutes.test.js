const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('../src/routes/userRoutes');
const { User, Enrollment } = require('../src/models');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.test' });
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;
jest.mock('../src/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  Enrollment: {
    findOne: jest.fn(),
    destroy: jest.fn(),
  },
  RoleRequest: {
    destroy: jest.fn(),
  },
}));
jest.mock('bcryptjs');
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const app = express();
app.use(bodyParser.json());
app.use('/', userRoutes);

describe('User Routes', () => {
  afterEach(async () => {
    jest.clearAllMocks();
    await User.destroy({ where: {}, truncate: true });
  });

  describe('POST /register', () => {
    it('should return an error if first name is not provided', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          lastname: 'User',
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'First Name is required');
    });

    it('should return an error if last name is not provided', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          firstname: 'Test',
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Last Name is required');
    });

    it('should not register a user if email already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'test@example.com' });
      const res = await request(app)
        .post('/register')
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Email already exists');
    });

    it('should register a new user', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        passwordhash: hashedPassword,
        roleid: 1,
      });

      const res = await request(app)
        .post('/register')
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('email', 'test@example.com');
      expect(res.body).toHaveProperty('firstname', 'Test');
      expect(res.body).toHaveProperty('lastname', 'User');
    });

    it('should handle server errors', async () => {
      User.findOne.mockRejectedValue(new Error('Internal server error'));

      const res = await request(app)
        .post('/register')
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Internal server error');
    });

    it('should return an error if password is not provided', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'test@example.com',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Password is required');
    });

    it('should return an error if email is not provided', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          firstname: 'Test',
          lastname: 'User',
          password: 'Password123!',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Email is required');
    });

    it('should return an error if neither email nor password is provided', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          firstname: 'Test',
          lastname: 'User',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Email and Password are required');
    });

    it('should return an error if email format is invalid', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'invalidEmail',
          password: 'Password123!',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Invalid email format');
    });

    it('should return an error if password does not meet strength requirements', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'test@example.com',
          password: 'weak',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Password does not meet strength requirements');
    });
  });

  describe('POST /login', () => {
    it('should return an error if email is not provided', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          password: 'Password123!',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Email and Password are required');
    });

    it('should return an error if password is not provided', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Email and Password are required');
    });

    it('should return an error if user does not exist', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'User does not exist');
    });

    it('should handle server errors', async () => {
      User.findOne.mockRejectedValue(new Error('Internal server error'));

      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Internal server error');
    });

    it('should log in the user successfully', async () => {
      const mockUser = {
        userid: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        passwordhash: 'hashedpassword',
        roleid: 1
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      Enrollment.findOne.mockResolvedValue({ courseid: 101 });
      jwt.sign.mockReturnValue('mockToken');

      const res = await request(app)
        .post('/login')
        .send({ email: 'john.doe@example.com', password: 'Password123!' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', 'john.doe@example.com');
      expect(res.body).toHaveProperty('token', 'mockToken');
    });

    describe('GET /students', () => {
      it('should return a list of all students', async () => {
        const mockStudents = [
          {
            userid: 1,
            firstname: 'John',
            lastname: 'Doe',
            email: 'john.doe@example.com',
            enrollment: {
              courseid: 101,
            },
          },
          {
            userid: 2,
            firstname: 'Jane',
            lastname: 'Doe',
            email: 'jane.doe@example.com',
            enrollment: {
              courseid: 102,
            },
          },
        ];

        User.findAll.mockResolvedValue(mockStudents);

        const res = await request(app).get('/students');

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toHaveProperty('userid', 1);
        expect(res.body[0]).toHaveProperty('firstname', 'John');
        expect(res.body[0]).toHaveProperty('lastname', 'Doe');
        expect(res.body[0]).toHaveProperty('email', 'john.doe@example.com');
        expect(res.body[0].enrollment).toHaveProperty('courseid', 101);
      });

      it('should return a server error if something goes wrong', async () => {
        User.findAll.mockRejectedValue(new Error('Internal server error'));

        const res = await request(app).get('/students');

        expect(res.statusCode).toEqual(500);
        expect(res.body).toHaveProperty('error', 'Server error');
      });
    });
    describe('GET /users', () => {
      it('should return a list of all users', async () => {
        const mockUsers = [
          {
            userid: 1,
            firstname: 'John',
            lastname: 'Doe',
            email: 'john.doe@example.com',
            role: { rolename: 'Student' },
            enrollment: {
              courseid: 101,
            },
          },
          {
            userid: 2,
            firstname: 'Jane',
            lastname: 'Doe',
            email: 'jane.doe@example.com',
            role: { rolename: 'Teacher' },
            enrollment: {
              courseid: 102,
            },
          },
        ];
    
        User.findAll.mockResolvedValue(mockUsers);
    
        const res = await request(app).get('/users');
    
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toHaveProperty('userid', 1);
        expect(res.body[0]).toHaveProperty('firstname', 'John');
        expect(res.body[0]).toHaveProperty('lastname', 'Doe');
        expect(res.body[0]).toHaveProperty('email', 'john.doe@example.com');
        expect(res.body[0]).toHaveProperty('role', 'Student');
        expect(res.body[0].enrollment).toHaveProperty('courseid', 101);
      });
    
      it('should return a server error if something goes wrong', async () => {
        User.findAll.mockRejectedValue(new Error('Internal server error'));
    
        const res = await request(app).get('/users');
    
        expect(res.statusCode).toEqual(500);
        expect(res.body).toHaveProperty('error', 'Server error');
      });
    });
    

    

    describe('PUT /users/:userid', () => {
      it('should update a user successfully', async () => {
        const mockUser = {
          userid: 1,
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          roleid: 1,
          update: jest.fn().mockResolvedValue(true),
        };
  
        User.findByPk.mockResolvedValue(mockUser);
  
        const res = await request(app)
          .put('/users/1')
          .send({
            roleid: 2,
            courseid: 101,
          });
  
        expect(res.statusCode).toBe(500);
      });
  
      it('should return 404 if user not found', async () => {
        User.findByPk.mockResolvedValue(null);
  
        const res = await request(app)
          .put('/users/1')
          .send({
            roleid: 2,
            courseid: 101,
          });
  
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'User not found');
      });
  
      it('should handle server errors', async () => {
        User.findByPk.mockRejectedValue(new Error('Internal server error'));
  
        const res = await request(app)
          .put('/users/1')
          .send({
            roleid: 2,
            courseid: 101,
          });
  
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error', 'Internal server error');
      });
    });
  
    describe('DELETE /users/:userid', () => {
      it('should delete a user successfully', async () => {
        const mockUser = {
          userid: 1,
          destroy: jest.fn().mockResolvedValue(true),
        };
  
        User.findByPk.mockResolvedValue(mockUser);
  
        const res = await request(app)
          .delete('/users/1');
  
        expect(res.statusCode).toBe(500);
      });
  
      it('should return 404 if user not found', async () => {
        User.findByPk.mockResolvedValue(null);
  
        const res = await request(app)
          .delete('/users/1');
  
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'User not found');
      });
  
      it('should handle server errors', async () => {
        User.findByPk.mockRejectedValue(new Error('Internal server error'));
  
        const res = await request(app)
          .delete('/users/1');
  
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error', 'Internal server error');
      });
    });
  });
});
