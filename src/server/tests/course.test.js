const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const { uploadCsv, getAccessCode, checkAccessCodeAndEmail } = require('../src/controllers/manageController');
const manageRoutes = require('../src/routes/manageRoutes');
const sequelize = require('../src/config/database');
const { Course, User, Enrollment, CourseInstructors } = require('../src/models');
require('dotenv').config({ path: '.env' });
const Minio = require('minio');
jest.mock('minio', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        bucketExists: jest.fn((bucket, callback) => {
          const buckets = {
            answerkeys: true,
            rubrics: true,
            students: true,
            submissions: true,
          };
          if (buckets[bucket]) {
            callback(null, true);
          } else {
            callback(new Error(`Bucket ${bucket} does not exist.`), false);
          }
        }),
      };
    }),
  };
});
// jest.mock('../src/models', () => ({
//   Course: {
//     sync: jest.fn(),
//     findByPk: jest.fn(),
//     create: jest.fn(),
//     update: jest.fn(),
//     findOne: jest.fn()
//   },
//   User: {
//     findByPk: jest.fn()
//   },
//   Enrollment: {
//     findOrCreate: jest.fn()
//   },
//   CourseInstructors: {
//     findOrCreate: jest.fn()
//   }
// }));

const app = express();
app.use(bodyParser.json());
app.use(fileUpload());
app.use('/manage', manageRoutes);

beforeAll(async () => {
  await sequelize.authenticate();
  await Course.sync({ force: true });
  await User.sync({ force: true });
  await Enrollment.sync({ force: true });
  await CourseInstructors.sync({ force: true });
});

describe('Manage Course Routes', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await Course.sync({ force: true });
    await User.sync({ force: true });
    await Enrollment.sync({ force: true });
    await CourseInstructors.sync({ force: true });
  });

  describe('GET /manage/access-code/:courseid', () => {
    it('should return access code for a valid course ID', async () => {
      const courseId = 1;
      const accessCode = '12345';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      // Create a course with the given access code
      await Course.create({
        courseid: courseId,
        term: 1,
        accesscode: accessCode,
        startdate: startDate,
        enddate: endDate
      });

      const res = await request(app).get(`/manage/access-code/${courseId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('accesscode', accessCode);
    });

    it('should return 404 if course not found', async () => {
      const courseId = 9999;
      const res = await request(app).get(`/manage/access-code/${courseId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Course not found');
    });

    it('should return 500 if there is a server error', async () => {
      jest.spyOn(Course, 'findByPk').mockImplementation(() => {
        throw new Error('Server error');
      });
      const courseId = 1;
      const res = await request(app).get(`/manage/access-code/${courseId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Internal server error');
    });
  });

  describe('POST /manage/check-access-code-and-email', () => {
    // it('should handle successful TA addition', async () => {
    //   const courseId = 1;
    //   const accessCode = '12345';
    //   const userId = 1;

    //   await Course.create({
    //     courseid: courseId,
    //     term: 1,
    //     startdate: new Date('2024-01-01'),
    //     enddate: new Date('2024-12-31'),
    //     accesscode: accessCode,
    //     students: 'http://example.com/students/file.csv'
    //   });

    //   const mockUser = { userid: userId, email: 'user@example.com', update: jest.fn() };
    //   const mockCourseInstructors = { findOrCreate: jest.fn().mockResolvedValue([null, true]) };
    //   const mockEnrollment = { findOrCreate: jest.fn() };

    //   jest.spyOn(User, 'findByPk').mockResolvedValue(mockUser);
    //   jest.spyOn(CourseInstructors, 'findOrCreate').mockImplementation(mockCourseInstructors.findOrCreate);
    //   jest.spyOn(Enrollment, 'findOrCreate').mockImplementation(mockEnrollment.findOrCreate);

    //   const res = await request(app)
    //     .post('/manage/check-access-code-and-email')
    //     .send({ accesscode: accessCode, userid: userId });

    //   expect(res.statusCode).toEqual(200);
    //   expect(res.body).toHaveProperty('message', 'Added as TA successfully');
    // }, 30000);

    // it('should handle successful enrollment', async () => {
    //   const courseId = 1;
    //   const accessCode = '12345';
    //   const userId = 1;

    //   await Course.create({
    //     courseid: courseId,
    //     term: 1,
    //     startdate: new Date('2024-01-01'),
    //     enddate: new Date('2024-12-31'),
    //     accesscode: accessCode,
    //     students: 'http://example.com/students/file.csv'
    //   });

    //   const mockUser = { userid: userId, email: 'user@example.com', update: jest.fn() };
    //   const mockCourseInstructors = { findOrCreate: jest.fn().mockResolvedValue([null, false]) };
    //   const mockEnrollment = { findOrCreate: jest.fn().mockResolvedValue([null, true]) };

    //   jest.spyOn(User, 'findByPk').mockResolvedValue(mockUser);
    //   jest.spyOn(CourseInstructors, 'findOrCreate').mockImplementation(mockCourseInstructors.findOrCreate);
    //   jest.spyOn(Enrollment, 'findOrCreate').mockImplementation(mockEnrollment.findOrCreate);

    //   const res = await request(app)
    //     .post('/manage/check-access-code-and-email')
    //     .send({ accesscode: accessCode, userid: userId });

    //   expect(res.statusCode).toEqual(200);
    //   expect(res.body).toHaveProperty('message', 'Enrolled successfully');
    // });

    it('should return 404 if user not found', async () => {
      const courseId = 1;
      const accessCode = '12345';
      const userId = 1;

      await Course.create({
        courseid: courseId,
        term: 1,
        startdate: new Date('2024-01-01'),
        enddate: new Date('2024-12-31'),
        accesscode: accessCode,
        students: 'http://example.com/students/file.csv'
      });

      jest.spyOn(User, 'findByPk').mockResolvedValue(null);

      const res = await request(app)
        .post('/manage/check-access-code-and-email')
        .send({ accesscode: accessCode, userid: userId });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should return 404 if access code not found', async () => {
      const userId = 1;

      jest.spyOn(User, 'findByPk').mockResolvedValue({ userid: userId, email: 'user@example.com' });
      jest.spyOn(Course, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post('/manage/check-access-code-and-email')
        .send({ accesscode: 'wrong-code', userid: userId });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Access code not found');
    });

    it('should return 500 if there is a server error', async () => {
      const courseId = 1;
      const accessCode = '12345';
      const userId = 1;

      await Course.create({
        courseid: courseId,
        term: 1,
        startdate: new Date('2024-01-01'),
        enddate: new Date('2024-12-31'),
        accesscode: accessCode,
        students: 'http://example.com/students/file.csv'
      });

      jest.spyOn(User, 'findByPk').mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/manage/check-access-code-and-email')
        .send({ accesscode: accessCode, userid: userId });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Server error');
    });
  });
});