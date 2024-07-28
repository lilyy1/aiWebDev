const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./src/config/database');
const userRoutes = require('./src/routes/userRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const { router: protectedRoutes, authenticateToken } = require('./src/routes/protectedRoutes');
const assignmentRoutes = require('./src/routes/assignmentRoutes');
const announcementRoutes = require('./src/routes/announcementRoutes');
const submissionsRoutes = require('./src/routes/submissionsRoutes');
const assignmentsPageRoutes = require('./src/routes/assignmentsPageRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const manageRoutes = require('./src/routes/manageRoutes');
const enrollmentRoutes = require('./src/routes/enrollmentRoutes');
const roleRequestsRoutes = require('./src/routes/roleRequestsRoutes');
const fileUpload = require('express-fileupload');
const gradesRoutes = require('./src/routes/gradesRoutes');
const roleRoutes = require('./src/routes/roleRoutes');
const sectionRoutes = require('./src/routes/sectionRoutes');
const app = express();
const path = require('path');
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../client/public')));

// Apply authentication middleware

app.use('/', userRoutes);
app.use('/', protectedRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/assignments', assignmentRoutes);
app.use('/announcements', announcementRoutes);
app.use('/submissions', submissionsRoutes);
app.use('/manage', manageRoutes);
app.use('/enrollments', enrollmentRoutes); 
app.use('/', gradesRoutes);
app.use('/role-requests', roleRequestsRoutes);
app.use('/', sectionRoutes);

app.use(authenticateToken); 
app.use('/courses', courseRoutes);
app.use('/assignments-page', assignmentsPageRoutes);
app.use('/', dashboardRoutes);
app.use('/roles', roleRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await sequelize.authenticate();
  console.log('Database connected!');
  await sequelize.sync();
});
