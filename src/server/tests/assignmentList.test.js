const { getAssignmentListByCourseId } = require('../src/controllers/assignmentController');
const { Assignment, Submission } = require('../src/models');
const jwt = require('jsonwebtoken');
const path = require('path');
const Minio = require('minio');
const minioClient = require('../src/config/minio');
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const assignmentController = require('../src/controllers/assignmentController');
require('dotenv').config({ path: '.env.test' });

jest.mock('../src/models', () => {
  const mockAssignmentInstance = {
    assignmentid: 1,
    title: 'Test Assignment',
    courseid: 1,
    save: jest.fn().mockResolvedValue(this),
  };
  const mockAssignmentModel = {
    create: jest.fn().mockResolvedValue(mockAssignmentInstance),
    findOne: jest.fn().mockResolvedValue(mockAssignmentInstance),
    findAll: jest.fn().mockResolvedValue([mockAssignmentInstance]),
    findByPk: jest.fn().mockResolvedValue(mockAssignmentInstance),
    destroy: jest.fn().mockResolvedValue(1),
  };
  const mockSubmissionInstance = {
    submissionid: 1,
    assignmentid: 1,
    userid: 1,
    toJSON: jest.fn().mockReturnValue({ submissionid: 1 }),
  };
  const mockSubmissionModel = {
    findOne: jest.fn().mockResolvedValue(mockSubmissionInstance),
    findAll: jest.fn().mockResolvedValue([mockSubmissionInstance]),
    destroy: jest.fn().mockResolvedValue(1),
  };
  return { Assignment: mockAssignmentModel, Submission: mockSubmissionModel };
});

const app = express();
app.use(bodyParser.json());
app.delete('/api/assignments-page/assignments/:id', assignmentController.deleteAssignment);

jest.mock('minio', () => {
  return {
    Client: jest.fn(() => ({
      bucketExists: jest.fn((bucket, callback) => callback(null, true)),
      makeBucket: jest.fn((bucket, region, callback) => callback(null)),
    })),
  };
});

jest.mock('jsonwebtoken');

describe('Assignment Controller', () => {
  let req, res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    req = {
      body: {},
      params: {},
      query: {},
      files: {},
    };
  });

  describe('getAssignmentListByCourseId', () => {
    it('should return assignment list by course ID', async () => {
      req.query.courseid = 1;
      req.query.userid = 1;
      Assignment.findAll.mockResolvedValueOnce([{
        assignmentid: 1,
        toJSON: jest.fn().mockReturnValue({ assignmentid: 1 }),
      }]);
      Submission.findOne.mockResolvedValueOnce(null);

      await getAssignmentListByCourseId(req, res);

      expect(res.json).toHaveBeenCalledWith([{ assignmentid: 1, submission: null }]);
    });

    it('should return error if course ID is not provided', async () => {
      await getAssignmentListByCourseId(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Course ID is required' });
    });

    it('should handle server errors', async () => {
      req.query.courseid = '1';
      Assignment.findAll.mockRejectedValueOnce(new Error('Database error'));

      await getAssignmentListByCourseId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Server error',
        message: 'Database error',
        name: 'Error',
      });
    });
  });

  describe('DELETE /api/assignments-page/assignments/:id', () => {
    it('should delete an assignment', async () => {
      const res = await request(app).delete('/api/assignments-page/assignments/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Assignment deleted');
    });

    it('should return 404 if the assignment does not exist', async () => {
      Assignment.destroy.mockResolvedValue(0); // Mock no rows affected

      const res = await request(app).delete('/api/assignments-page/assignments/1');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Assignment not found');
    });

    it('should return 500 if there is an error', async () => {
      Assignment.destroy.mockRejectedValue(new Error('Database error'));

      const res = await request(app).delete('/api/assignments-page/assignments/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Error deleting assignment');
    });
  });
});
