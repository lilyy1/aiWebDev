const { Assignment, Submission } = require('../models');
const { v4: uuidv4 } = require('uuid');
const minioClient = require('../config/minio');
const path = require('path');
const { get } = require('http');
const jwt = require('jsonwebtoken');
const { where } = require('sequelize');
const axios = require('axios');
const { send } = require('process');
const { JSDOM } = require('jsdom');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const rubricBucket = 'rubrics';
const answerKeyBucket = 'answerkeys';
const submissionBucket = 'submissions';

const createAssignment = async (req, res) => {
  try {
    // console.log(req.body);
    const {
      courseid,
      assignmentname,
      assignmentdescription,
      submissiontype,
      prompt,
      maxscore,
      startdate,
      enddate,
    } = req.body;

    let AnswerKeyURL = null;
    let RubricURL = null;

    if (req.files) {
      if (req.files.answerKey) {
        const answerKeyFile = req.files.answerKey;
        if (answerKeyFile.size > MAX_FILE_SIZE) {
          return res.status(400).json({ error: 'Answer key file size exceeds the 5MB limit.' });
        }
        const fileExtension = path.extname(answerKeyFile.name);
        const objectName = `${uuidv4()}${fileExtension}`;

        await minioClient.putObject(answerKeyBucket, objectName, answerKeyFile.data);

        AnswerKeyURL = `${minioClient.protocol}://${minioClient.endPoint}:${minioClient.port}/answerkeys/${objectName}`;
      }

      if (req.files.rubric) {
        const rubricFile = req.files.rubric;
        if (rubricFile.size > MAX_FILE_SIZE) {
          return res.status(400).json({ error: 'Rubric file size exceeds the 5MB limit.' });
        }
        const fileExtension = path.extname(rubricFile.name);
        const objectName = `${uuidv4()}${fileExtension}`;

        await minioClient.putObject(rubricBucket, objectName, rubricFile.data);

        RubricURL = `${minioClient.protocol}://${minioClient.endPoint}:${minioClient.port}/rubrics/${objectName}`;
      }
    }

    const assignment = await Assignment.create({
      courseid: courseid,
      assignmentname: assignmentname,
      assignmentdescription: assignmentdescription,
      submissiontype: submissiontype,
      answerkey: AnswerKeyURL,
      rubric: RubricURL,
      prompt: prompt,
      maxscore: maxscore,
      startdate: startdate,
      enddate: enddate,
    });

    res.status(201).json({ message: 'Assignment created successfully', assignment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAssignmentById = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findByPk(assignmentId);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAssignmentListByCourseId = async (req, res) => {
  try {
    const { courseid } = req.query;
    const { userid } = req.query;
    console.log('Course ID:', courseid);
    console.log('User ID:', userid);

    // Validate courseId input
    if (!courseid) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    console.log(courseid);
    let assignments = await Assignment.findAll({ where: { courseid: courseid }, order: [['enddate', 'ASC']] });

    // Check if the assignments array is empty
    if (assignments.length === 0) {
      return res.status(404).json({ error: 'Assignments not found' });
    }
    // console.log("list of assignment before",assignments);
    assignments = await Promise.all(assignments.map(async (assignment) => {
      const submission = await Submission.findOne({
        where: {
          assignmentid: assignment.assignmentid,
          userid: userid
        }
      });


      return {
        ...assignment.toJSON(),
        submission: submission ? submission.toJSON() : null
      };
    }));

    // console.log("list of assignment after",assignments);

    res.json(assignments);
  } catch (error) {
    console.error(error);

    // Handle specific database errors (example)
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ error: 'Database error occurred' });
    }
    else {
      // Generic error response
      res.status(500).json({
        error: 'Server error',
        message: error.message, // Provides the error message
        name: error.name, // Provides the error name/type
        // stack: err.stack, // Provides the stack trace (use with caution in production)
      });
    }
  }
};


const getAssignmentListByCourseIdStudent = async (req, res) => {
  try {
    const { courseid } = req.query;
    const { userid } = req.query;
    console.log('Course ID:', courseid);
    console.log('User ID:', userid);

    // Validate courseId input
    if (!courseid) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    console.log(courseid);
    let assignments = await Assignment.findAll({ where: { courseid: courseid }, order: [['enddate', 'ASC']] });

    // Check if the assignments array is empty
    if (assignments.length === 0) {
      return res.status(404).json({ error: 'Assignments not found' });
    }
    assignments = await Promise.all(assignments.map(async (assignment) => {
      const submission = await Submission.findOne({
        where: {
          assignmentid: assignment.assignmentid,
          userid: userid
        }
      });


      let submissionData = submission ? submission.toJSON() : null;
      if (submissionData && !assignment.gradesreleased) {
        delete submissionData.grade;
      }

      return {
        ...assignment.toJSON(),
        submission: submissionData
      };
    }));

    // console.log("list of assignment after",assignments);

    res.json(assignments);
  } catch (error) {
    console.error(error);

    // Handle specific database errors (example)
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ error: 'Database error occurred' });
    }
    else {
      // Generic error response
      res.status(500).json({
        error: 'Server error',
        message: error.message, // Provides the error message
        name: error.name, // Provides the error name/type
        // stack: err.stack, // Provides the stack trace (use with caution in production)
      });
    }
  }
};
// Function to remove comments from HTML, CSS, and JS files
const removeComments = (fileContent, fileType) => {
  if (fileType === 'html') {
    return fileContent.replace(/<!--[\s\S]*?-->/g, '');
  } else if (fileType === 'css') {
    return fileContent.replace(/\/\*[\s\S]*?\*\//g, '');
  } else if (fileType === 'js') {
    return fileContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  }
  return fileContent;
};

const getFileFromMinIO = async (bucketName, objectName) => {
  return new Promise((resolve, reject) => {
    minioClient.getObject(bucketName, objectName, (err, dataStream) => {
      if (err) {
        return reject(err);
      }

      let fileData = '';
      dataStream.on('data', (chunk) => {
        fileData += chunk;
      });

      dataStream.on('end', () => {
        resolve(fileData);
      });

      dataStream.on('error', (err) => {
        reject(err);
      });
    });
  });
};

const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params; // Assignment ID
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

    if (!token) {
      console.error('No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userid = decodedToken.userid;
    const { link, content } = req.body;

    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) {
      console.error(`Assignment not found: ${assignmentId}`); // Log missing assignment
      return res.status(404).json({ error: 'Assignment not found' });
    }

    let fileURL = null;
    let contentType = null;
    let submissionContent = content;
    let contentToSendToOllama = '';

    if (assignment.submissiontype === 'file' && req.files && req.files.file) {
      const file = req.files.file;
      const fileExtension = path.extname(file.name).toLowerCase();
      if (!['.html', '.css', '.js'].includes(fileExtension)) {
        console.error(`Invalid file type: ${fileExtension}`);
        return res.status(400).json({ error: 'Invalid file type. Only HTML, CSS, and JavaScript files are allowed.' });
      }
      const objectName = `${uuidv4()}${fileExtension}`;

      await minioClient.putObject(submissionBucket, objectName, file.data);

      fileURL = `${minioClient.protocol}://${minioClient.endPoint}:${minioClient.port}/submissions/${objectName}`;
      contentType = fileExtension.substring(1);

      contentToSendToOllama = await getFileFromMinIO(submissionBucket, objectName);
      contentToSendToOllama = removeComments(contentToSendToOllama, contentType);
    }

    if (assignment.submissiontype === 'link') {
      contentType = 'link';
      if (link) {
        const response = await axios.get(link);
        const dom = new JSDOM(response.data);
        submissionContent = dom.serialize();
        contentToSendToOllama = removeComments(submissionContent, 'html');
      }
    }

    const existingSubmission = await Submission.findOne({
      where: { assignmentid: assignmentId, userid: userid },
    });

    if (existingSubmission) {
      // Delete the old file from MinIO if a new file is uploaded
      if (fileURL && existingSubmission.content) {
        const oldObjectName = existingSubmission.content.split('/').pop();
        await minioClient.removeObject(submissionBucket, oldObjectName);
      }

      // Update the existing submission
      existingSubmission.contenttype = contentType;
      existingSubmission.contentlink = link || null;
      existingSubmission.content = fileURL || submissionContent || null;
      await existingSubmission.save();
      console.log('Submission updated successfully: ' + contentToSendToOllama);

      sendToOllama(assignmentId, existingSubmission.submissionid, contentToSendToOllama);

      res.status(200).json({ message: 'Submission updated successfully', submission: existingSubmission, domContent: contentToSendToOllama });
    } else {
      const submission = await Submission.create({
        assignmentid: assignmentId,
        userid: userid,
        submissiondate: new Date(),
        contenttype: contentType,
        contentlink: link || null,
        content: fileURL || submissionContent || null,
      });
      console.log('Submission successful: ' + contentToSendToOllama);
      
      sendToOllama(assignmentId, submission.submissionid, contentToSendToOllama);

      res.status(201).json({ message: 'Submission successful', submission, domContent: contentToSendToOllama });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error });
  }
};

