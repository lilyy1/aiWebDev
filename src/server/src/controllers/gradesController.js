const {Assignment, Enrollment, Submission} = require('../models');


const releaseGrades = async (req, res) => {
  try {
    const { assignmentid } = req.params;

    // Find the assignment by ID
    const assignment = await Assignment.findByPk(assignmentid);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Get the course ID from the assignment
    const courseId = assignment.courseid;

    // Find all students enrolled in the course
    const enrollments = await Enrollment.findAll({ where: { courseid: courseId } });

    // Get the list of all student IDs
    const studentIds = enrollments.map(enrollment => enrollment.userid);

    // Find all submissions for the assignment
    const submissions = await Submission.findAll({ where: { assignmentid: assignmentid } });

    // Get the list of student IDs who have submitted
    const submittedStudentIds = submissions.map(submission => submission.userid);

    // Find students who have not submitted
    const nonSubmittedStudentIds = studentIds.filter(id => !submittedStudentIds.includes(id));

    // Create a submission with grade 0 for each student who has not submitted
    const zeroGradeSubmissions = nonSubmittedStudentIds.map(userid => ({
      assignmentid: assignmentid,
      userid: userid,
      submissiondate: new Date(),
      contenttype: 'html',
      content: '',
      grade: 0,
      feedback: 'No submission',
    }));

    // Bulk create zero grade submissions
    await Submission.bulkCreate(zeroGradeSubmissions);

    // Update the GradesReleased field to true
    assignment.gradesreleased = true;
    await assignment.save();

    res.json({ message: 'Grades released successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateAvgGrade = async (submissionId) => {
  try {
    console.log(`Fetching submission with ID: ${submissionId}`);
    const submission = await Submission.findByPk(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }
    console.log(`Submission found: ${JSON.stringify(submission)}`);

    // Calculate the new average score for the assignment
    const assignmentId = submission.assignmentid;
    console.log(`Fetching all submissions for assignment ID: ${assignmentId}`);
    const submissions = await Submission.findAll({
      where: { assignmentid: assignmentId },
      attributes: ['grade']
    });
    console.log(`Submissions found: ${submissions.length}`);

    const totalScore = submissions.reduce((sum, sub) => sum + sub.grade, 0);
    const newAverageScore = totalScore / submissions.length;
    console.log(`New average score calculated: ${newAverageScore}`);

    // Update the AverageScore in the Assignments table
    const assignment = await Assignment.findByPk(assignmentId);
    assignment.averagescore = newAverageScore;
    await assignment.save();
    console.log(`Assignment updated with new average score: ${newAverageScore}`);
  } catch (error) {
    console.error('Error updating average grade:', error);
  }
}

const modifyGradeAndFeedback = async (req, res) => {
  const { submissionId } = req.params;
  const { grade, feedback } = req.body;

  try {
    console.log(`Fetching submission with ID: ${submissionId}`);
    const submission = await Submission.findByPk(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    console.log(`Submission found: ${JSON.stringify(submission)}`);

    submission.grade = grade;
    submission.feedback = feedback;
    await submission.save();
    console.log(`Submission updated with grade: ${grade} and feedback: ${feedback}`);

    // Update the average grade for the assignment
    await updateAvgGrade(submissionId);

    res.json({ message: 'Grade and feedback updated successfully' });
  } catch (error) {
    console.error('Error updating grade and feedback:', error);
    res.status(500).json({ error: 'An error occurred', details: error.message });
  }
};

const viewGrades = async (req, res) => {
  try {
    const { userid } = req.query;

    // Find all submissions for the user, sorted by assignment end date
    const submissions = await Submission.findAll({
      where: { userid: userid },
      include: [{
        model: Assignment,
        attributes: ['assignmentname', 'maxscore', 'enddate', 'gradesreleased']
      }],
      order: [[{ model: Assignment }, 'enddate', 'ASC']]
    });

    // Filter out grades and feedback if gradesreleased is false
    const filteredSubmissions = submissions.map(submission => {
      const submissionData = submission.toJSON();
      if (!submission.assignment.gradesreleased) {
        return {
          ...submissionData,
          grade: null,
          feedback: null,
          status: submissionData.assignment.gradesreleased ? "Submitted" : "Pending"
        };
      }
      return {
        ...submissionData,
        status: submissionData.assignment.gradesreleased ? "Submitted" : "Pending"
      };
    });

    // Return the filtered submissions in the response
    res.json(filteredSubmissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  releaseGrades, modifyGradeAndFeedback, viewGrades
};