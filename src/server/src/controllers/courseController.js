const { Course, Enrollment, User, Role } = require('../models');

const getCourseDetails = async (req, res) => {
  const { courseid } = req.params;
  console.log("courseid backend:", courseid);
  try {
    const course = await Course.findOne({ where: { courseid: courseid } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    let numberOfStudents;
    try {
      // Use Sequelize model associations to count the number of students enrolled in the course
      numberOfStudents = await Enrollment.count({
        where: { courseid: courseid },
        include: [{
          model: User,
          attributes: [],
          include: [{
            model: Role,
            attributes: [],
            where: { rolename: 'Student' }
          }]
        }]
      });
    } catch (countError) {
      console.error('Error counting enrolled students:', countError.message);
      // Respond with a generic error message
      // Consider logging the detailed error for debugging purposes
      return res.status(500).json({ error: 'Error fetching enrollment details' });
    }
    console.log("number of students", numberOfStudents);
    res.json({ course: course.toJSON(), numberOfStudents });
  } catch (err) {
    console.error('Error fetching course details:', err.message);
    // It's good practice to avoid sending the raw error message to the client in a production environment
    res.status(500).json({ error: 'An error occurred while fetching course details' });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCourseDetails,
  getAllCourses,
};