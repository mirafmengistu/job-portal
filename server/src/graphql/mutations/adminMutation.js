import { GraphQLID, GraphQLString, GraphQLNonNull, GraphQLBoolean } from "graphql";
import UserType from "../types/UserType.js";
import JobType from "../types/JobType.js";
import { User } from "../../models/User.js";
import { Job } from "../../models/Job.js";
import { createAuditLog } from "../../utils/auditLog.js";

export const adminMutation = {
  // ======================
  // Update User Role (only one admin allowed)
  // ======================
  adminUpdateUserRole: {
    type: UserType,
    args: {
      adminId: { type: new GraphQLNonNull(GraphQLID) },
      userId: { type: new GraphQLNonNull(GraphQLID) },
      role: { type: new GraphQLNonNull(GraphQLString) },
    },
    async resolve(_, args) {
      const admin = await User.findById(args.adminId);
      if (!admin || admin.role !== "admin" || !admin.isActive) {
        throw new Error("Unauthorized: Admin access only");
      }

      const allowedRoles = ["seeker", "recruiter", "admin"];
      if (!allowedRoles.includes(args.role)) {
        throw new Error("Invalid role");
      }

      const user = await User.findById(args.userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Prevent removing the only admin
      if (user.role === "admin" && args.role !== "admin") {
        throw new Error("Cannot remove the only admin. Transfer admin role first.");
      }

      // Enforce only one admin
      if (args.role === "admin" && user.role !== "admin") {
        // Demote current admin first
        await User.updateOne(
          { _id: admin._id },
          { $set: { role: "recruiter" } } // or "seeker" if you prefer
        );
      }

      const oldRole = user.role; // capture BEFORE changing
      user.role = args.role;
      await user.save();

      await createAuditLog({
        actorId: args.adminId,
        action: "USER_ROLE_CHANGED",
        targetType: "User",
        targetId: user._id,
        details: `Changed role of ${user.name} (${user.email}) from ${oldRole} to ${args.role}`,
        metadata: { oldRole, newRole: args.role, email: user.email },
      });

      return user;
    },
  },

  // ======================
  // Toggle User Active Status
  // When deactivating → also deactivate their jobs
  // ======================
  adminToggleUserActive: {
    type: UserType,
    args: {
      adminId: { type: new GraphQLNonNull(GraphQLID) },
      userId: { type: new GraphQLNonNull(GraphQLID) },
    },
    async resolve(_, args) {
      const admin = await User.findById(args.adminId);
      if (!admin || admin.role !== "admin" || !admin.isActive) {
        throw new Error("Unauthorized: Admin access only");
      }

      if (args.adminId === args.userId) {
        throw new Error("Admin cannot deactivate themselves");
      }

      const user = await User.findById(args.userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (user.role === "admin") {
        throw new Error("Cannot deactivate the admin account");
      }

      user.isActive = !user.isActive;
      await user.save();

      // If user is being deactivated → deactivate all their jobs
      if (!user.isActive) {
        await Job.updateMany(
          { postedBy: user._id },
          { $set: { isActive: false } }
        );
      }

      await createAuditLog({
        actorId: args.adminId,
        action: user.isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
        targetType: "User",
        targetId: user._id,
        details: `${user.isActive ? "Activated" : "Deactivated"} user ${user.name} (${user.email})`,
        metadata: { email: user.email, isActive: user.isActive },
      });

      return user;
    },
  },

  // ======================
  // Toggle Job Active Status
  // ======================
  adminToggleJobActive: {
    type: JobType,
    args: {
      adminId: { type: new GraphQLNonNull(GraphQLID) },
      jobId: { type: new GraphQLNonNull(GraphQLID) },
    },
    async resolve(_, args) {
      const admin = await User.findById(args.adminId);
      if (!admin || admin.role !== "admin" || !admin.isActive) {
        throw new Error("Unauthorized: Admin access only");
      }

      const job = await Job.findById(args.jobId);
      if (!job) {
        throw new Error("Job not found");
      }

      job.isActive = !job.isActive;
      await job.save();

      await createAuditLog({
        actorId: args.adminId,
        action: job.isActive ? "JOB_ACTIVATED" : "JOB_DEACTIVATED",
        targetType: "Job",
        targetId: job._id,
        details: `${job.isActive ? "Activated" : "Deactivated"} job "${job.title}" at ${job.company}`,
        metadata: { title: job.title, company: job.company, isActive: job.isActive },
      });

      return job;
    },
  },

  // ======================
  // Delete Job (Admin)
  // ======================
  adminDeleteJob: {
    type: JobType,
    args: {
      adminId: { type: new GraphQLNonNull(GraphQLID) },
      jobId: { type: new GraphQLNonNull(GraphQLID) },
    },
    async resolve(_, args) {
      const admin = await User.findById(args.adminId);
      if (!admin || admin.role !== "admin" || !admin.isActive) {
        throw new Error("Unauthorized: Admin access only");
      }

      const job = await Job.findById(args.jobId);
      if (!job) {
        throw new Error("Job not found");
      }

      await createAuditLog({
        actorId: args.adminId,
        action: "JOB_DELETED",
        targetType: "Job",
        targetId: job._id,
        details: `Deleted job "${job.title}" at ${job.company}`,
        metadata: { title: job.title, company: job.company },
      });

      await job.deleteOne();
      return job;
    },
  },
};