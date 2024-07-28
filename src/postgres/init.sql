-- Creating the Roles table
CREATE TABLE Roles (
    RoleID SERIAL PRIMARY KEY,
    RoleName VARCHAR(10) NOT NULL CHECK (RoleName IN ('Student', 'Admin', 'Instructor', 'TA'))
);

-- Creating the Users table
CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    RoleID INT NOT NULL,
    VerificationCode VARCHAR(255),
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);

-- Creating the Courses table
CREATE TABLE Courses (
    CourseID SERIAL PRIMARY KEY,
    Term INT NOT NULL,
    StartDate TIMESTAMP(3) NOT NULL,
    EndDate TIMESTAMP(3) NOT NULL,
    AccessCode VARCHAR(36) UNIQUE,
    Students VARCHAR(255)
);

-- Creating the CourseInstructors table
CREATE TABLE CourseInstructors (
    CourseInstructorID SERIAL PRIMARY KEY,
    CourseID INT NOT NULL,
    UserID INT NOT NULL,
    Role VARCHAR(10) NOT NULL CHECK (Role IN ('Instructor', 'TA')),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    UNIQUE (UserID, CourseID)
);

-- Creating the Enrollments table
CREATE TABLE Enrollments (
    EnrollmentID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    CourseID INT NOT NULL,
    EnrollmentDate TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
    UNIQUE (UserID, CourseID)
);

-- Creating the Assignments table
CREATE TABLE Assignments (
    AssignmentID SERIAL PRIMARY KEY,
    CourseID INT NOT NULL,
    AssignmentName VARCHAR(100) NOT NULL,
    AssignmentDescription TEXT,
    SubmissionType VARCHAR(50) NOT NULL CHECK (SubmissionType IN ('file', 'link')),
    AnswerKey VARCHAR(255), 
    Rubric VARCHAR(255),  
    Prompt TEXT,
    MaxScore INT,
    AverageScore FLOAT,
    StartDate TIMESTAMP(3) NOT NULL,
    EndDate TIMESTAMP(3) NOT NULL,
    GradesReleased BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);

