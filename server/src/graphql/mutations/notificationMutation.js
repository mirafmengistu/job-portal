import { GraphQLID, GraphQLNonNull, GraphQLBoolean } from "graphql";
import NotificationType from "../types/NotificationType.js";
import { Notification } from "../../models/Notification.js";

export const notificationMutation = {
  // Mark a single notification as read
  markNotificationAsRead: {
    type: NotificationType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      userId: { type: new GraphQLNonNull(GraphQLID) }, // for security
    },
    async resolve(parent, args) {
      try {
        const notification = await Notification.findOneAndUpdate(
          { _id: args.id, recipient: args.userId },
          { isRead: true },
          { new: true }
        );

        if (!notification) {
          throw new Error("Notification not found");
        }

        return notification;
      } catch (error) {
        throw new Error(`Failed to mark notification as read: ${error.message}`);
      }
    },
  },

  // Mark all notifications as read for a user
  markAllNotificationsAsRead: {
    type: GraphQLBoolean,
    args: {
      userId: { type: new GraphQLNonNull(GraphQLID) },
    },
    async resolve(parent, args) {
      try {
        await Notification.updateMany(
          { recipient: args.userId, isRead: false },
          { isRead: true }
        );
        return true;
      } catch (error) {
        throw new Error(`Failed to mark all as read: ${error.message}`);
      }
    },
  },
};