import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebarData from './AdminSidebarData';
import '../../css/Admin/AdminNavbar.css';
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";

function AdminNavbar() {
  const [sidebar, setSidebar] = useState(false);

  const showSidebar = () => setSidebar(!sidebar);

  return (
    <>
      <div className="admin-navbar">
        <Link to="#" className="menu-bars">
          <FaIcons.FaBars onClick={showSidebar} />
        </Link>
      </div>
      <div className="admin-navbar-body"></div>
      <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
        <ul className="nav-menu-items" onClick={showSidebar}>
          <li className="navbar-toggle">
            <Link to="#" className="menu-bars">
              <AiIcons.AiOutlineClose />
            </Link>
          </li>
          <div className="admin-header">
            <h1>AIDE</h1>
            <h3>administrator</h3>
          </div>
          {AdminSidebarData.map((item, index) => (
            <li key={index} className={item.cName}>
              <Link to={item.path} onClick={item.action ? item.action : null}>
                {item.icon}
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

export default AdminNavbar;
