import { GraphQLID, GraphQLList } from "graphql";
import ApplicationType from "../types/ApplicationType.js";
import { Application } from "../../models/Application.js";

export const applicationQueries = {
  // Get all applications for a specific job (recruiter)
  applicationsByJob: {
    type: new GraphQLList(ApplicationType),
    args: {
      jobId: { type: GraphQLID },
    },
    async resolve(parent, args) {
      try {
        const applications = await Application.find({ job: args.jobId })
          .sort({ createdAt: -1 });
        return applications;
      } catch (error) {
        throw new Error(`Failed to fetch applications: ${error.message}`);
      }
    },
  },

  // Get all applications by a specific applicant (seeker)
  applicationsByApplicant: {
    type: new GraphQLList(ApplicationType),
    args: {
      applicantId: { type: GraphQLID },
    },
    async resolve(parent, args) {
      try {
        const applications = await Application.find({ applicant: args.applicantId })
          .sort({ createdAt: -1 });
        return applications;
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
          throw new Error('Application not found');
        }
        return application;
      } catch (error) {
        throw new Error(`Failed to fetch application: ${error.message}`);
      }
    },
  },
};