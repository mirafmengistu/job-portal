import { GraphQLObjectType } from "graphql";
import { userMutation } from "./userMutation.js";
import { jobMutation } from "./jobMutation.js";
import { applicationMutation } from "./applicationMutation.js";

const rootMutation = new GraphQLObjectType({
  name: "RootMutation",
  fields: {
    ...userMutation,
    ...jobMutation, 
    ...applicationMutation
  },
});

export default rootMutation;