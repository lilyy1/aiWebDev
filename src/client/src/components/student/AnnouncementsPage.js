import React from 'react';
import SideNavbar from '../SideNavbar';
import StudentSidebarData from './StudentSidebarData';

function AnnouncementsPage() {
  return (
    <div className="announcements-container">
      <SideNavbar data={StudentSidebarData} />
      <div className="announcements-container">
        {/* Add announcements page content here */}
      </div>
    </div>
  );
}

export default AnnouncementsPage;