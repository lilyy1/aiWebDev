import React from 'react';
import '../../css/student/Assignments.css';
import { Link } from 'react-router-dom';

function Assignments({ assignments }) {
  return (
    <div className="assignments">
      <h3>Upcoming Assignments</h3>
      {/* Display the first three assignments */}
      {assignments.slice(0, 3).map((assignment) => (
        <Link to={`/assignments/${assignment.assignmentid}`} key={assignment.assignmentid} className="card">
          <div className="card-header">
            {/* <span>{assignment.courseCode}</span> */}
            <span>{assignment.assignmentname}</span>
          </div>
          <div className="card-body">
          Due {new Date(assignment.enddate).toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })} | {(assignment.submission && assignment.submission.grade !== null) ? assignment.submission.grade : '-'}/{assignment.maxscore} pts
          </div>
        </Link>
      ))}
    </div>
  );
}

export default Assignments;
