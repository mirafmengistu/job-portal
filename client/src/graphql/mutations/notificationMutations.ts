import { gql } from '@apollo/client';

// ======================
// QUERIES
// ======================

export const MY_NOTIFICATIONS_QUERY = gql`
  query MyNotifications($userId: ID!, $page: Int, $limit: Int) {
    myNotifications(userId: $userId, page: $page, limit: $limit) {
      notifications {
        id
        type
        title
        message
        isRead
        createdAt
        relatedApplication {
          id
          status
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

export const UNREAD_NOTIFICATIONS_COUNT_QUERY = gql`
  query UnreadNotificationsCount($userId: ID!) {
    unreadNotificationsCount(userId: $userId)
  }
`;

// ======================
// MUTATIONS
// ======================

export const MARK_NOTIFICATION_AS_READ_MUTATION = gql`
  mutation MarkNotificationAsRead($id: ID!, $userId: ID!) {
    markNotificationAsRead(id: $id, userId: $userId) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION = gql`
  mutation MarkAllNotificationsAsRead($userId: ID!) {
    markAllNotificationsAsRead(userId: $userId)
  }
`;

// ======================
// TYPES
// ======================

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedApplication?: {
    id: string;
    status: string;
  } | null;
};

export type MyNotificationsQueryData = {
  myNotifications: {
    notifications: Notification[];
    pageInfo: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

export type UnreadNotificationsCountQueryData = {
  unreadNotificationsCount: number;
};

export type MarkNotificationAsReadMutationData = {
  markNotificationAsRead: {
    id: string;
    isRead: boolean;
  };
};

export type MarkAllNotificationsAsReadMutationData = {
  markAllNotificationsAsRead: boolean;
};