const bcrypt = require('bcryptjs');
const { User, Enrollment, CourseInstructors, Course, Role, RoleRequests} = require('../models');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env' });
const { Op } = require('sequelize');

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and Password are required' });
  }

  try {
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(400).json({ error: 'User does not exist' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordhash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }
    let courseid = null;
    // Check if the user is a student
    if (user.roleid === 1) { // Assuming roleid 1 is for students
      const enrollment = await Enrollment.findOne({ where: { userid: user.userid } });
      courseid = enrollment ? enrollment.courseid : null;
    }
    // Check if the user is an instructor or TA
    else if (user.roleid === 3 || user.roleid === 4) { // Assuming roleid 3 is for instructors and 4 for TAs
      const instructorCourse = await CourseInstructors.findOne({ where: { userid: user.userid } });
      courseid = instructorCourse ? instructorCourse.courseid : null;
    }

    const tokenPayload = { userid: user.userid, firstname: user.firstname, roleid: user.roleid, email: user.email };
    if (courseid) {
      tokenPayload.courseid = courseid;
    }
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
  



    res.status(201).json({ user, token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
const registerUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  if (!firstname) {
    return res.status(400).json({ error: 'First Name is required' });
  }
  if (!lastname) {
    return res.status(400).json({ error: 'Last Name is required' });
  }
  if (!email && !password) {
    return res.status(400).json({ error: 'Email and Password are required' });
  }
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'Password does not meet strength requirements' });
  }

  try {
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname: firstname,
      lastname: lastname,
      email: email,
      passwordhash: hashedPassword,
      roleid: 1,
      verificationcode: null,
    });

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getCourseIDForUser = async (req, res) => {
  const { userid } = req.params;

  try {
    const enrollment = await Enrollment.findOne({
      where: { userid: userid },
      include: [{
        model: User,
        where: { userid: userid }
      }]
    });

    if (!enrollment) {
      return res.status(400).json({ error: 'No enrollment found for this user' });
    }

    const courseID = enrollment.courseid;
    res.status(200).json({ courseID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getAllStudents = async (req, res) => {
  const {courseid} = req.query;
  try {
    const students = await User.findAll({
      include: [
        {
          model: Enrollment,
          where: {courseid: courseid},
          include: [Course],
          required: true,
        },
      ],
    });

    const studentData = students.map(student => ({
      userid: student.userid,
      firstname: student.firstname,
      lastname: student.lastname,
      email: student.email,
      enrollment: student.enrollment ? {
        courseid: student.enrollment.courseid,
      } : null
    }));

    res.json(studentData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        roleid: {
          [Op.ne]: 2, // Exlude admins
        },
      },
      include: [
        {
          model: Enrollment,
          include: [Course],
          required: false,
        },
        {
          model: Role,
          attributes: ['rolename'],
        },
        {
          model: CourseInstructors,
          include: [Course],
          required: false,
        },
      ],
    });

    const userData = users.map(user => ({
      userid: user.userid,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role ? user.role.rolename : 'N/A',
      enrollment: user.enrollment ? {
        courseid: user.enrollment.courseid,
      } : null,
      courseinstructors: user.courseinstructor ? {
        courseid: user.courseinstructor.courseid,
      }: null,
    }));

    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


const getUserById = async (req, res) => {
  const { userid } = req.params;
  try {
    const user = await User.findByPk(userid, {
      include: [
        { model: Role, attributes: ['rolename'] },
        { model: Enrollment, include: [Course] }
      ]
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  const { userid } = req.params;
  const { roleid, courseid } = req.body;

  try {
    const user = await User.findByPk(userid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (roleid) {
      user.roleid = roleid;
    }

    await user.save();

    if (courseid) {
      const enrollment = await Enrollment.findOne({ where: { userid } });
      if (enrollment) {
        enrollment.courseid = courseid;
        await enrollment.save();
      } else {
        await Enrollment.create({ userid, courseid });
      }
    }

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  const { userid } = req.params;

  try {
    const user = await User.findByPk(userid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await RoleRequests.destroy({ where: { userid } });
    await Enrollment.destroy({ where: { userid } });
    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getCourseIDForUser,
  getAllStudents,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
};