const updateAssignmentPrompt = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { newPrompt } = req.body;

    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    assignment.prompt = newPrompt;
    await assignment.save();

    // Regrade all submissions for this assignment
    const submissions = await Submission.findAll({ where: { assignmentid: assignmentId } });
    for (const submission of submissions) {
      let submissionContent = submission.content;
      if (submission.contenttype === 'link') {
        submissionContent = submission.content; // Assuming the content is already a string
      } else {
        submissionContent = await getFileFromMinIO('submissions', submission.content.split('/').pop());
        submissionContent = removeComments(submissionContent, submission.contenttype);
      }
      console.log('regrading:', submissionContent);
      await sendToOllama(assignmentId, submission.submissionid, submissionContent);
    }

    res.status(200).json({ message: 'AI prompt updated and submissions regraded' });
  } catch (error) {
    console.error('Error updating AI prompt:', error);
    res.status(500).json({ error: 'Error updating AI prompt' });
  }
};

const getAnswerKey = async (assignmentId) => {
  try {
    console.log('Getting answer key for assignment:', assignmentId);
    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment || !assignment.answerkey) {
      throw new Error('Answer key not found for the assignment');
    }

    const answerKeyUrl = assignment.answerkey;
    const answerKeyObjectName = answerKeyUrl.split('/').pop();

    const answerKeyData = await getFileFromMinIO(answerKeyBucket, answerKeyObjectName);

    return answerKeyData;
  } catch (error) {
    console.error('Error getting answer key:', error);
    throw error;
  }
};

