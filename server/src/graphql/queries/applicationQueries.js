import { GraphQLID, GraphQLList, GraphQLInt } from "graphql";
import ApplicationType from "../types/ApplicationType.js";
import ApplicationConnectionType from "../types/pagination/ApplicationConnectionType.js";
import { Application } from "../../models/Application.js";

export const applicationQueries = {
  // Get all applications for a specific job (recruiter) + pagination
  applicationsByJob: {
    type: ApplicationConnectionType,
    args: {
      jobId: { type: GraphQLID },
      page: { type: GraphQLInt, defaultValue: 1 },
      limit: { type: GraphQLInt, defaultValue: 10 },
    },
    async resolve(parent, args) {
      try {
        const page = Math.max(1, args.page || 1);
        const limit = Math.min(50, Math.max(1, args.limit || 10));
        const skip = (page - 1) * limit;

        const filter = { job: args.jobId };

        const [applications, totalCount] = await Promise.all([
          Application.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
          Application.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalCount / limit) || 1;

        return {
          applications,
          pageInfo: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      } catch (error) {
        throw new Error(`Failed to fetch applications: ${error.message}`);
      }
    },
  },

  // Get all applications by a specific applicant (seeker) + pagination
  applicationsByApplicant: {
    type: ApplicationConnectionType,
    args: {
      applicantId: { type: GraphQLID },
      page: { type: GraphQLInt, defaultValue: 1 },
      limit: { type: GraphQLInt, defaultValue: 10 },
    },
    async resolve(parent, args) {
      try {
        const page = Math.max(1, args.page || 1);
        const limit = Math.min(50, Math.max(1, args.limit || 10));
        const skip = (page - 1) * limit;

        const filter = { applicant: args.applicantId };

        const [applications, totalCount] = await Promise.all([
          Application.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
          Application.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalCount / limit) || 1;

        return {
          applications,
          pageInfo: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      } catch (error) {
        throw new Error(`Failed to fetch applications: ${error.message}`);
      }
    },
  },

  // Get single application by ID
  application: {
    type: ApplicationType,
    args: {
      id: { type: GraphQLID },
    },
    async resolve(parent, args) {
      try {
        const application = await Application.findById(args.id);
        if (!application) {
          throw new Error("Application not found");
        }
        return application;
      } catch (error) {
        throw new Error(`Failed to fetch application: ${error.message}`);
      }
    },
  },

  // Check if user already applied to a specific job
  checkApplicationStatus: {
    type: new GraphQLList(ApplicationType),
    args: {
      jobId: { type: GraphQLID },
      applicantId: { type: GraphQLID },
    },
    async resolve(parent, args) {
      try {
        const applications = await Application.find({
          job: args.jobId,
          applicant: args.applicantId,
        });
        return applications;
      } catch (error) {
        throw new Error(`Failed to check application status: ${error.message}`);
      }
    },
  },
};