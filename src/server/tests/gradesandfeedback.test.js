const request = require('supertest');
const express = require('express');
const { releaseGrades, modifyGradeAndFeedback, viewGrades } = require('../src/controllers/gradesController');
const { Assignment, Enrollment, Submission } = require('../src/models');

const app = express();

app.use(express.json());
app.put('/api/release-grades/:assignmentid', releaseGrades);
app.put('/api/edit-grades/:submissionId', modifyGradeAndFeedback);
app.get('/api/view-grades', viewGrades);

jest.mock('../src/models', () => ({
  Assignment: {
    findByPk: jest.fn(),
    prototype: {
      save: jest.fn(),
    },
  },
  Enrollment: {
    findAll: jest.fn(),
  },
  Submission: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    bulkCreate: jest.fn(),
    prototype: {
      save: jest.fn(),
    },
  },
}));

describe('Grades Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('releaseGrades', () => {
    it('should return 404 if assignment is not found', async () => {
      Assignment.findByPk.mockResolvedValue(null);
      
      const response = await request(app).put('/api/release-grades/1');
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Assignment not found' });
    });

    it('should release grades successfully', async () => {
      Assignment.findByPk.mockResolvedValue({ 
        courseid: 1, 
        gradesreleased: false, 
        save: jest.fn()
      });
      Enrollment.findAll.mockResolvedValue([{ userid: 1 }, { userid: 2 }]);
      Submission.findAll.mockResolvedValue([{ userid: 1 }]);

      const response = await request(app).put('/api/release-grades/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Grades released successfully' });
      expect(Submission.bulkCreate).toHaveBeenCalledWith([
        {
          assignmentid: '1',
          userid: 2,
          submissiondate: expect.any(Date),
          contenttype: 'html',
          content: '',
          grade: 0,
          feedback: 'No submission',
        }
      ]);
    });

    it('should handle server errors', async () => {
      Assignment.findByPk.mockImplementation(() => { throw new Error('DB Error') });

      const response = await request(app).put('/api/release-grades/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });

  describe('modifyGradeAndFeedback', () => {
    it('should return 404 if submission is not found', async () => {
      Submission.findByPk.mockResolvedValue(null);
      
      const response = await request(app).put('/api/edit-grades/1', {
        grade: 15,
        feedback: 'Great job!',
      });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Submission not found' });
    });

    it('should update grade and feedback successfully', async () => {
      Submission.findByPk.mockResolvedValue({ 
        grade: 0, 
        feedback: '', 
        save: jest.fn()
      });

      const response = await request(app).put('/api/edit-grades/1', {
        grade: 15,
        feedback: 'Great job!',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Grade and feedback updated successfully' });
    });

    it('should handle server errors', async () => {
      Submission.findByPk.mockImplementation(() => { throw new Error('DB Error') });

      const response = await request(app).put('/api/edit-grades/1', {
        grade: 15,
        feedback: 'Great job!',
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'An error occurred', details: 'DB Error' });
    });

    it('should update average grade when grade and feedback are modified', async () => {
      const mockAssignment = {
        assignmentid: 1,
        averagescore: 0,
        save: jest.fn(),
      };
  
      Submission.findByPk
        .mockResolvedValueOnce({ submissionid: 1, assignmentid: 1, grade: 0, feedback: '', save: jest.fn() }) // First call
        .mockResolvedValueOnce({ submissionid: 1, assignmentid: 1, grade: 15, feedback: 'Great job!', save: jest.fn() }); // Second call
  
      Submission.findAll.mockResolvedValue([{ grade: 15 }]);
      Assignment.findByPk.mockResolvedValue(mockAssignment);
  
      const response = await request(app).put('/api/edit-grades/1').send({
        grade: 15,
        feedback: 'Great job!',
      });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Grade and feedback updated successfully' });
      expect(mockAssignment.save).toHaveBeenCalled();
      expect(mockAssignment.averagescore).toBe(15);
    });
  });
  describe('viewGrades', () => {
    it('should return grades for the user successfully', async () => {
      const mockSubmissions = [
        {
          submissionid: 1,
          assignmentid: 1,
          grade: 95,
          feedback: 'Great job!',
          userid: 1,
          assignment: {
            assignmentname: 'Assignment 1',
            maxscore: 100,
            enddate: new Date(),
            gradesreleased: true,
          },
          toJSON: function() { return this; },
        },
        {
          submissionid: 2,
          assignmentid: 2,
          grade: null,
          feedback: null,
          userid: 1,
          assignment: {
            assignmentname: 'Assignment 2',
            maxscore: 100,
            enddate: new Date(),
            gradesreleased: false,
          },
          toJSON: function() { return this; },
        }
      ];

      Submission.findAll.mockResolvedValue(mockSubmissions);

      const response = await request(app).get('/api/view-grades').query({ userid: 1 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          submissionid: 1,
          assignmentid: 1,
          grade: 95,
          feedback: 'Great job!',
          userid: 1,
          assignment: {
            assignmentname: 'Assignment 1',
            maxscore: 100,
            enddate: expect.any(String),
            gradesreleased: true,
          },
          status: 'Submitted',
        },
        {
          submissionid: 2,
          assignmentid: 2,
          grade: null,
          feedback: null,
          userid: 1,
          assignment: {
            assignmentname: 'Assignment 2',
            maxscore: 100,
            enddate: expect.any(String),
            gradesreleased: false,
          },
          status: 'Pending',
        }
      ]);
    });

    it('should handle server errors', async () => {
      Submission.findAll.mockImplementation(() => { throw new Error('DB Error') });

      const response = await request(app).get('/api/view-grades').query({ userid: 1 });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });
});
