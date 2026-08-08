import { GraphQLObjectType } from "graphql";
import { userQueries } from "./userQueries.js";
import { jobQueries } from "./jobQueries.js";
import { applicationQueries } from "./applicationQueries.js";

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    ...userQueries,
    ...jobQueries,
    ...applicationQueries,
  },
});

export default RootQuery;