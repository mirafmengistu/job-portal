import { GraphQLObjectType, GraphQLList, GraphQLNonNull } from "graphql";
import NotificationType from "../NotificationType.js";
import PageInfoType from "../pagination/PageInfoType.js";

const NotificationConnectionType = new GraphQLObjectType({
  name: "NotificationConnection",
  fields: {
    notifications: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NotificationType))),
    },
    pageInfo: { type: new GraphQLNonNull(PageInfoType) },
  },
});

export default NotificationConnectionType;