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