import React from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";

const signOut = () => {
  localStorage.removeItem('token');
};

const StudentSidebarData = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: <AiIcons.AiFillHome />,
    cName: "nav-text",
  },
  {
    title: "Course",
    path: "#",
    icon: <IoIcons.IoIosPaper />,
    cName: "nav-text",
    subNav: [
      {
        title: "Assignments",
        path: "/assignments-page",
        icon: <IoIcons.IoIosPaper style={{ color: '#333' }} />,
        cName: "sub-nav-item",
      },
      {
        title: "Announcements",
        path: "/announcementsstudentview",
        icon: <IoIcons.IoMdMegaphone style={{ color: '#333' }} />,
        cName: "sub-nav-item",
      },
      {
        title: "Grades",
        path: "/grades-page",
        icon: <IoIcons.IoMdListBox style={{ color: '#333' }} />,
        cName: "sub-nav-item",
      },
    ],
  },
  {
    title: "Enroll",
    path: "/enroll",
    icon: <FaIcons.FaUserPlus />,
    cName: "nav-text",
  },
  {
    title: "Settings",
    path: "#", //not clickable
    icon: <IoIcons.IoMdSettings />,
    cName: "nav-text",
    subNav: [
      {
        title: "General",
        path: "/settings/general",
        icon: <IoIcons.IoMdCog style={{ color: '#333' }} />,
        cName: "sub-nav-item",
      },
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
  },
];

export default StudentSidebarData;


