import React from 'react';
import '../../css/student/Announcements.css';

function Announcements({ announcements }) {
  return (
    <div className="announcements">
      <h3>Announcements</h3>
      {announcements.slice(0, 3).map((announcement, index) => (
        <div key={announcement.id} className="card">
          <div className="card-header">
            <span>{new Date(announcement.dateposted).toLocaleString()}</span>
            <span>{announcement.title}</span>
          </div>
          <div className="card-body">
            {announcement.content}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Announcements;