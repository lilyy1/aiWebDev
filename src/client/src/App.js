import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Profile from './components/Profile';
import Edit from './components/Edit';
import MainContent from './components/MainContent';
import Registration from './components/Registration';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';


import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


// Student imports
import Announcements from './components/student/Announcements';
import AssignmentSubmission from './components/student/AssignmentSubmission';
import AssignmentsPage from './components/student/AssignmentsPage';
import SingleViewAssignment from './components/student/SingleViewAssignment';
import GradesPage from './components/student/GradesPage';
import AnnouncementsPage from './components/student/AnnouncementsPage'
import GeneralSettings from './components/student/GeneralSettings';
import AnnouncementsStudentView from './components/student/AnnouncementsStudentView';
import SingleAnnouncement from './components/student/SingleAnnouncement.js';
import FeedbackPage from './components/student/FeedbackPage'; 

import Enroll from './components/student/Enroll';

// Teacher imports
import CreateAnnouncement from './components/teacher/AddAnnouncementModal.js';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import CreateAssignment from './components/teacher/CreateAssignment';
import AssignmentsTeacherView from './components/teacher/AssignmentsTeacherView';
import AnnouncementsTeacherView from './components/teacher/AnnouncementsTeacherView';
import SingleAnnouncementTeacher from './components/teacher/SingleAnnouncementTeacher';
import SubmissionsTeacherView from './components/teacher/SubmissionsTeacherView';
import GradesAndFeedback from './components/teacher/GradesAndFeedback';
import StudentList from './components/teacher/StudentList.js';
// Admin imports
import EditUserProfile from './components/Admin/EditUser.js';
import RoleRequests from './components/Admin/RoleRequests';
import AdminDashboard from './components/Admin/AdminDashboard.js';



function App() {
  return (

    <div className="App">

      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/profile" element={<Profile />}/>
        <Route path="/edit" element={<Edit />}/>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} /> 

        {/* Common dashboard route */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Students' pages */}
        <Route path="/assignments-page/" element={<AssignmentsPage />} />
        <Route path="/student-dashboard" element={<Dashboard />} /> {/* Redirect to common dashboard */}
        <Route path="/assignments/:assignmentId" element={<SingleViewAssignment />} /> {/* View an assignment */}
        <Route path="/assignments/:assignmentId/submit" element={<AssignmentSubmission />} /> {/* Submit an assignment */}
        <Route path="/announcements-page" element={<AnnouncementsPage />} />
        <Route path="/grades-page" element={<GradesPage />} />
        <Route path="/settings/general" element={<GeneralSettings />} />
        <Route path="/settings/profile" element={<Profile />}/>
        <Route path="/announcementsstudentview" element={<AnnouncementsStudentView />} />
        <Route path="/announcement/:announcementid" element={<SingleAnnouncement />} />
        <Route path="/feedback/:submissionid" element={<FeedbackPage />} /> {/* Add this line */}
        <Route path="/enroll" element={<Enroll />} />


        {/* Instructors' pages */}
        <Route path="/teacher-dashboard" element={<Dashboard />} /> {/* Redirect to common dashboard */}
        <Route path='/assignmentsteacherview' element={<AssignmentsTeacherView />} />
        <Route path="/announcementsteacherview" element={<AnnouncementsTeacherView />} /> 
        <Route path='/create-assignment' element={<CreateAssignment />}/>
        <Route path='/submissionsteacherview/:assignmentId' element={<SubmissionsTeacherView />} />
        <Route path='/gradesandfeedback/:submissionId' element={<GradesAndFeedback />} /> {/* New route */}
        <Route path="/assignments/:id" element={<AssignmentSubmission />} /> 
        <Route path="/announcements" element={<Announcements />} /> 
        <Route path="/announcementsteacherview" element={<AnnouncementsTeacherView />} />
        <Route path="/announcementsteacherview/:announcementid" element={<SingleAnnouncementTeacher />} />
        <Route path='/create-announcement' element={<CreateAnnouncement />}/>
        <Route path="/TeacherDashboard" element={<TeacherDashboard />} />
        <Route path='/assignmentsteacherview' element={<AssignmentsTeacherView />} /> 
        <Route path='/students' element={<StudentList />} />


        {/* Admin pages */}
        <Route path='/admin/users' element={<AdminDashboard />} /> 
        <Route path='/admin/requests' element={<RoleRequests />} />


        {/* Admins' pages */}
        <Route path='/edit-user/:userid' element={<EditUserProfile />} />
        {/* <Route path='/admin-dashboard' element={<AdminDashboard />} /> */}
        {/* <Route path='/role-requests' element={<RoleRequests />} /> */}

      </Routes>
    </div>

  );
}

export default App;
