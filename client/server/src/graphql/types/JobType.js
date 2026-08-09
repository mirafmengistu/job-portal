import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList, GraphQLBoolean, GraphQLInputObjectType } from "graphql";
import UserType from "./UserType.js";
import { User } from "../../models/User.js";

const SalaryType = new GraphQLObjectType({
  name: "Salary",
  fields: () => ({
    min: { type: GraphQLString },
    max: { type: GraphQLString },
  }),
});

const JobType = new GraphQLObjectType({
  name: "Job",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    company: { type: GraphQLString },
    description: { type: GraphQLString },
    location: { type: GraphQLString },
    type: { type: GraphQLString },
    salary: { type: SalaryType },
    requirements: { type: new GraphQLList(GraphQLString) },
    isActive: { type: GraphQLBoolean },
    postedBy: {
      type: UserType,
      async resolve(parent, args) {
        try {
          const user = await User.findById(parent.postedBy).select('-password');
          return user;
        } catch (error) {
          throw new Error(`Failed to fetch user: ${error.message}`);
        }
      },
    },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

export default JobType;