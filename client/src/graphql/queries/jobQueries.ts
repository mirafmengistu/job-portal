import { gql } from '@apollo/client';

export const GET_JOBS_QUERY = gql`
  query GetJobs($search: String, $location: String, $type: String) {
    jobs(search: $search, location: $location, type: $type) {
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

export const GET_JOB_QUERY = gql`
  query GetJob($id: ID!) {
    job(id: $id) {
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

export const GET_JOBS_BY_RECRUITER = gql`
  query GetJobsByRecruiter($recruiterId: ID!) {
    jobsByRecruiter(recruiterId: $recruiterId) {
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

export const GET_STATS_QUERY = gql`
  query GetStats {
    jobsStats {
      totalJobs
      totalCompanies
      totalUsers
      totalApplications
    }
  }
`;

export const GET_SAVED_JOBS = gql`
  query GetSavedJobs($userId: ID!) {
    savedJobs(userId: $userId) {
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

export type GetSavedJobsData = {
  savedJobs: Job[];
};

// Types
export type Job = {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  type: string;
  salary?: {
    min?: string;
    max?: string;
  };
  requirements: string[];
  isActive: boolean;
  postedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
};

export type Stats = {
  totalJobs: string;
  totalCompanies: string;
  totalUsers: string;
  totalApplications: string;
};

export type GetStatsQueryData = {
  jobsStats: Stats;
};

export type GetJobsQueryData = {
  jobs: Job[];
};

export type GetJobQueryData = {
  job: Job;
};

export type GetJobsByRecruiterData = {
  jobsByRecruiter: Job[];
};

export type GetJobsQueryVariables = {
  search?: string;
  location?: string;
  type?: string;
};