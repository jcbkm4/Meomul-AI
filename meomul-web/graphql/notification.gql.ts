import { gql } from "@apollo/client";

export const GET_MY_NOTIFICATIONS_QUERY = gql`
  query GetMyNotifications($unreadOnly: Boolean, $limit: Float) {
    getMyNotifications(unreadOnly: $unreadOnly, limit: $limit) {
      _id
      userId
      type
      title
      message
      link
      read
      createdAt
    }
  }
`;

export const GET_UNREAD_COUNT_QUERY = gql`
  query GetUnreadCount {
    getUnreadCount
  }
`;

export const MARK_AS_READ_MUTATION = gql`
  mutation MarkAsRead($notificationId: String!) {
    markAsRead(notificationId: $notificationId) {
      _id
      userId
      type
      title
      message
      link
      read
      createdAt
    }
  }
`;

export const MARK_ALL_AS_READ_MUTATION = gql`
  mutation MarkAllAsRead {
    markAllAsRead
  }
`;

export const DELETE_NOTIFICATION_MUTATION = gql`
  mutation DeleteNotification($notificationId: String!) {
    deleteNotification(notificationId: $notificationId)
  }
`;

export const GET_SUBSCRIPTION_REQUESTS_QUERY = gql`
  query GetSubscriptionRequests {
    getSubscriptionRequests {
      _id
      userId
      type
      title
      message
      link
      read
      createdAt
    }
  }
`;

export const GET_ALL_NOTIFICATIONS_ADMIN_QUERY = gql`
  query GetAllNotificationsAdmin($input: PaginationInput!) {
    getAllNotificationsAdmin(input: $input) {
      list {
        _id
        userId
        userNick
        type
        title
        message
        link
        read
        createdAt
      }
      metaCounter {
        total
      }
    }
  }
`;
