const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Announcement = sequelize.define('announcement', {
  announcementid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  courseid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  dateposted: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = Announcement;