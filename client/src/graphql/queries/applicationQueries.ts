import { gql } from '@apollo/client';
import type { Application } from '../mutations/applicationMutations';

export const GET_APPLICATIONS_BY_APPLICANT = gql`
  query GetApplicationsByApplicant($applicantId: ID!, $page: Int, $limit: Int) {
    applicationsByApplicant(applicantId: $applicantId, page: $page, limit: $limit) {
      applications {
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
      pageInfo {
        currentPage
        totalPages
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const GET_APPLICATIONS_BY_JOB = gql`
  query GetApplicationsByJob($jobId: ID!, $page: Int, $limit: Int) {
    applicationsByJob(jobId: $jobId, page: $page, limit: $limit) {
      applications {
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
      pageInfo {
        currentPage
        totalPages
        totalCount
        hasNextPage
        hasPreviousPage
      }
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
  applicationsByApplicant: {
    applications: Application[];
    pageInfo: PageInfo;
  };
};

export type GetApplicationsByJobData = {
  applicationsByJob: {
    applications: Application[];
    pageInfo: PageInfo;
  };
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

export type PageInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};



