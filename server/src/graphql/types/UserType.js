import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList } from "graphql";
import JobType from "./JobType.js";

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    role: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    
    savedJobs: {
      type: new GraphQLList(JobType),
      resolve: async (parent, args) => {
        try {
          // parent is the user object
          if (parent.savedJobs && parent.savedJobs.length > 0) {
            // Import Job model dynamically to avoid circular dependency
            const { Job } = await import("../../models/Job.js");
            const jobs = await Job.find({
              _id: { $in: parent.savedJobs },
              isActive: true
            });
            return jobs;
          }
          return [];
        } catch (error) {
          console.error("Error fetching saved jobs:", error);
          return [];
        }
      }
    },
  }),
});

export default UserType;