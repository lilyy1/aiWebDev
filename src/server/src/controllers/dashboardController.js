const { Course, Announcement, Assignment, Enrollment } = require('../models');
const jwt = require('jsonwebtoken'); // Include JWT to match ProfileController style
require('dotenv').config({ path: '.env' }); // Ensure environment variables are loaded

// Function to get course details for a user
const getCourse = async (req, res) => {
  const {courseId} = req.params;
  try {
    // const enrollment = await Enrollment.findOne({ where: { userid: userid } });
    // if (!enrollment) {
    //   return res.status(404).json({ error: 'Enrollment not found' });
    // }
    const course = await Course.findOne({ where: { courseid: courseId } });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAnnouncements = async (req, res) => {
  //const userId = req.params.id;
  const {courseId}=req.params;
  try {
    // const enrollment = await Enrollment.findOne({ where: { courseid: CourseId } });
    // if (!enrollment) {
    //   return res.status(404).json({ error: 'Enrollment not found' });
    // }
    const announcements = await Announcement.findAll({ where: { courseid: courseId } });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAssignments = async (req, res) => {
  const userId = req.params.id;
  try {
    const enrollment = await Enrollment.findOne({ where: { UserID: userId } });
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    const assignments = await Assignment.findAll({ where: { CourseID: enrollment.CourseID } });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCourse,
  getAnnouncements,
  getAssignments,
};