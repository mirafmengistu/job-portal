import { GraphQLID, GraphQLList, GraphQLString, GraphQLObjectType, GraphQLInt } from "graphql";
import JobType from "../types/JobType.js";
import JobConnectionType from "../types/pagination/JobConnectionType.js";
import { Job } from "../../models/Job.js";
import { User } from "../../models/User.js";
import { Application } from "../../models/Application.js";

export const jobQueries = {
  // Get all jobs (with optional filters + pagination)
  jobs: {
    type: JobConnectionType,
    args: {
      search: { type: GraphQLString },
      location: { type: GraphQLString },
      type: { type: GraphQLString },
      page: { type: GraphQLInt, defaultValue: 1 },
      limit: { type: GraphQLInt, defaultValue: 10 },
    },
    async resolve(parent, args) {
      try {
        const page = Math.max(1, args.page || 1);
        const limit = Math.min(50, Math.max(1, args.limit || 10)); // max 50 per page
        const skip = (page - 1) * limit;

        let filter = { isActive: true };

        if (args.search) {
          filter.$or = [
            { title: { $regex: args.search, $options: "i" } },
            { company: { $regex: args.search, $options: "i" } },
            { description: { $regex: args.search, $options: "i" } },
          ];
        }

        if (args.location) {
          filter.location = { $regex: args.location, $options: "i" };
        }

        if (args.type) {
          filter.type = args.type;
        }

        const [jobs, totalCount] = await Promise.all([
          Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
          Job.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalCount / limit) || 1;

        return {
          jobs,
          pageInfo: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      } catch (error) {
        throw new Error(`Failed to fetch jobs: ${error.message}`);
      }
    },
  },

  // Get single job by ID
  job: {
    type: JobType,
    args: {
      id: { type: GraphQLID },
    },
    async resolve(parent, args) {
      try {
        const job = await Job.findById(args.id);
        if (!job) {
          throw new Error("Job not found");
        }
        return job;
      } catch (error) {
        throw new Error(`Failed to fetch job: ${error.message}`);
      }
    },
  },

  // Get jobs posted by a specific recruiter (with pagination)
  jobsByRecruiter: {
    type: JobConnectionType,
    args: {
      recruiterId: { type: GraphQLID },
      page: { type: GraphQLInt, defaultValue: 1 },
      limit: { type: GraphQLInt, defaultValue: 10 },
    },
    async resolve(parent, args) {
      try {
        const page = Math.max(1, args.page || 1);
        const limit = Math.min(50, Math.max(1, args.limit || 10));
        const skip = (page - 1) * limit;

        const filter = {
          postedBy: args.recruiterId,
          isActive: true,
        };

        const [jobs, totalCount] = await Promise.all([
          Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
          Job.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalCount / limit) || 1;

        return {
          jobs,
          pageInfo: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      } catch (error) {
        throw new Error(`Failed to fetch recruiter's jobs: ${error.message}`);
      }
    },
  },

  // Jobs Stats Query
  jobsStats: {
    type: new GraphQLObjectType({
      name: "JobsStats",
      fields: {
        totalJobs: { type: GraphQLString },
        totalCompanies: { type: GraphQLString },
        totalUsers: { type: GraphQLString },
        totalApplications: { type: GraphQLString },
      },
    }),
    async resolve() {
      try {
        const [totalJobs, totalUsers, totalApplications] = await Promise.all([
          Job.countDocuments({ isActive: true }),
          User.countDocuments(),
          Application.countDocuments(),
        ]);

        const companies = await Job.distinct("company");
        const totalCompanies = companies.length;

        return {
          totalJobs: totalJobs.toString(),
          totalCompanies: totalCompanies.toString(),
          totalUsers: totalUsers.toString(),
          totalApplications: totalApplications.toString(),
        };
      } catch (error) {
        throw new Error(`Failed to fetch stats: ${error.message}`);
      }
    },
  },
};