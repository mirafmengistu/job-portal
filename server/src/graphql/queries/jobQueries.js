import { GraphQLID, GraphQLList, GraphQLString, GraphQLObjectType } from "graphql";
import JobType from "../types/JobType.js";
import { Job } from "../../models/Job.js";
import { User } from "../../models/User.js"; // ✅ Add this import
import { Application } from "../../models/Application.js"; // ✅ Add this import

export const jobQueries = {
  // Get all jobs (with optional filters)
  jobs: {
    type: new GraphQLList(JobType),
    args: {
      search: { type: GraphQLString },
      location: { type: GraphQLString },
      type: { type: GraphQLString },
    },
    async resolve(parent, args) {
      try {
        let filter = { isActive: true };

        if (args.search) {
          filter.$or = [
            { title: { $regex: args.search, $options: 'i' } },
            { company: { $regex: args.search, $options: 'i' } },
            { description: { $regex: args.search, $options: 'i' } },
          ];
        }

        if (args.location) {
          filter.location = { $regex: args.location, $options: 'i' };
        }

        if (args.type) {
          filter.type = args.type;
        }

        const jobs = await Job.find(filter).sort({ createdAt: -1 });
        return jobs;
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
          throw new Error('Job not found');
        }
        return job;
      } catch (error) {
        throw new Error(`Failed to fetch job: ${error.message}`);
      }
    },
  },

  // Get jobs posted by a specific recruiter
  jobsByRecruiter: {
    type: new GraphQLList(JobType),
    args: {
      recruiterId: { type: GraphQLID },
    },
    async resolve(parent, args) {
      try {
        const jobs = await Job.find({
          postedBy: args.recruiterId,
          isActive: true
        }).sort({ createdAt: -1 });
        return jobs;
      } catch (error) {
        throw new Error(`Failed to fetch recruiter's jobs: ${error.message}`);
      }
    },
  },

  // ✅ FIXED: Jobs Stats Query
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

        // Get unique companies from jobs
        const companies = await Job.distinct('company');
        const totalCompanies = companies.length;

        console.log('📊 Stats:', {
          totalJobs,
          totalCompanies,
          totalUsers,
          totalApplications,
        });

        return {
          totalJobs: totalJobs.toString(),
          totalCompanies: totalCompanies.toString(),
          totalUsers: totalUsers.toString(),
          totalApplications: totalApplications.toString(),
        };
      } catch (error) {
        console.error('❌ Stats error:', error);
        throw new Error(`Failed to fetch stats: ${error.message}`);
      }
    },
  },
};