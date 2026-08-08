<<<<<<< HEAD
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
=======
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

```bash
server/src/
├── app.js
├── config/
│   └── db.js
├── models/
│   ├── User.js
│   ├── Job.js
│   └── Application.js
├── graphql/
│   ├── type/
│   │   ├── UserType.js
│   │   ├── JobType.js
│   │   └── ApplicationType.js
│   ├── query/
│   │   ├── userQueries.js
│   │   ├── jobQueries.js
│   │   ├── applicationQueries.js
│   │   └── RootQuery.js
│   └── mutation/
│       ├── userMutation.js
│       ├── jobMutation.js
│       ├── applicationMutation.js
│       └── rootMutation.js
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
>>>>>>> d92178de365c1549353b733b075531849b415c4b
