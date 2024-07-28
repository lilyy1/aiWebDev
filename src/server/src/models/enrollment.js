const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enrollment = sequelize.define('enrollment', {
    enrollmentid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'UserID'
      }
    },
    courseid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Course',
        key: 'CourseID'
      }
    },
    enrollmentdate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  module.exports = Enrollment;