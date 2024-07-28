const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Course = sequelize.define('course', {
  courseid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  term: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  startdate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  enddate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  accesscode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  students: {
    type: DataTypes.STRING,
  },
}, {
  // hooks: {
  //   beforeCreate: (course, options) => {
  //     const accessCode = generateAccessCode();
  //     console.log('Generated Access Code:', accessCode); // Add logging
  //     course.accesscode = accessCode; // Ensure correct property name
  //   }
  // }
});


module.exports = Course;