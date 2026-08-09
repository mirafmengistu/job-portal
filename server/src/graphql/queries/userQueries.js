import { GraphQLID, GraphQLList, GraphQLString, GraphQLNonNull } from "graphql";
import UserType from "../types/UserType.js";
import { User } from "../../models/User.js";
import JobType from "../types/JobType.js"
import jwt from "jsonwebtoken";

export const userQueries = {
  // Get all users
  users: {
    type: new GraphQLList(UserType),
    async resolve(parent, args) {
      try {
        const users = await User.find().select('-password');
        return users;
      } catch (error) {
        throw new Error(`Failed to fetch users: ${error.message}`);
      }
    },
  },

  // Get single user by ID - Using instructor's pattern!
  user: {
    type: UserType,
    args: {
      id: { type: GraphQLID },
    },
    async resolve(parent, args) {
      try {
        // ✅ Mongoose automatically maps "id" to "_id"
        const user = await User.findById(args.id).select('-password');
        if (!user) {
          throw new Error('User not found');
        }
        return user;
      } catch (error) {
        throw new Error(`Failed to fetch user: ${error.message}`);
      }
    },
  },

  // Get current user by token
  me: {
    type: UserType,
    args: {
      token: { type: GraphQLString },
    },
    async resolve(parent, args) {
      try {
        const decoded = jwt.verify(args.token, process.env.JWT_SECRET);
        // ✅ Using findById with the userId from token
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
          throw new Error('User not found');
        }
        return user;
      } catch (error) {
        throw new Error('Invalid or expired token');
      }
    },
  },

  // Get saved jobs for a user
  savedJobs: {
    type: new GraphQLList(JobType),
    args: {
      userId: { type: GraphQLNonNull(GraphQLID) },
    },
    async resolve(parent, args) {
      try {
        const user = await User.findById(args.userId);
        if (!user) {
          throw new Error('User not found');
        }

        // Fetch the actual job documents
        const { Job } = await import("../../models/Job.js");
        const jobs = await Job.find({
          _id: { $in: user.savedJobs },
          isActive: true
        });

        // Map each job _id to id
        return jobs.map(job => ({
          id: job._id,
          title: job.title,
          company: job.company,
          description: job.description,
          location: job.location,
          type: job.type,
          salary: job.salary,
          requirements: job.requirements,
          isActive: job.isActive,
          postedBy: job.postedBy,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        }));
      } catch (error) {
        throw new Error(`Failed to fetch saved jobs: ${error.message}`);
      }
    },
  },
};