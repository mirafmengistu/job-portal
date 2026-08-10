import { GraphQLObjectType } from "graphql";
import { userQueries } from "./userQueries.js";
import { jobQueries } from "./jobQueries.js";
import { applicationQueries } from "./applicationQueries.js";
import { notificationQueries } from "./notificationQueries.js";

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    ...userQueries,
    ...jobQueries,
    ...applicationQueries,
    ...notificationQueries,
  },
});

export default RootQuery;