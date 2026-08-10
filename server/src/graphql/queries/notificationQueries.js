import { GraphQLID, GraphQLInt, GraphQLNonNull } from "graphql";
import NotificationType from "../types/NotificationType.js";
import NotificationConnectionType from "../types/notification/NotificationConnectionType.js";
import { Notification } from "../../models/Notification.js";
import { GraphQLObjectType } from "graphql";

export const notificationQueries = {
  // Get notifications for a user (with pagination)
  myNotifications: {
    type: NotificationConnectionType,
    args: {
      userId: { type: new GraphQLNonNull(GraphQLID) },
      page: { type: GraphQLInt, defaultValue: 1 },
      limit: { type: GraphQLInt, defaultValue: 10 },
    },
    async resolve(parent, args) {
      try {
        const page = Math.max(1, args.page || 1);
        const limit = Math.min(50, Math.max(1, args.limit || 10));
        const skip = (page - 1) * limit;

        const filter = { recipient: args.userId };

        const [notifications, totalCount] = await Promise.all([
          Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
          Notification.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalCount / limit) || 1;

        return {
          notifications,
          pageInfo: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      } catch (error) {
        throw new Error(`Failed to fetch notifications: ${error.message}`);
      }
    },
  },

  // Get unread notifications count
  unreadNotificationsCount: {
    type: GraphQLInt,
    args: {
      userId: { type: new GraphQLNonNull(GraphQLID) },
    },
    async resolve(parent, args) {
      try {
        const count = await Notification.countDocuments({
          recipient: args.userId,
          isRead: false,
        });
        return count;
      } catch (error) {
        throw new Error(`Failed to fetch unread count: ${error.message}`);
      }
    },
  },
};