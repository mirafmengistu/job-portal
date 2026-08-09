import { gql } from '@apollo/client';
import type { Job } from './jobQueries';

export const GET_USER_PROFILE = gql`
  query GetUserProfile($id: ID!) {
    user(id: $id) {
      id
      name
      email
      role
      createdAt
    }
  }
`;

export const GET_ME_QUERY = gql`
  query GetMe($token: String!) {
    me(token: $token) {
      id
      name
      email
      role
      createdAt
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
      createdAt
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

// Types
export type GetSavedJobsData = {
  savedJobs: Job[];
};

// Types
export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export type GetUserProfileData = {
  user: User;
};

export type GetMeQueryData = {
  me: User;
};

export type GetUsersData = {
  users: User[];
};