const { createSection } = require('../src/controllers/sectionController');
const { Course, CourseInstructors, User } = require('../src/models');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env' });

// Mocking dependencies
jest.mock('../src/models', () => ({
    Course: {
      create: jest.fn()
    },
    CourseInstructors: {
      create: jest.fn()
    },
    User: {
      findOne: jest.fn()
    }
  }));
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('123e4567-e89b-12d3-a456-426614174000')
}));
jest.mock('jsonwebtoken');

describe('createSection', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { term: 202301, startDate: '2023-01-01', endDate: '2023-12-31' },
      query: { userid: 1 }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return 400 if term, startDate, endDate, or userid is missing', async () => {
    req.body.term = '';
    await createSection(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Term, StartDate, and EndDate are required' });
  });

  test('should return 400 if term is not an integer', async () => {
    req.body.term = 'notAnInt';
    await createSection(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Term must be an integer' });
  });

  test('should return 500 if there is an error creating the section', async () => {
    Course.create.mockRejectedValue(new Error('Database error'));
    await createSection(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
  });

  test('should return 500 if there is an error generating the token', async () => {
    Course.create.mockResolvedValue({ courseid: 1 });
    CourseInstructors.create.mockResolvedValue({});
    User.findOne.mockResolvedValue({ firstname: 'John', roleid: 3, email: 'john@example.com' });
    jwt.sign.mockImplementation(() => { throw new Error('Token error'); });
    await createSection(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error generating token' });
  });

  test('should return 201 with new section and token if successful', async () => {
    const newSection = { courseid: 1 };
    const user = { firstname: 'John', roleid: 3, email: 'john@example.com' };
    const token = 'jwt-token';

    Course.create.mockResolvedValue(newSection);
    CourseInstructors.create.mockResolvedValue({});
    User.findOne.mockResolvedValue(user);
    jwt.sign.mockReturnValue(token);

    await createSection(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ newSection, token });

    expect(Course.create).toHaveBeenCalledWith({
      term: 202301,
      startdate: '2023-01-01',
      enddate: '2023-12-31',
      accesscode: '123e4567'
    });

    expect(CourseInstructors.create).toHaveBeenCalledWith({
      courseid: 1,
      userid: 1,
      role: 'Instructor'
    });

    expect(User.findOne).toHaveBeenCalledWith({ where: { userid: 1 } });

    expect(jwt.sign).toHaveBeenCalledWith(
      { userid: 1, firstname: 'John', roleid: 3, email: 'john@example.com', courseid: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });  
});