const sendToOllama = async (assignmentId, submissionId, submissionContent) => {
  try {
    const answerKeyData = await getAnswerKey(assignmentId);

    const submission = await Submission.findByPk(submissionId);
    if (!submission || !submission.content) {
      throw new Error('Submission not found');
    }

    const assignment = await Assignment.findByPk(assignmentId);
    const maxscore = assignment.maxscore;
    const prompt = `Here is the answer key: ${answerKeyData}. Here is the assignment submission: ${submissionContent}. 
    Please give the submission a grade and grade the submission based on the following criteria: ${assignment.prompt}. 
    The maximum score is ${maxscore}. Do not exceed the maximum score.
    Please provide only the following information in your response:
    - A numeric grade between 0 and ${maxscore}.
    - Feedback on how to improve the assignment.
    
    Format your response as follows:
    Grade: [numeric grade]
    Feedback: [feedback]`;

    // Send to Ollama
    console.log('Sending data to Ollama to be graded');
    const gradeResponse = await axios.post('https://ollama-monrxxyt4q-uc.a.run.app/api/generate', {
      "model": "codellama",
      "prompt": prompt,
      "stream": false
    });

    console.log('Ollama grade:', gradeResponse.data);

    const parsedResponse = parseOllamaResponse(gradeResponse.data);
    console.log('Parsed Ollama response:', parsedResponse);

    await updateSubmissionWithGrade(submissionId, parsedResponse.grade, parsedResponse.feedback);
    await updateAvgGrade(submissionId);

    return parsedResponse;
  } catch (error) {
    console.error('Error sending data to Ollama:', error);
    throw error;
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

// Function to update the submission with grade and feedback
const updateSubmissionWithGrade = async (submissionId, grade, feedback) => {
  try {
    console.log(`Fetching submission with ID: ${submissionId}`);
    const submission = await Submission.findByPk(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }
    console.log(`Submission found: ${JSON.stringify(submission)}`);

    submission.grade = grade;
    submission.feedback = feedback;
    await submission.save();
    console.log(`Submission updated with grade: ${grade} and feedback: ${feedback}`);

    console.log('Submission updated with grade and feedback');
  } catch (error) {
    console.error('Error updating submission:', error);
  }
};
const parseOllamaResponse = (response) => {
  const responseText = response.response;

  const gradePattern = /Grade:\s*(\d+)/;
  const feedbackPattern = /Feedback\s*:\s*([\s\S]*)/;

  const gradeMatch = responseText.match(gradePattern);
  const grade = gradeMatch ? parseInt(gradeMatch[1], 10) : null;

  const feedbackMatch = responseText.match(feedbackPattern);
  const feedback = feedbackMatch ? feedbackMatch[1].trim() : '';

  return { grade, feedback };
};


const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete related submissions first
    await Submission.destroy({ where: { assignmentid: id } });

    // Then delete the assignment
    const deleted = await Assignment.destroy({ where: { assignmentid: id } });
    if (deleted) {
      res.status(200).json({ message: 'Assignment deleted' });
    } else {
      res.status(404).json({ message: 'Assignment not found' });
    }
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Error deleting assignment' });
  }
};


