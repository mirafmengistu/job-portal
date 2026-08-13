import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
} from "graphql";
import UserType from "./UserType.js";
import PageInfoType from "../types/pagination/PageInfoType.js";
import { User } from "../../models/User.js";

const AuditLogType = new GraphQLObjectType({
  name: "AuditLog",
  fields: () => ({
    id: { type: GraphQLID },
    action: { type: GraphQLString },
    targetType: { type: GraphQLString },
    targetId: { type: GraphQLID },
    details: { type: GraphQLString },
    metadata: {
      type: GraphQLString, // return as JSON string for simplicity
      resolve: (parent) => {
        try {
          return JSON.stringify(parent.metadata || {});
        } catch {
          return "{}";
        }
      },
    },
    actor: {
      type: UserType,
      async resolve(parent) {
        try {
          return await User.findById(parent.actor).select("-password");
        } catch {
          return null;
        }
      },
    },
    createdAt: { type: GraphQLString },
  }),
});

export const AuditLogConnectionType = new GraphQLObjectType({
  name: "AuditLogConnection",
  fields: {
    logs: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AuditLogType))),
    },
    pageInfo: { type: new GraphQLNonNull(PageInfoType) },
  },
});

export default AuditLogType;