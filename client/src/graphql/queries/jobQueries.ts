import { gql } from '@apollo/client';

export const GET_JOBS_QUERY = gql`
  query GetJobs($search: String, $location: String, $type: String, $page: Int, $limit: Int) {
    jobs(search: $search, location: $location, type: $type, page: $page, limit: $limit) {
      jobs {
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

export const GET_JOBS_BY_RECRUITER = gql`
  query GetJobsByRecruiter($recruiterId: ID!, $page: Int, $limit: Int) {
    jobsByRecruiter(recruiterId: $recruiterId, page: $page, limit: $limit) {
      jobs {
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
  jobs: {
    jobs: Job[];
    pageInfo: PageInfo;
  };
};

export type GetJobQueryData = {
  job: Job;
};

export type GetJobsByRecruiterData = {
  jobsByRecruiter: {
    jobs: Job[];
    pageInfo: PageInfo;
  };
};

export type GetJobsQueryVariables = {
  search?: string;
  location?: string;
  type?: string;
  page?: number;
  limit?: number;
};

export type PageInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};




