const minioClient = require('../config/minio');
const { Course, User, Enrollment, CourseInstructors } = require('../models');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env' });
const csvParser = require('csv-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { get } = require('http');

// const MAX_FILE_SIZE = 5 * 1024 * 1024;
const studentBucket = 'students';

const uploadCsv = async (req, res) => {
    const {courseid} = req.params;
    console.log(courseid);
    try{
        let studentsURL = null;

        if (req.files.students) {
            console.log(req.files.students);
            const students = req.files.students;
            const fileExtension = path.extname(students.name);

            const objectName = `${uuidv4()}${fileExtension}`;
            await minioClient.putObject(studentBucket, objectName, students.data);
            console.log(minioClient.protocol, minioClient.endPoint, minioClient.port);
            studentsURL = `${minioClient.protocol}://${minioClient.endPoint}:${minioClient.port}/students/${objectName}`;

            const manage = await Course.update(
                { students: studentsURL },
                { where: { courseid: courseid } } 
            );
            res.status(201).json({ message: 'uploaded successfully', manage });
        }else{
            return res.status(400).json({ message: 'No file uploaded' });
        }
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
    
};

const getAccessCode = async (req, res) => {
    const { courseid } = req.params;
    console.log(courseid);
    try {
      const course = await Course.findByPk(courseid);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
      res.json({ accesscode: course.accesscode }); 
    } catch (error) {
      console.error('Failed to fetch access code:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const getStudentsFile = async (req, res) => {
    const { courseid } = req.params;
  
    try {
      const course = await Course.findByPk(courseid);
      if (!course || !course.students) {
        return res.status(404).json({ error: 'File not found' });
      }
  
      const studentsURL = course.students;
      const fileName = studentsURL.split('/').pop();
  
      minioClient.getObject('students', fileName, (err, dataStream) => {
        if (err) {
          console.error('Error fetching file from MinIO:', err);
          return res.status(500).json({ message: 'Error fetching file from MinIO' });
        }
  
        res.attachment(fileName);
        dataStream.pipe(res);
      });
    } catch (error) {
      console.error('Error fetching file from MinIO:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  const checkAccessCodeAndEmail = async (req, res) => {
    const { accesscode, userid } = req.body;

    try {
        const user = await User.findByPk(userid);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const email = user.email;

        const course = await Course.findOne({ where: { accesscode } });

        if (!course) {
            return res.status(404).json({ message: 'Access code not found' });
        }

        const studentsURL = course.students;
        const fileName = studentsURL.split('/').pop();
        console.log(fileName);

        minioClient.getObject('students', fileName, (err, dataStream) => {
            if (err) {
                console.error('Error fetching file from MinIO:', err);
                return res.status(500).json({ message: 'Error fetching file from MinIO' });
            }

            let emailExists = false;
            let roleid = null;
            dataStream
                .pipe(csvParser())
                .on('data', (row) => {
                    if (row.Email === email) {
                        emailExists = true;
                        roleid = parseInt(row.RoleID, 10); // Assumes the roleid is in the second column with header 'RoleID'
                    }
                })
                .on('end', async () => {
                    if (!emailExists) {
                        return res.status(404).json({ message: 'You are not eligible for this course. Contact the instructor for access.' });
                    }
                    try {
                        let tokenPayload = {
                            userid: user.userid,
                            firstname: user.firstname,
                            roleid: roleid,
                            email: user.email,
                            courseid: course.courseid
                        };

                        if (roleid === 4) {
                            // Update user role
                            await user.update({ roleid: 4 });

                            // Add to CourseInstructors as TA
                            const [instructor, created] = await CourseInstructors.findOrCreate({
                                where: {
                                    userid: user.userid,
                                    courseid: course.courseid,
                                    role: 'TA'
                                }
                            });

                            if (!created) {
                                return res.status(400).json({ message: 'You are already listed as a TA for this course' });
                            } else {
                                const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
                                return res.status(200).json({ message: 'Added as TA successfully', token: token });
                            }
                        } else {
                            const [enrollment, created] = await Enrollment.findOrCreate({
                                where: {
                                    userid: user.userid,
                                    courseid: course.courseid
                                },
                                defaults: {
                                    enrollmentdate: new Date()
                                }
                            });

                            if (!created) {
                                return res.status(400).json({ message: 'You are already enrolled in this course' });
                            } else {
                                const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
                                return res.status(200).json({ message: 'Enrolled successfully', token: token });
                            }
                        }
                    } catch (error) {
                        console.error('Error processing enrollment or TA addition:', error);
                        return res.status(500).json({ message: 'Server error' });
                    }
                })
                .on('error', (error) => {
                    console.error('Error parsing CSV:', error);
                    return res.status(500).json({ message: 'Error parsing CSV' });
                });
        });
    } catch (error) {
        console.error('Error checking access code and email:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { uploadCsv, getAccessCode, getStudentsFile, checkAccessCodeAndEmail };