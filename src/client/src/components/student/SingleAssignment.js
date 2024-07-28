import React from 'react';
import '../../css/student/SingleAssignment.css';

const SingleAssignment = ({ assignment }) => {
    return (
        <div className="single-assignment-container">
            <h2 className="assignment-title">{assignment.title}</h2>
            <div className="assignment-details">
                <p>Due {assignment.dueDate} at {assignment.dueTime} | {assignment.points}/{assignment.totalPoints} pts</p>
            </div>
        </div>
    );
};

export default SingleAssignment;

