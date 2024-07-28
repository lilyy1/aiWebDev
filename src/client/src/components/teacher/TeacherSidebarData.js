import React from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";

const signOut = () => {
  localStorage.removeItem('token');
};

const TeacherSidebarData = [
  {
    title: "Dashboard",
    path: "/teacher-dashboard",
    icon: <AiIcons.AiFillHome />,
    cName: "nav-text",
  },
  {
    title: "Students",
    path: "/students",
    icon: <FaIcons.FaUserGraduate />,
    cName: "nav-text",
  },
  {
    title: "Course",
    path: "#",
    icon: <FaIcons.FaBook />,
    cName: "nav-text",
    subNav: [
      {
        title: "Assignments",
        path: "/assignmentsteacherview",
        icon: <FaIcons.FaClipboardList style={{ color: '#333' }} />,
        cName: "sub-nav-item"
      },
      {
        title: "Announcements",
        path: "/announcementsteacherview",
        icon: <AiIcons.AiOutlineBell style={{ color: '#333' }} />,
        cName: "sub-nav-item"
      }
    ]
  },
  {
    title: "Settings",
    path: "#", //not clickable
    icon: <AiIcons.AiFillSetting />,
    cName: "nav-text",
    subNav: [
      {
        title: "Profile",
        path: "/settings/profile",
        icon: <IoIcons.IoMdPerson style={{ color: '#333' }} />,
        cName: "sub-nav-item",
      },
    ],
  },
  {
    title: "Sign Out",
    path: "/",
    icon: <FaIcons.FaSignOutAlt />,
    cName: "nav-text",
    action: signOut,
  }
];

export default TeacherSidebarData;

