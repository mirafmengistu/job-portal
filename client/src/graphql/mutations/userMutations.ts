import { gql } from '@apollo/client';

export const SIGNUP_MUTATION = gql`
  mutation Signup($name: String!, $email: String!, $password: String!, $role: String) {
    signup(name: $name, email: $email, password: $password, role: $role) {
      id
      name
      email
      role
      createdAt
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $name: String, $email: String) {
    updateUser(id: $id, name: $name, email: $email) {
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

// ✅ FIXED: Remove 'savedJobs' from the response since it might not be in UserType
export const SAVE_JOB_MUTATION = gql`
  mutation SaveJob($userId: ID!, $jobId: ID!) {
    saveJob(userId: $userId, jobId: $jobId) {
      id
      name
      email
      role
      createdAt
    }
  }
`;

// ✅ FIXED: Remove 'savedJobs' from the response since it might not be in UserType
export const UNSAVE_JOB_MUTATION = gql`
  mutation UnsaveJob($userId: ID!, $jobId: ID!) {
    unsaveJob(userId: $userId, jobId: $jobId) {
      id
      name
      email
      role
      createdAt
    }
  }
`;

// 📌 ADD THESE TYPES FOR USE IN COMPONENTS
export type SignupMutationData = {
  signup: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
};

export type LoginMutationData = {
  login: string; // JWT token
};

export type GetMeQueryData = {
  me: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
};

export type UpdateUserMutationData = {
  updateUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
};

export type SaveJobMutationData = {
  saveJob: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
};

export type UnsaveJobMutationData = {
  unsaveJob: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
};