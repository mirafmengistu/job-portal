import { GraphQLObjectType, GraphQLList, GraphQLNonNull } from "graphql";
import JobType from "../JobType.js";
import PageInfoType from "./PageInfoType.js";

const JobConnectionType = new GraphQLObjectType({
  name: "JobConnection",
  fields: {
    jobs: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(JobType))) },
    pageInfo: { type: new GraphQLNonNull(PageInfoType) },
  },
});

export default JobConnectionType;