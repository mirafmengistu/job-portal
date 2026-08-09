import { GraphQLNonNull, GraphQLString, GraphQLID } from "graphql";
import ApplicationType from "../types/ApplicationType.js";
import { Application } from "../../models/Application.js";
import { Job } from "../../models/Job.js";

export const applicationMutation = {
  // In applicationMutation.js

  applyToJob: {
    type: ApplicationType,
    args: {
      jobId: { type: GraphQLNonNull(GraphQLID) },
      applicantId: { type: GraphQLNonNull(GraphQLID) },
      coverLetter: { type: GraphQLString },
      resume: { type: GraphQLNonNull(GraphQLString) }, // Now stores Cloudinary URL
    },
    async resolve(parent, args) {
      try {
        // Check if job exists and is active
        const job = await Job.findById(args.jobId);
        if (!job) {
          throw new Error('Job not found');
        }
        if (!job.isActive) {
          throw new Error('This job is no longer accepting applications');
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
          job: args.jobId,
          applicant: args.applicantId,
        });

        if (existingApplication) {
          throw new Error('You have already applied to this job');
        }

        // Create application with Cloudinary URL
        const application = new Application({
          job: args.jobId,
          applicant: args.applicantId,
          coverLetter: args.coverLetter || '',
          resume: args.resume, // Cloudinary URL from frontend
          status: 'pending',
        });

        await application.save();
        return application;
      } catch (error) {
        throw new Error(`Failed to apply: ${error.message}`);
      }
    },
  },

  // Update application status (recruiter)
  updateApplicationStatus: {
    type: ApplicationType,
    args: {
      id: { type: GraphQLNonNull(GraphQLID) },
      status: { type: GraphQLNonNull(GraphQLString) },
    },
    async resolve(parent, args) {
      try {
        const application = await Application.findByIdAndUpdate(
          args.id,
          { status: args.status },
          { new: true, runValidators: true }
        );
        if (!application) {
          throw new Error('Application not found');
        }
        return application;
      } catch (error) {
        throw new Error(`Failed to update application: ${error.message}`);
      }
    },
  },

  // Withdraw application (seeker)
  withdrawApplication: {
    type: ApplicationType,
    args: {
      id: { type: GraphQLNonNull(GraphQLID) },
    },
    async resolve(parent, args) {
      try {
        const application = await Application.findByIdAndDelete(args.id);
        if (!application) {
          throw new Error('Application not found');
        }
        return application;
      } catch (error) {
        throw new Error(`Failed to withdraw application: ${error.message}`);
      }
    },
  },
};