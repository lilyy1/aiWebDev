// src/client/src/components/Admin/AdminSidebarData.js
import React from 'react';
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";

const signOut = () => {
  localStorage.removeItem('token');
};

const AdminSidebarData = [
  {
    title: "Users",
    path: "/dashboard",
    icon: <FaIcons.FaUser />,
    cName: "nav-text"
  },
  {
    title: "Requests",
    path: "/admin/requests",
    icon: <IoIcons.IoMdMail />,
    cName: "nav-text"
  },
  {
    title: "Sign Out",
    path: "/",
    icon: <FaIcons.FaSignOutAlt />,
    cName: "nav-text",
    action: signOut
  }
];

export default AdminSidebarData;