-- Creating the Submissions table
CREATE TABLE Submissions (
    SubmissionID SERIAL PRIMARY KEY,
    AssignmentID INT NOT NULL,
    UserID INT NOT NULL,
    SubmissionDate TIMESTAMP(3) NOT NULL,
    ContentType VARCHAR(50) NOT NULL CHECK (ContentType IN ('html', 'css', 'js', 'link')),
    ContentLink VARCHAR(255),
    Content TEXT,
    Grade FLOAT,
    Feedback TEXT,
    FOREIGN KEY (AssignmentID) REFERENCES Assignments(AssignmentID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Creating the Announcements table
CREATE TABLE Announcements (
    AnnouncementID SERIAL PRIMARY KEY,
    CourseID INT NOT NULL,
    Title VARCHAR(100) NOT NULL,
    Content TEXT NOT NULL,
    DatePosted TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);

-- Creating the RoleRequests table
CREATE TABLE RoleRequests (
    RequestID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    RequestDate TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(10) NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Approved', 'Rejected')),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Inserting roles into the Roles table
INSERT INTO Roles (RoleName) VALUES ('Student'); -- roleid = 1
INSERT INTO Roles (RoleName) VALUES ('Admin'); -- roleid = 2
INSERT INTO Roles (RoleName) VALUES ('Instructor'); -- roleid = 3
INSERT INTO Roles (RoleName) VALUES ('TA'); -- roleid = 4


-- Inserting users into the Users table
INSERT INTO Users (FirstName, LastName, Email, PasswordHash, RoleID)
VALUES ('Default', 'Admin', 'default_admin@example.com', '$2y$10$lc0smcb2nD.loNk.7RVm9uq1BLL5N.Fu1FXnUbyXtXhY.t4Rza1jK', 2); -- Admin user


INSERT INTO Users (FirstName, LastName, Email, PasswordHash, RoleID)
VALUES ('Default', 'Instructor', 'default_instructor@example.com', '$2b$10$fMbnqtpNG3vc8qBdLXUstu3xbRNI8bKxv8f0DswC1i0BA/UveDWw.', 3);



-- INSERT INTO Courses (Term, StartDate, EndDate, AccessCode)
-- VALUES (1, '2024-01-01 00:00:00', '2024-12-31 23:59:59', '3b1efa64');

-- INSERT INTO CourseInstructors (CourseID, UserID, Role)
-- VALUES (1, 2, 'Instructor');


INSERT INTO Users (FirstName, LastName, Email, PasswordHash, RoleID)
VALUES ('Default', 'TA', 'default_ta@example.com', '$2b$10$fMbnqtpNG3vc8qBdLXUstu3xbRNI8bKxv8f0DswC1i0BA/UveDWw.', 4);

-- INSERT INTO CourseInstructors (CourseID, UserID, Role)
-- VALUES (1, 3, 'TA');


INSERT INTO Users (FirstName, LastName, Email, PasswordHash, RoleID)
VALUES ('Default', 'Student', 'default_student@example.com', '$2b$10$jZiocTzMGxoMVYIAIISbLuTUUYcTbou3TsEyTlTWahvw/5d38INkK', 1);

-- INSERT INTO Enrollments (UserID, CourseID)
-- VALUES (2, 1); 

-- Insert assignments for the course

-- INSERT INTO Assignments (CourseID, AssignmentName, AssignmentDescription, StartDate, EndDate, MaxScore)
-- VALUES (
--     (SELECT CourseID FROM Courses WHERE Term = 1),
--     'Assignment 2',
--     'Description for Assignment 2',
--     '2023-02-01 00:00:00',
--     '2023-02-15 00:00:00',
--     100
-- );
-- INSERT INTO Assignments (
--     CourseID, 
--     AssignmentName, 
--     AssignmentDescription, 
--     SubmissionType, 
--     Prompt, 
--     MaxScore, 
--     AverageScore, 
--     StartDate, 
--     EndDate
-- ) VALUES (
--     1, 
--     'Default Assignment', 
--     'Default Description', -- Placeholder for AssignmentDescription
--     'file', 
--     'Default Prompt', -- Placeholder for Prompt
--     100, -- Placeholder for MaxScore
--     0.0, -- Placeholder for AverageScore, assuming no submissions yet
--     '2024-01-10 00:00:00', 
--     '2024-01-20 23:59:59'
-- );
-- Insert announcements for the course
-- INSERT INTO Announcements (CourseID, Title, Content)
-- VALUES
-- (1, 'Welcome to COSC 341', 'Welcome to the Intro to Web Programming course!'),
-- (1, 'Assignment 1 Released', 'The first assignment has been released. Please check the course page for more details.');



-- Insert Data into courses Table
-- INSERT INTO Courses (Term, StartDate, EndDate, AccessCode)
-- VALUES
-- (2, '2024-01-01 09:00:00', '2024-05-15 17:00:00', 'code2'),
-- (3, '2024-01-01 09:00:00', '2024-05-15 17:00:00', 'code3');

INSERT INTO Users (FirstName, LastName, Email, PasswordHash, RoleID)
VALUES ('Bob', 'Smith', 'bob_smith@example.com', '$2b$10$XcNQ7Y/9J6R3U3yx/U1Lruv9s4WkRJ4R/SeFt6t7jGh2mC1Zo7YIq', 3); -- Instructor

INSERT INTO Users (FirstName, LastName, Email, PasswordHash, RoleID)
VALUES ('Carol', 'White', 'carol_white@example.com', '$2b$10$Z1Yb9y8J4/B5kY3x7Q8i9Lu8W4K8Ia2zX5wN7hK4o8zFq1Kc7JkL2', 4); -- TA

INSERT INTO Users (FirstName, LastName, Email, PasswordHash, RoleID)
VALUES ('David', 'Brown', 'david_brown@example.com', '$2b$10$A2b3y1W8J6K9vJ4hF9T8u9K9w7Zk5Y4tX6rF8gM3nL9y1Hk2Qw1O.', 2); -- Admin

INSERT INTO Users (FirstName, LastName, Email, PasswordHash, RoleID)
VALUES ('Eve', 'Davis', 'eve_davis@example.com', '$2b$10$B8c8J7Y5K5Q4L8tR9V5u8W8j7R9Xf3L7s9kF6gP3mL2u7J8pN1H2O', 1); -- Student


-- Inserting dummy data into the RoleRequests table
INSERT INTO RoleRequests (UserID, RequestDate, Status)
VALUES
(3, '2024-07-01 10:00:00', 'Pending'),
(4, '2024-07-02 11:30:00', 'Approved'),
(5, '2024-07-03 14:45:00', 'Rejected'),
(6, '2024-07-04 09:20:00', 'Pending');

-- Inserting dummy data into the Assignments table
-- INSERT INTO Assignments (CourseID, AssignmentName, AssignmentDescription, SubmissionType, AnswerKey, Rubric, Prompt, MaxScore, AverageScore, StartDate, EndDate, GradesReleased)
-- VALUES 
--     (1, 'CSS Fundamentals', 'Style the HTML page created.', 'file', 'answerKey2.css', 'rubric2.css', 'Style the HTML page using CSS.', 100, 90.2, '2024-02-01 00:00:00', '2024-02-28 23:59:59', TRUE),
--     (2, 'JavaScript Introduction', 'Add interactivity to the HTML page.', 'file', 'answerKey3.js', 'rubric3.js', 'Add JavaScript to make the page interactive.', 100, 82.0, '2024-03-01 00:00:00', '2024-03-31 23:59:59', TRUE),
--     (2, 'External Links', 'Submit an external project link.', 'link', NULL, 'rubric4.link', 'Submit a link to an external project.', 100, 87.3, '2024-04-01 00:00:00', '2024-04-30 23:59:59', TRUE),
--     (3, 'Advanced HTML', 'Create a complex HTML layout.', 'file', 'answerKey5.html', 'rubric5.html', 'Create an advanced HTML layout with multiple sections.', 100, 92.5, '2024-05-01 00:00:00', '2024-05-31 23:59:59', TRUE);

-- Inserting dummy data into the Submissions table (matches the Assignments)
-- INSERT INTO Submissions (AssignmentID, UserID, SubmissionDate, ContentType, ContentLink, Content, Grade, Feedback)
-- VALUES 
--     (1, 4, '2024-01-15 10:00:00', 'html', 'http://example.com/submission1', '<html>...</html>', 85.5, 'Good work, but needs improvement in structure.'),
--     (1, 2, '2024-01-15 11:00:00', 'css', 'http://example.com/submission2', 'body { background-color: #fff; }', 92.0, 'Excellent use of CSS. Well done!'),
--     (2, 4, '2024-02-10 14:30:00', 'js', 'http://example.com/submission3', 'console.log("Hello World!");', 78.0, 'JavaScript code is functional but could be optimized.'),
--     (2, 3, '2024-02-10 15:00:00', 'link', 'http://example.com/submission4', NULL, 88.5, 'Great job! The external link works perfectly.'),
--     (3, 2, '2024-03-20 16:00:00', 'html', 'http://example.com/submission5', '<html>...</html>', 90.0, 'Very well done!'),
--     (3, 3, '2024-03-20 17:00:00', 'css', 'http://example.com/submission6', 'h1 { color: red; }', 95.0, 'Outstanding CSS work!'),
--     (4, 4, '2024-04-05 13:00:00', 'js', 'http://example.com/submission7', 'document.getElementById("demo").innerHTML = "Hello";', 80.0, 'JavaScript is correct but lacks comments.'),
--     (4, 2, '2024-04-05 14:00:00', 'link', 'http://example.com/submission8', NULL, 85.0, 'The link is working correctly, well done.'),
--     (4, 3, '2024-04-05 15:00:00', 'html', 'http://example.com/submission9', '<html>...</html>', 88.0, 'Good structure and content.'),
--     (5, 4, '2024-05-10 10:30:00', 'css', 'http://example.com/submission10', 'div { margin: 0 auto; }', 75.0, 'CSS is functional but could be more efficient.'),
--     (5, 2, '2024-05-10 11:00:00', 'js', 'http://example.com/submission11', 'alert("Hello World!");', 70.0, 'JavaScript is basic but correct.'),
--     (5, 3, '2024-05-10 12:00:00', 'link', 'http://example.com/submission12', NULL, 82.5, 'Link is correct, good job.');
