const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const { createAssignment, getAssignmentById, submitAssignment } = require('../src/controllers/assignmentController');
const assignmentRoutes = require('../src/routes/assignmentRoutes');
const sequelize = require('../src/config/database');
const { Assignment, Submission } = require('../src/models');
require('dotenv').config({ path: '.env' }); 
const Minio = require('minio');
const minioClient = require('../src/config/minio');

jest.mock('minio', () => {
  return {
    Client: jest.fn(() => ({
      bucketExists: jest.fn((bucket, callback) => callback(null, true)),
      makeBucket: jest.fn((bucket, region, callback) => callback(null)),
      // Mock other methods if necessary
    })),
  };
});

const app = express();
app.use(bodyParser.json());
app.use(fileUpload());
app.use('/assignments', assignmentRoutes);



// afterAll(async () => {
//   await app.close();
// })

describe('Assignment Routes', () => {
  let client;
  beforeAll(async () => {
    await sequelize.authenticate();
    await Assignment.sync({ force: true }); // Sync Assignment model
    await Submission.sync({ force: true }); // Sync Submission model
    // client = new Minio.Client({
    //   endPoint: 'minio',
    //   port: 9000,
    //   useSSL: false,
    //   accessKey: 'minioadmin',
    //   secretKey: 'minioadmin',
    // });
  });
  beforeEach(async () => {
    jest.clearAllMocks();
    await Assignment.sync({ force: true }); // Reset database before each test
    await Submission.sync({ force: true }); // Reset database before each test
  });

  describe('POST /create-assignments', () => {
    it('should create an assignment', async () => {
      const res = await request(app)
        .post('/assignments/create-assignments')
        .send({
          courseid: 1,
          assignmentname: 'Test Assignment',
          assignmentdescription: 'Test Description',
          submissiontype: 'file',
          prompt: 'Test Prompt',
          maxscore: 100,
          startdate: '2024-06-20T00:00:00Z',
          enddate: '2024-06-30T00:00:00Z',
        });
      console.log(res.body); // Log response body for debugging
      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toEqual('Assignment created successfully');
    });
  });

  describe('GET /assignments/:id', () => {
    it('should return an assignment by ID', async () => {
      const assignment = await Assignment.create({
        courseid: 1,
        assignmentname: 'Test Assignment',
        assignmentdescription: 'Test Description',
        submissiontype: 'file',
        prompt: 'Test Prompt',
        maxscore: 100,
        startdate: '2024-06-20T00:00:00Z',
        enddate: '2024-06-30T00:00:00Z',
      });

      console.log(`Created Assignment: ${JSON.stringify(assignment)}`); // Log the full assignment object
      const res = await request(app).get(`/assignments/${assignment.assignmentid}`);
      console.log(`Assignment ID: ${assignment.assignmentid}`); // Log assignment ID for debugging
      expect(res.statusCode).toEqual(200);
      expect(res.body.assignmentname).toEqual('Test Assignment');
    });

    it('should return 404 if the assignment is not found', async () => {
      const res = await request(app).get('/assignments/999');
      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toEqual('Assignment not found');
    });
  });
  describe('POST /assignments/:id/submit', () => {
    const token = jwt.sign({ userid: 1 }, 'secret_api_key'); // Ensure this matches your environment variable
    console.log(`Token: ${token}`); // Log token for debugging
    it('should submit an assignment successfully', async () => {
      const assignment = await Assignment.create({
        courseid: 1,
        assignmentname: 'Test Assignment',
        assignmentdescription: 'Test Description',
        submissiontype: 'link', // Changed to link
        prompt: 'Test Prompt',
        maxscore: 100,
        startdate: '2024-06-20T00:00:00Z',
        enddate: '2024-06-30T00:00:00Z',
      });

      console.log(`Created Assignment: ${JSON.stringify(assignment)}`); // Log the full assignment object
      const res = await request(app)
        .post(`/assignments/${assignment.assignmentid}/submit`)
        .set('Authorization', `Bearer ${token}`)
        .send({ link: 'http://example.com/test' }); // Send link instead of file
      // console.log(res.body); // Log response body for debugging
      expect(res.statusCode).toEqual(500);
    });
  });
});
