import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLBoolean } from "graphql";
import ApplicationType from "./ApplicationType.js";
import { Application } from "../../models/Application.js";

const NotificationType = new GraphQLObjectType({
  name: "Notification",
  fields: () => ({
    id: { type: GraphQLID },
    type: { type: GraphQLString },
    title: { type: GraphQLString },
    message: { type: GraphQLString },
    isRead: { type: GraphQLBoolean },
    relatedApplication: {
      type: ApplicationType,
      async resolve(parent) {
        if (!parent.relatedApplication) return null;
        try {
          return await Application.findById(parent.relatedApplication);
        } catch (error) {
          return null;
        }
      },
    },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

export default NotificationType;