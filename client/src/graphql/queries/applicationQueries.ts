import { gql } from '@apollo/client';
import type { Application } from '../mutations/applicationMutations';

export const GET_APPLICATIONS_BY_APPLICANT = gql`
  query GetApplicationsByApplicant($applicantId: ID!) {
    applicationsByApplicant(applicantId: $applicantId) {
      id
      status
      job {
        id
        title
        company
        location
        type
      }
      applicant {
        id
        name
        email
      }
      coverLetter
      resume
      createdAt
      updatedAt
    }
  }
`;

export const GET_APPLICATIONS_BY_JOB = gql`
  query GetApplicationsByJob($jobId: ID!) {
    applicationsByJob(jobId: $jobId) {
      id
      status
      job {
        id
        title
        company
      }
      applicant {
        id
        name
        email
      }
      coverLetter
      resume
      createdAt
      updatedAt
    }
  }
`;

export const GET_APPLICATION = gql`
  query GetApplication($id: ID!) {
    application(id: $id) {
      id
      status
      job {
        id
        title
        company
        location
        type
        description
      }
      applicant {
        id
        name
        email
      }
      coverLetter
      resume
      createdAt
      updatedAt
    }
  }
`;

// ✅ FIXED: Use the correct query name
export const CHECK_APPLICATION_STATUS = gql`
  query CheckApplicationStatus($jobId: ID!, $applicantId: ID!) {
    checkApplicationStatus(jobId: $jobId, applicantId: $applicantId) {
      id
      applicant {
        id
      }
      status
    }
  }
`;

// Types
export type GetApplicationsByApplicantData = {
  applicationsByApplicant: Application[];
};

export type GetApplicationsByJobData = {
  applicationsByJob: Application[];
};

export type GetApplicationData = {
  application: Application;
};

export type CheckApplicationStatusData = {
  checkApplicationStatus: {
    id: string;
    applicant: {
      id: string;
    };
    status: string;
  }[];
};