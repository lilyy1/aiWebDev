const Course = require('./course');
const Enrollment = require('./enrollment');
const User = require('./user');
const Role = require('./role');
const Assignment = require('./assignment');
const Submission = require('./submission');
const Announcement = require('./announcement');
const CourseInstructors = require('./courseinstructors');
const RoleRequests = require('./roleRequests');

// User model
User.hasOne(Enrollment, { foreignKey: 'userid' });
User.hasMany(Submission, { foreignKey: 'userid' });
User.belongsTo(Role, { foreignKey: 'roleid' });
User.hasOne(CourseInstructors, { foreignKey: 'userid' });


// Enrollment model
Enrollment.belongsTo(Course, { foreignKey: 'courseid' });
Enrollment.belongsTo(User, { foreignKey: 'userid' });

// CourseInstructor model
CourseInstructors.belongsTo(User, { foreignKey: 'userid' });
CourseInstructors.belongsTo(Course, { foreignKey: 'courseid' });

// Course model
Course.hasMany(Enrollment, { foreignKey: 'courseid' });
Course.hasMany(CourseInstructors, { foreignKey: 'courseid' });

// Submission model
Submission.belongsTo(Assignment, { foreignKey: 'assignmentid' });
Submission.belongsTo(User, { foreignKey: 'userid' });

// Assignment model
Assignment.hasMany(Submission, { foreignKey: 'assignmentid' });

// Role model
Role.hasMany(User, { foreignKey: 'roleid' });

// RoleRequests model
RoleRequests.belongsTo(User, { foreignKey: 'userid' });


module.exports = { Course, Enrollment, User, Role, Assignment, Submission, Announcement, CourseInstructors, RoleRequests};