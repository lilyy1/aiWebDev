const {Announcement} = require('../models');
const jwt = require('jsonwebtoken'); // Include JWT to match ProfileController style
require('dotenv').config({ path: '.env' });

const createAnnouncement = async (req, res) => {
  try {
    const { title, description } = req.body;
    const {courseid} = req.query;
    const datePosted = new Date(); // Set the current date and time

    const newAnnouncement = await Announcement.create({
      title: title,
      content: description,
      courseid: courseid,
      dateposted: datePosted, 
    });

    console.log('Announcement created:', newAnnouncement);
    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Error creating announcement' });
  }
};


const getAnnouncements = async (req, res) => {
  const { courseid } = req.query;
  console.log("server announcement courseid", courseid);
  try {
    const announcements = await Announcement.findAll({
      where: { courseid: courseid },
      order: [['dateposted', 'DESC']] // Sort by datePosted in descending order
    });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByPk(id);
    if (announcement) {
      res.json(announcement);
    } else {
      res.status(404).json({ message: 'Announcement not found' });
    }
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ error: 'Error fetching announcement' });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const announcement = await Announcement.findByPk(id);
    if (announcement) {
      announcement.title = title;
      announcement.content = content;
      await announcement.save();
      res.status(200).json(announcement);
      console.log('Announcement updated:', announcement);
    } else {
      res.status(404).json({ message: 'Announcement not found' });
    }
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Error updating announcement' });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Announcement.destroy({ where: { announcementid: id } });
    if (deleted) {
      res.status(200).json({ message: 'Announcement deleted' });
    } else {
      res.status(404).json({ message: 'Announcement not found' });
    }
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Error deleting announcement' });
  }
};

module.exports = { 
  createAnnouncement, getAnnouncements, 
  getAnnouncementById, deleteAnnouncement,
  updateAnnouncement 
};

