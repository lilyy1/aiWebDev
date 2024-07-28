import React, { useState, useEffect, useRef } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { Link } from "react-router-dom";
import { IconContext } from "react-icons";
import SubNav from './SubNav';
import '../css/SideNavbar.css';

function SideNavbar({ data = [] }) {
  const [sidebar, setSidebar] = useState(false);
  const sidebarRef = useRef(null);

  const showSidebar = () => setSidebar(!sidebar);

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setSidebar(false);
    }
  };

  useEffect(() => {
    if (sidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebar]);

  return (
    <IconContext.Provider value={{ color: "#fff" }}>
      <div className="side-navbar">
        <Link to="#" className="menu-bars">
          <FaIcons.FaBars onClick={showSidebar} />
        </Link>
      </div>
      <nav ref={sidebarRef} className={sidebar ? "side-nav-menu active" : "side-nav-menu"}>
        <ul className="side-nav-menu-items" onClick={showSidebar}>
          <li className="side-navbar-toggle">
            <Link to="#" className="menu-bars">
              <AiIcons.AiOutlineClose />
            </Link>
          </li>
          {data.map((item, index) => (
            <li key={index} className="nav-text">
              <Link to={item.path} onClick={item.action || null}>
                {item.icon}
                <span>{item.title}</span>
                {item.subNav && <FaIcons.FaChevronRight className="sub-nav-indicator" />}
              </Link>
              {item.subNav && <SubNav subNav={item.subNav} />}
            </li>
          ))}
        </ul>
      </nav>
    </IconContext.Provider>
  );
}

export default SideNavbar;






