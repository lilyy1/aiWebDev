const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const announcementController = require('../src/controllers/announcementController');
const { Announcement } = require('../src/models');
require('dotenv').config({ path: '.env.test' });

jest.mock('../src/models', () => {
  const mockAnnouncementInstance = {
    announcementid: 1,
    title: 'Test Announcement',
    content: 'This is a test announcement',
    courseid: 1,
    dateposted: new Date(),
    save: jest.fn().mockResolvedValue(this),
  };
  const mockAnnouncementModel = {
    create: jest.fn().mockResolvedValue(mockAnnouncementInstance),
    findAll: jest.fn().mockResolvedValue([mockAnnouncementInstance]),
    findByPk: jest.fn().mockResolvedValue(mockAnnouncementInstance),
    destroy: jest.fn().mockResolvedValue(1),
  };
  return { Announcement: mockAnnouncementModel };
});

const app = express();
app.use(bodyParser.json());
app.post('/api/announcements/create-announcement', announcementController.createAnnouncement);
app.get('/api/announcements/announcements-page/1', announcementController.getAnnouncements);
app.get('/api/announcements/:id', announcementController.getAnnouncementById);
app.put('/api/announcements/:id', announcementController.updateAnnouncement); 
app.delete('/api/announcements/:id', announcementController.deleteAnnouncement);

describe('Announcement Controller', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('POST /api/announcements/create-announcement', () => {
    it('should create a new announcement', async () => {
      const newAnnouncement = {
        title: 'New Announcement',
        description: 'Announcement description',
      };

      const res = await request(app)
        .post('/api/announcements/create-announcement')
        .send(newAnnouncement);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('announcementid');
      expect(res.body).toHaveProperty('title', 'Test Announcement');
      expect(res.body).toHaveProperty('content', 'This is a test announcement');
    });

    it('should return 500 if there is an error', async () => {
      Announcement.create.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/announcements/create-announcement')
        .send({
          title: 'New Announcement',
          description: 'Announcement description',
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Error creating announcement');
    });
  });

  describe('GET /api/announcements/announcements-page/', () => {
    it('should return announcements', async () => {
        const res = await request(app).get('/api/announcements/announcements-page/1');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(0);
    });
    it('should return 500 if there is an error', async () => {
      Announcement.findAll.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/announcements/announcements-page/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Database error');
    });
  });

  describe('GET /api/announcements/:id', () => {
    it('should return an announcement by ID', async () => {
      const res = await request(app).get('/api/announcements/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('announcementid', 1);
      expect(res.body).toHaveProperty('title', 'Test Announcement');
      expect(res.body).toHaveProperty('content', 'This is a test announcement');
    });

    it('should return 404 if the announcement does not exist', async () => {
      Announcement.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/api/announcements/999');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Announcement not found');
    });

    it('should return 500 if there is an error', async () => {
      Announcement.findByPk.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/announcements/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Error fetching announcement');
    });
  });

  describe('PUT /api/announcements/:id', () => {
        it('should update an announcement for a valid ID', async () => {
          const updatedAnnouncementData = {
            title: 'Updated Announcement',
            content: 'Updated content',
          };
    
          const mockUpdatedAnnouncement = {
            ...updatedAnnouncementData,
            announcementid: 1,
            courseid: 1,
            dateposted: new Date(),
          };
    
          Announcement.findByPk.mockResolvedValue({
            ...mockUpdatedAnnouncement,
            save: jest.fn().mockResolvedValue(mockUpdatedAnnouncement),
          });
    
          const res = await request(app)
            .put('/api/announcements/1')
            .send(updatedAnnouncementData);
    
          expect(res.statusCode).toEqual(200);
          expect(res.body).toHaveProperty('title', 'Updated Announcement');
          expect(res.body).toHaveProperty('content', 'Updated content');
        });
    
        it('should return 404 if the announcement does not exist', async () => {
          Announcement.findByPk.mockResolvedValue(null);
    
          const res = await request(app)
            .put('/api/announcements/999')
            .send({
              title: 'Updated Announcement',
              content: 'Updated content',
            });
    
          expect(res.statusCode).toEqual(404);
          expect(res.body).toHaveProperty('message', 'Announcement not found');
        });
    
        it('should return 500 if there is an error', async () => {
          Announcement.findByPk.mockRejectedValue(new Error('Database error'));
    
          const res = await request(app)
            .put('/api/announcements/1')
            .send({
              title: 'Updated Announcement',
              content: 'Updated content',
            });
    
          expect(res.statusCode).toEqual(500);
          expect(res.body).toHaveProperty('error', 'Error updating announcement');
        });
      });

  describe('DELETE /api/announcements/:id', () => {
    it('should delete an announcement', async () => {
      const res = await request(app).delete('/api/announcements/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Announcement deleted');
    });

    it('should return 404 if the announcement does not exist', async () => {
      Announcement.destroy.mockResolvedValue(0); // Mock no rows affected

      const res = await request(app).delete('/api/announcements/1');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Announcement not found');
    });

    it('should return 500 if there is an error', async () => {
      Announcement.destroy.mockRejectedValue(new Error('Database error'));

      const res = await request(app).delete('/api/announcements/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Error deleting announcement');
    });
  });
});