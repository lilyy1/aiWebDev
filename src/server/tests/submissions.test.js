const { getSubmission, getSubmissions, getSubmissionId } = require('../src/controllers/submissionsController');
const { Submission, User } = require('../src/models');
const { link } = require('../src/routes/submissionsRoutes');

jest.mock('../src/models');
jest.mock('minio', () => {
    return {
      Client: jest.fn().mockImplementation(() => {
        return {
          bucketExists: jest.fn((bucket, callback) => {
            const buckets = {
              answerkeys: true,
              rubrics: true,
              students: true,
              submissions: true,
            };
            if (buckets[bucket]) {
              callback(null, true);
            } else {
              callback(new Error(`Bucket ${bucket} does not exist.`), false);
            }
          }),
        };
      }),
    };
  });
    describe('getSubmission', () => {
        let req, res;

        beforeEach(() => {
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            req = {
                params: {},
            };
            jest.clearAllMocks();
            jest.spyOn(console, 'log').mockImplementation(() => {}); // Mock console.log
        });

        it('should return submission details with maxscore and user names', async () => {
            req.params.id = 1;
            const mockSubmission = {
                submissionid: 1,
                assignment: { maxscore: 100 },
                user: { firstname: 'John', lastname: 'Doe' },
                toJSON: jest.fn().mockReturnValue({
                    submissionid: 1,
                    assignment: { maxscore: 100 },
                    user: { firstname: 'John', lastname: 'Doe' },
                }),
            };
            
            Submission.findOne.mockResolvedValueOnce(mockSubmission);

            await getSubmission(req, res);

            expect(res.json).toHaveBeenCalledWith({
                submissionid: 1,
                maxscore: 100,
                firstname: 'John',
                lastname: 'Doe',
                assignment: {
                    maxscore: 100
                },
                averagescore: undefined,
                feedback: 'No feedback provided',
                user: {
                    firstname: 'John',
                    lastname: 'Doe'
                },
                link: 'No link submitted',
                content: 'No content submitted'
            });
        });

        it('should return error if submission ID is not provided', async () => {
            await getSubmission(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Submission ID is required' });
        });

        it('should return error if submission not found', async () => {
            req.params.id = 1;
            Submission.findOne.mockResolvedValueOnce(null);

            await getSubmission(req, res);
            expect(console.log).toHaveBeenCalledWith('Submission not found');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Submission not found' });
        });

        it('should handle server errors', async () => {
            req.params.id = 1;
            Submission.findOne.mockRejectedValueOnce(new Error('Database error'));

            await getSubmission(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'An error occurred while fetching the submission',
            });
        });
    });

    describe('getSubmissions', () => {
        let req, res;

        beforeEach(() => {
            req = {
                params: { id: '1' },
                query: { courseid: '101' }
            };
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            jest.clearAllMocks();
        });

        it('should return 500 if User model is not configured correctly', async () => {
            User.findAll = undefined;

            await getSubmissions(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Internal server error',
                details: 'User model configuration error'
            });
        });

        it('should return submissions successfully', async () => {
            const mockSubmissions = [
                {
                    userid: 1,
                    firstname: 'John',
                    lastname: 'Doe',
                    email: 'john.doe@example.com',
                    toJSON: function() { return this; }
                }
            ];

            User.findAll = jest.fn().mockResolvedValue(mockSubmissions);

            await getSubmissions(req, res);

            expect(res.json).toHaveBeenCalledWith(mockSubmissions);
        });

        it('should handle errors during fetching submissions', async () => {
            const error = new Error('Database error');
            User.findAll = jest.fn().mockRejectedValue(error);

            await getSubmissions(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'An error occurred',
                details: error.message
            });
        });

    describe('getSubmissionId', () => {
        let req, res;
        
        beforeEach(() => {
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            req = {
                params: {
                    assignmentid: 1,
                    userid: 1,
                },
            };
            jest.clearAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
        });
        
        it('should return submission if found', async () => {
            const mockSubmission = {
                submissionid: 1,
                assignmentid: 1,
                userid: 1,
            };
        
            Submission.findOne.mockResolvedValue(mockSubmission);
        
            await getSubmissionId(req, res);
        
            expect(res.json).toHaveBeenCalledWith(mockSubmission);
            expect(res.status).not.toHaveBeenCalledWith(404);
        });
        
        it('should return 404 if submission is not found', async () => {
            Submission.findOne.mockResolvedValue(null);
        
            await getSubmissionId(req, res);
        
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Submission not found' });
        });
        
        it('should handle server errors', async () => {
            Submission.findOne.mockRejectedValue(new Error('Database error'));
        
            await getSubmissionId(req, res);
        
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'An error occurred while fetching the submission' });
        });
    });
});
