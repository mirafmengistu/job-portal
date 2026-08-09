import { gql } from '@apollo/client';

export const APPLY_TO_JOB_MUTATION = gql`
  mutation ApplyToJob(
    $jobId: ID!
    $applicantId: ID!
    $coverLetter: String
    $resume: String!
  ) {
    applyToJob(
      jobId: $jobId
      applicantId: $applicantId
      coverLetter: $coverLetter
      resume: $resume
    ) {
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
    }
  }
`;

export const UPDATE_APPLICATION_STATUS_MUTATION = gql`
  mutation UpdateApplicationStatus($id: ID!, $status: String!) {
    updateApplicationStatus(id: $id, status: $status) {
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
      updatedAt
    }
  }
`;

export const WITHDRAW_APPLICATION_MUTATION = gql`
  mutation WithdrawApplication($id: ID!) {
    withdrawApplication(id: $id) {
      id
      job {
        title
        company
      }
    }
  }
`;

// Types
export type ApplicationStatus = 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';

export type Application = {
  id: string;
  status: ApplicationStatus;
  job: {
    id: string;
    title: string;
    company: string;
    location?: string;
    type?: string;
    description?: string;
  };
  applicant: {
    id: string;
    name: string;
    email: string;
  };
  coverLetter?: string;
  resume: string;
  createdAt: string;
  updatedAt: string;
};

export type ApplyToJobInput = {
  jobId: string;
  applicantId: string;
  coverLetter?: string;
  resume: string;
};

export type ApplyToJobMutationData = {
  applyToJob: Application;
};

export type UpdateApplicationStatusMutationData = {
  updateApplicationStatus: Application;
};

export type WithdrawApplicationMutationData = {
  withdrawApplication: {
    id: string;
    job: {
      title: string;
      company: string;
    };
  };
};