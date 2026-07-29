# Job Portal API

GraphQL-based Job Portal API built with Node.js, Express, MongoDB.

## Features
- User Authentication (Signup/Login with JWT)
- Job Management (CRUD operations)
- Application System with status tracking
- Saved Jobs (bookmarks)
- Search & Filter by location, type, title

## Tech Stack
- Node.js + Express
- GraphQL
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

## Project Structure
src/
├── app.js
├── config/
│ └── db.js
├── models/
│ ├── User.js
│ ├── Job.js
│ └── Application.js
├── graphql/
│ ├── types/
│ │ ├── UserType.js
│ │ ├── JobType.js
│ │ └── ApplicationType.js
│ ├── queries/
│ │ ├── userQueries.js
│ │ ├── jobQueries.js
│ │ ├── applicationQueries.js
│ │ └── RootQuery.js
│ ├── mutations/
│ │ ├── userMutation.js
│ │ ├── jobMutation.js
│ │ ├── applicationMutation.js
│ │ └── rootMutation.js
│ └── index.js
└── schema/
└── schema.js

## Quick Start
```bash
npm install
# Create .env file
node src/app.js

GraphQL Playground
http://localhost:9000/graphql

Sample Queries
Signup:

mutation {
  signup(name: "John", email: "john@test.com", password: "123456", role: "seeker") {
    id name email role
  }
}
Login:

mutation {
  login(email: "john@test.com", password: "123456")
}
Create Job:

mutation {
  createJob(
    title: "Developer"
    company: "Google"
    description: "Great opportunity"
    location: "Remote"
    type: "full-time"
    postedBy: "USER_ID"
  ) {
    id title company
  }
}
Apply to Job:

mutation {
  applyToJob(
    jobId: "JOB_ID"
    applicantId: "USER_ID"
    resume: "resume.pdf"
  ) {
    id status
  }
}
View Jobs:

query {
  jobs(search: "Developer", location: "Remote") {
    id title company location
  }
}
Save Job:

mutation {
  saveJob(userId: "USER_ID", jobId: "JOB_ID") {
    id name
  }
}

Database Models
User: name, email, password, role(seeker/recruiter), savedJobs[]
Job: title, company, description, location, type, salary, requirements, postedBy
Application: job, applicant, coverLetter, resume, status(pending/reviewing/hired/rejected)

Author
Built as part of full-stack development learning journey.

License
Educational purposes only.