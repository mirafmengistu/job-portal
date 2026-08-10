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

  // Update application status (recruiter) + create notification
  updateApplicationStatus: {
    type: ApplicationType,
    args: {
      id: { type: GraphQLNonNull(GraphQLID) },
      status: { type: GraphQLNonNull(GraphQLString) },
    },
    async resolve(parent, args) {
      try {
        const application = await Application.findById(args.id)
          .populate("job")
          .populate("applicant");

        if (!application) {
          throw new Error("Application not found");
        }

        const previousStatus = application.status;
        application.status = args.status;
        await application.save();

        // Only notify on meaningful status changes
        const notifiableStatuses = ["shortlisted", "rejected", "hired"];

        if (
          previousStatus !== args.status &&
          notifiableStatuses.includes(args.status)
        ) {
          const { Notification } = await import("../../models/Notification.js");

          let title = "";
          let message = "";

          const jobTitle = application.job?.title || "the position";
          const company = application.job?.company || "the company";

          if (args.status === "hired") {
            title = "Congratulations! You've been hired 🎉";
            message = `We are pleased to inform you that you have been accepted for the position of "${jobTitle}" at ${company}. Welcome aboard!`;
          } else if (args.status === "rejected") {
            title = "Application Update";
            message = `Thank you for applying to the position of "${jobTitle}" at ${company}. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.`;
          } else if (args.status === "shortlisted") {
            title = "You've been shortlisted!";
            message = `Your application for "${jobTitle}" at ${company} has been reviewed and you have been shortlisted. We will contact you soon regarding the next steps.`;
          }

          await Notification.create({
            recipient: application.applicant._id || application.applicant,
            type: "application_status",
            title,
            message,
            relatedApplication: application._id,
          });
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