const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseInstructors = sequelize.define('courseinstructors', {
    courseinstructorid: {
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
    role: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            isIn: [['Instructor', 'TA']]
        }
    }
});

module.exports = CourseInstructors;
