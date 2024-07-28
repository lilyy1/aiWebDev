[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-718a45dd9cf7e7f842a935f5ebbe5719a5e09af4491e668f4dbf3b35d5cca122.svg)](https://classroom.github.com/online_ide?assignment_repo_id=15119669&assignment_repo_type=AssignmentRepo)
# Project-Starter

Please use the provided folder structure for your docs (project plan, design documenation, communications log, weekly logs and final documentation), source code, tesing, etc.    You are free to organize any additional internal folder structure as required by the project.  The team **MUST** use a branching workflow and once an item is ready, do remember to issue a PR, review and merge in into the master brach.
```
.
├── docs                    # Documentation files (alternatively `doc`)
│   ├── TOC.md              # Table of contents
│   ├── plan                # Scope and Charter
│   ├── design              # Getting started guide
│   ├── final               # Getting started guide
│   ├── logs                # Team Logs
│   └── ...
├── build                   # Compiled files (alternatively `dist`))    
├── app                     # Source files (alternatively `lib` or `src`)
├── test                    # Automated tests (alternatively `spec` or `tests`)
├── tools                   # Tools and utilities
├── LICENSE                 # The license for this project 
└── README.md
```
You can find additional information on folder structure convetions [here](https://github.com/kriasoft/Folder-Structure-Conventions). 

Also, update your README.md file with the team and client/project information.  You can find details on writing GitHub Markdown [here](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) as well as a [handy cheatsheet](https://enterprise.github.com/downloads/en/markdown-cheatsheet.pdf).   

# Setup Instructions

1. Clone the repository and open the project in your preferred IDE

2. Add a .env and .env.test file in the src/server folder. Ensure the file names are added to your .gitignore in the src/server folder
    ```
    JWT_SECRET='secret_api_key'
    ```

## Using docker

3. From the root, make sure you are in the src folder. Open docker desktop
4. ```
   docker-compose down //not necessary the first time
   docker-compose build
   docker-compose up
   ```
5. (Optional) To access pgadmin, go to http://localhost:5050/browser/
6. To access the webpage, go to http://localhost:3050/

## Not using Docker (For making frontend changes faster and easier as the webpage will update in real-time. Backend will not work)
3. From the root, make sure you are in the src/client folder
4. ```
    npm install //only necessary first time or if a change to package.json has been made
    ```
5.
     ```npm start``` This should open up the webpage automatically to http://localhost:3000/

  # Manual Testing
  To run tests, from the root go to the src/server folder
  Run ```npm test```
