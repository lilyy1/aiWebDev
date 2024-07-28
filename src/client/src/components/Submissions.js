import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
const Submissions = () => {
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`/api/submissions/${assignmentId}`);
        const data = await response.json();
        if (response.ok) {
          setSubmissions(data);
        } else {
          setError('Failed to fetch submissions');
          console.error('Failed to fetch submissions:', data);
        }
      } catch (error) {
        setError('Error fetching submissions');
        console.error('Error fetching submissions:', error);
      }
    };

    fetchSubmissions();
  }, [assignmentId]);

  return (
    <div>
      <h1>Submissions for Assignment {assignmentId}</h1>
      {error && <p className="alert alert-danger">{error}</p>}
      <ul>
        {submissions.map(submission => (
          <li key={submission.submissionid}>
            <p>Submission Date: {submission.submissiondate}</p>
            <p>Content Type: {submission.contenttype}</p>
            {submission.contentlink && <p>Content Link: <a href={submission.contentlink}>Download</a></p>}
            <p>Content: <a href={submission.content}>View Content</a></p>
            {submission.grade && <p>Grade: {submission.grade}</p>}
            {submission.feedback && <p>Feedback: {submission.feedback}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Submissions;