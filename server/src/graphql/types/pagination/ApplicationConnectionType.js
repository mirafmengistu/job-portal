import { GraphQLObjectType, GraphQLList, GraphQLNonNull } from "graphql";
import ApplicationType from "../ApplicationType.js";
import PageInfoType from "./PageInfoType.js";

const ApplicationConnectionType = new GraphQLObjectType({
  name: "ApplicationConnection",
  fields: {
    applications: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ApplicationType))) },
    pageInfo: { type: new GraphQLNonNull(PageInfoType) },
  },
});

export default ApplicationConnectionType;