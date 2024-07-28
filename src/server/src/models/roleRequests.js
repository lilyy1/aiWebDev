const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { User } = require('./user');

const RoleRequests = sequelize.define('rolerequests', {
  requestid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'UserID',
    },
  },
  requestdate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending',
    validate: {
      isIn: [['Pending', 'Approved', 'Rejected']],
    },
  },
});

module.exports = RoleRequests;
