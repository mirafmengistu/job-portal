import { gql } from '@apollo/client';
import type { Job } from '../queries/jobQueries';

export const CREATE_JOB_MUTATION = gql`
  mutation CreateJob(
    $title: String!
    $company: String!
    $description: String!
    $location: String!
    $type: String!
    $salary: SalaryInput
    $requirements: [String!]!
    $postedBy: ID!
  ) {
    createJob(
      title: $title
      company: $company
      description: $description
      location: $location
      type: $type
      salary: $salary
      requirements: $requirements
      postedBy: $postedBy
    ) {
      id
      title
      company
      description
      location
      type
      salary {
        min
        max
      }
      requirements
      isActive
      postedBy {
        id
        name
        email
      }
      createdAt
    }
  }
`;

export const UPDATE_JOB_MUTATION = gql`
  mutation UpdateJob(
    $id: ID!
    $title: String
    $company: String
    $description: String
    $location: String
    $type: String
    $salary: SalaryInput
    $requirements: [String!]
    $isActive: Boolean
  ) {
    updateJob(
      id: $id
      title: $title
      company: $company
      description: $description
      location: $location
      type: $type
      salary: $salary
      requirements: $requirements
      isActive: $isActive
    ) {
      id
      title
      company
      description
      location
      type
      salary {
        min
        max
      }
      requirements
      isActive
      postedBy {
        id
        name
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_JOB_MUTATION = gql`
  mutation DeleteJob($id: ID!) {
    deleteJob(id: $id) {
      id
      title
      company
    }
  }
`;

// Types
// ✅ ADD THIS: CreateJobInput type
export type CreateJobInput = {
  title: string;
  company: string;
  description: string;
  location: string;
  type: string;
  category?: string;
  salary?: {
    min?: string;
    max?: string;
  };
  requirements: string[];
  postedBy: string;
};

export type UpdateJobInput = {
  id: string;
  title?: string;
  company?: string;
  description?: string;
  location?: string;
  type?: string;
  salary?: {
    min?: string;
    max?: string;
  };
  requirements?: string[];
  isActive?: boolean;
};

export type CreateJobMutationData = {
  createJob: Job;
};

export type UpdateJobMutationData = {
  updateJob: Job;
};

export type DeleteJobMutationData = {
  deleteJob: {
    id: string;
    title: string;
    company: string;
  };
};