const getRubricFile = async (req, res) => {
  const { assignmentId } = req.params;

  try {
      const assignment = await Assignment.findByPk(assignmentId);
      if (!assignment || !assignment.rubric) {
          return res.status(404).json({ error: 'Rubric file not found' });
      }

      const rubricURL = assignment.rubric;
      const fileName = rubricURL.split('/').pop();

      minioClient.getObject('rubrics', fileName, (err, dataStream) => {
          if (err) {
              console.error('Error fetching rubric file from MinIO:', err);
              return res.status(500).json({ message: 'Error fetching file from MinIO' });
          }

          res.attachment(fileName);
          dataStream.pipe(res);
      });
  } catch (error) {
      console.error('Error fetching rubric file from MinIO:', error);
      res.status(500).json({ message: 'Server error' });
  }
};

const getAnswerKeyFile = async (req, res) => {
  const { assignmentId } = req.params;

  try {
      const assignment = await Assignment.findByPk(assignmentId);
      if (!assignment || !assignment.answerkey) {
          return res.status(404).json({ error: 'answer key file not found' });
      }

      const answerkeyURL = assignment.answerkey;
      const fileName = answerkeyURL.split('/').pop();

      minioClient.getObject('answerkeys', fileName, (err, dataStream) => {
          if (err) {
              console.error('Error fetching answer key file from MinIO:', err);
              return res.status(500).json({ message: 'Error fetching file from MinIO' });
          }

          res.attachment(fileName);
          dataStream.pipe(res);
      });
  } catch (error) {
      console.error('Error fetching answer key file from MinIO:', error);
      res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  createAssignment, getAssignmentById, 
  submitAssignment, getAssignmentListByCourseId, 
  getAssignmentListByCourseIdStudent, 
  updateAvgGrade, deleteAssignment, 
  getRubricFile, getAnswerKeyFile ,
  updateAssignmentPrompt
};