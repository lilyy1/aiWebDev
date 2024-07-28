import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../css/SubNav.css';

const SubNav = ({ subNav }) => {
  const [isSubNavOpen, setIsSubNavOpen] = useState(false);
  const hoverTimeout = useRef(null);

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsSubNavOpen(true);
    }, 500); // Delay before showing sub-navbar
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setIsSubNavOpen(false);
    }, 2000); // Delay before hiding sub-navbar
  };

  const handleSubNavMouseEnter = () => {
    clearTimeout(hoverTimeout.current);
  };

  const handleSubNavMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsSubNavOpen(false);
    }, 2000); // Delay before hiding sub-navbar
  };

  return (
    <ul 
      className={`sub-nav ${isSubNavOpen ? 'sub-nav-active' : ''}`} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {subNav.map((item, index) => (
        <li key={index} className="sub-nav-item" onMouseEnter={handleSubNavMouseEnter} onMouseLeave={handleSubNavMouseLeave}>
          <Link to={item.path}>
            <span className="sub-nav-icon">{item.icon}</span>
            <span className="sub-nav-title">{item.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SubNav;



