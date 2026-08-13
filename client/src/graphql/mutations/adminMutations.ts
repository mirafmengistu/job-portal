import { gql } from '@apollo/client';

// ======================
// QUERIES
// ======================

export const ADMIN_STATS_QUERY = gql`
  query AdminStats($adminId: ID!) {
    adminStats(adminId: $adminId) {
      totalUsers
      totalSeekers
      totalRecruiters
      totalAdmins
      activeUsers
      inactiveUsers
      totalJobs
      activeJobs
      inactiveJobs
      totalApplications
    }
  }
`;

export const ADMIN_USERS_QUERY = gql`
  query AdminUsers(
    $adminId: ID!
    $page: Int
    $limit: Int
    $search: String
    $role: String
    $isActive: Boolean
  ) {
    adminUsers(
      adminId: $adminId
      page: $page
      limit: $limit
      search: $search
      role: $role
      isActive: $isActive
    ) {
      users {
        id
        name
        email
        role
        isActive
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

export const ADMIN_JOBS_QUERY = gql`
  query AdminJobs(
    $adminId: ID!
    $page: Int
    $limit: Int
    $search: String
    $isActive: Boolean
  ) {
    adminJobs(
      adminId: $adminId
      page: $page
      limit: $limit
      search: $search
      isActive: $isActive
    ) {
      jobs {
        id
        title
        company
        location
        type
        isActive
        createdAt
        postedBy {
          id
          name
          email
        }
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

// ======================
// MUTATIONS
// ======================

export const ADMIN_UPDATE_USER_ROLE_MUTATION = gql`
  mutation AdminUpdateUserRole($adminId: ID!, $userId: ID!, $role: String!) {
    adminUpdateUserRole(adminId: $adminId, userId: $userId, role: $role) {
      id
      name
      email
      role
      isActive
    }
  }
`;

export const ADMIN_TOGGLE_USER_ACTIVE_MUTATION = gql`
  mutation AdminToggleUserActive($adminId: ID!, $userId: ID!) {
    adminToggleUserActive(adminId: $adminId, userId: $userId) {
      id
      name
      email
      role
      isActive
    }
  }
`;

export const ADMIN_TOGGLE_JOB_ACTIVE_MUTATION = gql`
  mutation AdminToggleJobActive($adminId: ID!, $jobId: ID!) {
    adminToggleJobActive(adminId: $adminId, jobId: $jobId) {
      id
      title
      isActive
    }
  }
`;

export const ADMIN_DELETE_JOB_MUTATION = gql`
  mutation AdminDeleteJob($adminId: ID!, $jobId: ID!) {
    adminDeleteJob(adminId: $adminId, jobId: $jobId) {
      id
      title
    }
  }
`;

export const ADMIN_AUDIT_LOGS_QUERY = gql`
  query AdminAuditLogs(
    $adminId: ID!
    $page: Int
    $limit: Int
    $action: String
    $targetType: String
  ) {
    adminAuditLogs(
      adminId: $adminId
      page: $page
      limit: $limit
      action: $action
      targetType: $targetType
    ) {
      logs {
        id
        action
        targetType
        targetId
        details
        createdAt
        actor {
          id
          name
          email
        }
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

export type AuditLogItem = {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type AdminAuditLogsQueryData = {
  adminAuditLogs: {
    logs: AuditLogItem[];
    pageInfo: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

// ======================
// TYPES
// ======================

export type AdminStats = {
  totalUsers: number;
  totalSeekers: number;
  totalRecruiters: number;
  totalAdmins: number;
  activeUsers: number;
  inactiveUsers: number;
  totalJobs: number;
  activeJobs: number;
  inactiveJobs: number;
  totalApplications: number;
};

export type AdminStatsQueryData = {
  adminStats: AdminStats;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export type AdminUsersQueryData = {
  adminUsers: {
    users: AdminUser[];
    pageInfo: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

export type AdminJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  postedBy: {
    id: string;
    name: string;
    email: string;
  };
};

export type AdminJobsQueryData = {
  adminJobs: {
    jobs: AdminJob[];
    pageInfo: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};