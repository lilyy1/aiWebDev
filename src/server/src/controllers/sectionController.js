const { Course, CourseInstructors, User } = require('../models');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

function generateAccessCode() {
  return uuidv4().split('-')[0];
}

const createSection = async (req, res) => {
  const { term, startDate, endDate } = req.body;
  const { userid } = req.query;

  if (!term || !startDate || !endDate || !userid) {
    return res.status(400).json({ error: 'Term, StartDate, and EndDate are required' });
  }

  if (isNaN(term)) {
    return res.status(400).json({ error: 'Term must be an integer' });
  }

  const accessCode = generateAccessCode();

  try {
    const newSection = await Course.create({
      term: parseInt(term, 10),
      startdate: startDate,
      enddate: endDate,
      accesscode: accessCode
    });

    await CourseInstructors.create({
      courseid: newSection.courseid,
      userid: userid,
      role: 'Instructor'
    });

    const user = await User.findOne({ where: { userid: userid } });

    // Generate a new token
    let token;
    try {
      const tokenPayload = { userid: userid, firstname: user.firstname, roleid: user.roleid, email: user.email, courseid: newSection.courseid };
      token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    } catch (tokenError) {
      console.error('Error generating token:', tokenError);
      return res.status(500).json({ error: 'Error generating token' });
    }

    res.status(201).json({ newSection, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSection,
};