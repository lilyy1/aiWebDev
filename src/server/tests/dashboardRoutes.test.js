const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const dashboardRoutes = require('../src/routes/dashboardRoutes');

jest.mock('../src/routes/protectedRoutes', () => ({
  authenticateToken: jest.fn((req, res, next) => next())
}));

jest.mock('../src/models', () => {
  const mockCourse = {
    findOne: jest.fn(() => Promise.resolve({
      courseid: 1,
      name: 'Introduction to Computer Science',
      description: 'A foundational course in computer science.'
    }))
  };

  const mockAnnouncements = {
    findAll: jest.fn(() => Promise.resolve([
      {
        announcementId: 1,
        title: 'Welcome to the Course',
        content: 'This is the first announcement.',
        courseid: 1
      },
      {
        announcementId: 2,
        title: 'Assignment Due Date',
        content: 'The first assignment is due next week.',
        courseid: 1
      }
    ]))
  };

  return {
    Course: mockCourse,
    Announcement: mockAnnouncements
  };
});

const app = express();
app.use(bodyParser.json());
app.use((err, req, res, next) => {
  console.error('Error in middleware', err);
  res.status(500).send('Unexpected error');
});
app.use('/', dashboardRoutes);

describe('Dashboard Routes', () => {
  it('GET /course/:courseid - success', async () => {
    const courseid = 1;
    const expectedCourse = {
      courseid: 1,
      name: 'Introduction to Computer Science',
      description: 'A foundational course in computer science.'
    };

    const response = await request(app).get(`/course/${courseid}`);
    if (response.status !== 200) {
      console.error('Response Status:', response.status);
      console.error('Response Error:', response.body); // More detailed error logging
    }
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedCourse);
  });

  it('GET /announcements-page/ - success', async () => {
    const courseid = 1;
    const expectedAnnouncements = [
      {
        announcementId: 1,
        title: 'Welcome to the Course',
        content: 'This is the first announcement.',
        courseid: 1
      },
      {
        announcementId: 2,
        title: 'Assignment Due Date',
        content: 'The first assignment is due next week.',
        courseid: 1
      }
    ];

    const response = await request(app).get(`/announcements-page/?courseid=${courseid}`);
    if (response.status !== 200) {
      console.error('Response Status:', response.status);
      console.error('Response Error:', response.body); // More detailed error logging
    }
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedAnnouncements);
  });
});
