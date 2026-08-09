import { GraphQLObjectType, GraphQLID, GraphQLString } from "graphql";
import JobType from "./JobType.js";
import UserType from "./UserType.js";
import { Job } from "../../models/Job.js";
import { User } from "../../models/User.js";

const ApplicationType = new GraphQLObjectType({
  name: "Application",
  fields: () => ({
    id: { type: GraphQLID },
    job: {
      type: JobType,
      async resolve(parent, args) {
        try {
          const job = await Job.findById(parent.job);
          return job;
        } catch (error) {
          throw new Error(`Failed to fetch job: ${error.message}`);
        }
      },
    },
    applicant: {
      type: UserType,
      async resolve(parent, args) {
        try {
          const user = await User.findById(parent.applicant).select('-password');
          return user;
        } catch (error) {
          throw new Error(`Failed to fetch applicant: ${error.message}`);
        }
      },
    },
    coverLetter: { type: GraphQLString },
    resume: { type: GraphQLString },
    status: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

export default ApplicationType;