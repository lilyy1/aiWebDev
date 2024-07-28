const {Submission, Assignment, User, Enrollment, Course}  = require('../models');
const Sequelize = require('sequelize');
const minioClient = require('../config/minio');
const Op = Sequelize.Op;

const getSubmission = async (req, res) => {
    const { id } = req.params;  // submission id

    if (!id) {
        return res.status(400).json({ error: 'Submission ID is required' });
    }

    try {
        const submission = await Submission.findOne({
            where: { submissionid: id },
            include: [
                {
                    model: Assignment,
                    attributes: ['maxscore', 'averagescore'],
                    required: true
                },
                {
                    model: User,
                    attributes: ['firstname', 'lastname'],
                    required: true
                }
            ]
        });

        if (!submission) {
            console.log('Submission not found');
            return res.status(404).json({ error: 'Submission not found' });
        }

        if (!submission.assignment) {
            console.log('Assignment not found for this submission');
            return res.status(404).json({ error: 'Assignment not found for this submission' });
        }

        if (!submission.user) {
            console.log('User not found for this submission');
            return res.status(404).json({ error: 'User not found for this submission' });
        }

        const response = {
            ...submission.toJSON(),
            maxscore: submission.assignment.maxscore,
            firstname: submission.user.firstname,
            lastname: submission.user.lastname,
            averagescore: submission.assignment.averagescore,
            feedback: submission.feedback || 'No feedback provided',
            //added by mrunal
            link: submission.contentlink || 'No link submitted',
            content: submission.content || 'No content submitted'
        };

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the submission' });
    }
};

const getSubmissions = async (req, res) => {
    const { id } = req.params;  //assignment id
    const { courseid } = req.query; 
    console.log('assignmentid:', id)
    console.log('courseid:', courseid);

    if (!User || typeof User.findAll !== 'function') {
        console.error('User model is not configured correctly or findAll method is missing');
        return res.status(500).json({ error: 'Internal server error', details: 'User model configuration error' });
    }
    try {
        // Assuming Submission model has a createdAt or timestamp field to determine the latest submission
        const submissions = await User.findAll({
            attributes: ['userid', 'firstname', 'lastname', 'email'],
            include: [{
                model: Enrollment,
                attributes: [],
                where: { courseid: courseid },
                include: [{
                    model: Course,
                    attributes: []
                }]
            }, {
                model: Submission,
                required: false, // This makes it a LEFT JOIN
                where: { assignmentid: id },
                // attributes: ['submissionid', 'grade'], // Include submissionid and createdAt to identify the submission
                // order: [['createdAt', 'DESC']], // Order by createdAt to ensure the latest submission is first
            }],
            order: [['lastname', 'ASC'], ['firstname', 'ASC']] // Directly using order
        });

        const formattedSubmissions = submissions.map(sub => ({
            ...sub.toJSON(),
            // Submitted: sub.Submissions && sub.Submissions.length > 0 ? 'Yes' : 'No'
        }));
        res.json(formattedSubmissions);
    } catch (err) {
        console.error('Error fetching submissions:', err);
        res.status(500).json({ error: 'An error occurred', details: err.message });
    }
};

const getSubmissionFile = async (req, res) => {
    const { id } = req.params;
  
    try {
        const submission = await Submission.findByPk(id);
        if (!submission || !submission.content) {
            return res.status(404).json({ error: 'submission file not found' });
        }
  
        const submissionURL = submission.content;
        const fileName = submissionURL.split('/').pop();
  
        minioClient.getObject('submissions', fileName, (err, dataStream) => {
            if (err) {
                console.error('Error fetching submission from MinIO:', err);
                return res.status(500).json({ message: 'Error fetching file from MinIO' });
            }
  
            res.attachment(fileName);
            dataStream.pipe(res);
        });
    } catch (error) {
        console.error('Error fetching submission file from MinIO:', error);
        res.status(500).json({ message: 'Server error' });
    }
  };

  const getSubmissionId = async (req, res) => {
    const { assignmentid, userid } = req.params;
    try {
        const submission = await Submission.findOne({
            where: {
                assignmentid: assignmentid,
                userid: userid
            }
        });
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        res.json(submission);
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ error: 'An error occurred while fetching the submission' });
    }
  };

module.exports = {
    getSubmissions, getSubmission,
    getSubmissionFile, getSubmissionId
};

