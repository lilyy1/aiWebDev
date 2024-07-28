const { Enrollment, User, Course } = require('../models');

const deleteEnrollment = async (req, res) => {
  const { userid } = req.params;
  try {
    const result = await Enrollment.destroy({ where: { userid } });
    if (result === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    res.status(200).json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addEnrollment = async (req, res) => {
  const { email, courseid } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    const course = await Course.findByPk(courseid);

    if (!course) {
      console.log('Course not found for courseID:', courseid);
      return res.status(404).json({ message: 'Course not found' });
    }

    // Log the user details
    console.log('User details:', user);

    const enrollment = await Enrollment.create({
      userid: user.userid,  
      courseid: course.courseid,  
      enrollmentdate: new Date() // Optional if using default value
    });

    // Include the user details in the response
    const response = {
      ...enrollment.toJSON(),
      user: {
        firstname: user.firstname || 'N/A',
        lastname: user.lastname || 'N/A',
        email: user.email
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error adding student:', error);
    if (error.errors) {
      error.errors.forEach(err => console.error(err.message));
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = {
  deleteEnrollment,
  addEnrollment,
};
