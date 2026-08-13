import {
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
} from "graphql";
import UserType from "../types/UserType.js";
import JobType from "../types/JobType.js";
import { User } from "../../models/User.js";
import { Job } from "../../models/Job.js";
import { Application } from "../../models/Application.js";
import PageInfoType from "../types/pagination/PageInfoType.js";
import { AuditLog } from "../../models/AuditLog.js";
import { AuditLogConnectionType } from "../types/AuditLogType.js";

// Connection types for admin
const AdminUserConnectionType = new GraphQLObjectType({
  name: "AdminUserConnection",
  fields: {
    users: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))) },
    pageInfo: { type: new GraphQLNonNull(PageInfoType) },
  },
});

const AdminJobConnectionType = new GraphQLObjectType({
  name: "AdminJobConnection",
  fields: {
    jobs: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(JobType))) },
    pageInfo: { type: new GraphQLNonNull(PageInfoType) },
  },
});

const AdminStatsType = new GraphQLObjectType({
  name: "AdminStats",
  fields: {
    totalUsers: { type: GraphQLInt },
    totalSeekers: { type: GraphQLInt },
    totalRecruiters: { type: GraphQLInt },
    totalAdmins: { type: GraphQLInt },
    activeUsers: { type: GraphQLInt },
    inactiveUsers: { type: GraphQLInt },
    totalJobs: { type: GraphQLInt },
    activeJobs: { type: GraphQLInt },
    inactiveJobs: { type: GraphQLInt },
    totalApplications: { type: GraphQLInt },
  },
});

export const adminQueries = {
  // ======================
  // Admin Stats
  // ======================
  adminStats: {
    type: AdminStatsType,
    args: {
      adminId: { type: new GraphQLNonNull(GraphQLID) },
    },
    async resolve(_, args) {
      const admin = await User.findById(args.adminId);
      if (!admin || admin.role !== "admin" || !admin.isActive) {
        throw new Error("Unauthorized: Admin access only");
      }

      const [
        totalUsers,
        totalSeekers,
        totalRecruiters,
        totalAdmins,
        activeUsers,
        inactiveUsers,
        totalJobs,
        activeJobs,
        inactiveJobs,
        totalApplications,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "seeker" }),
        User.countDocuments({ role: "recruiter" }),
        User.countDocuments({ role: "admin" }),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: false }),
        Job.countDocuments(),
        Job.countDocuments({ isActive: true }),
        Job.countDocuments({ isActive: false }),
        Application.countDocuments(),
      ]);

      return {
        totalUsers,
        totalSeekers,
        totalRecruiters,
        totalAdmins,
        activeUsers,
        inactiveUsers,
        totalJobs,
        activeJobs,
        inactiveJobs,
        totalApplications,
      };
    },
  },

  // ======================
  // List Users (Admin)
  // ======================
  adminUsers: {
    type: AdminUserConnectionType,
    args: {
      adminId: { type: new GraphQLNonNull(GraphQLID) },
      page: { type: GraphQLInt, defaultValue: 1 },
      limit: { type: GraphQLInt, defaultValue: 10 },
      search: { type: GraphQLString },
      role: { type: GraphQLString },
      isActive: { type: GraphQLBoolean },
    },
    async resolve(_, args) {
      const admin = await User.findById(args.adminId);
      if (!admin || admin.role !== "admin" || !admin.isActive) {
        throw new Error("Unauthorized: Admin access only");
      }

      const page = Math.max(1, args.page || 1);
      const limit = Math.min(50, Math.max(1, args.limit || 10));
      const skip = (page - 1) * limit;

      const filter = {};

      if (args.search) {
        filter.$or = [
          { name: { $regex: args.search, $options: "i" } },
          { email: { $regex: args.search, $options: "i" } },
        ];
      }

      if (args.role) {
        filter.role = args.role;
      }

      if (typeof args.isActive === "boolean") {
        filter.isActive = args.isActive;
      }

      const [users, totalCount] = await Promise.all([
        User.find(filter)
          .select("-password")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(totalCount / limit) || 1;

      return {
        users,
        pageInfo: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    },
  },

  // ======================
  // List Jobs (Admin)
  // ======================
  adminJobs: {
    type: AdminJobConnectionType,
    args: {
      adminId: { type: new GraphQLNonNull(GraphQLID) },
      page: { type: GraphQLInt, defaultValue: 1 },
      limit: { type: GraphQLInt, defaultValue: 10 },
      search: { type: GraphQLString },
      isActive: { type: GraphQLBoolean },
    },
    async resolve(_, args) {
      const admin = await User.findById(args.adminId);
      if (!admin || admin.role !== "admin" || !admin.isActive) {
        throw new Error("Unauthorized: Admin access only");
      }

      const page = Math.max(1, args.page || 1);
      const limit = Math.min(50, Math.max(1, args.limit || 10));
      const skip = (page - 1) * limit;

      const filter = {};

      if (args.search) {
        filter.$or = [
          { title: { $regex: args.search, $options: "i" } },
          { company: { $regex: args.search, $options: "i" } },
        ];
      }

      if (typeof args.isActive === "boolean") {
        filter.isActive = args.isActive;
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
    },
  },

    // ======================
  // Audit Logs
  // ======================
  adminAuditLogs: {
    type: AuditLogConnectionType,
    args: {
      adminId: { type: new GraphQLNonNull(GraphQLID) },
      page: { type: GraphQLInt, defaultValue: 1 },
      limit: { type: GraphQLInt, defaultValue: 20 },
      action: { type: GraphQLString },
      targetType: { type: GraphQLString },
    },
    async resolve(_, args) {
      const admin = await User.findById(args.adminId);
      if (!admin || admin.role !== "admin" || !admin.isActive) {
        throw new Error("Unauthorized: Admin access only");
      }

      const page = Math.max(1, args.page || 1);
      const limit = Math.min(50, Math.max(1, args.limit || 20));
      const skip = (page - 1) * limit;

      const filter = {};
      if (args.action) filter.action = args.action;
      if (args.targetType) filter.targetType = args.targetType;

      const [logs, totalCount] = await Promise.all([
        AuditLog.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        AuditLog.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(totalCount / limit) || 1;

      return {
        logs,
        pageInfo: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    },
  },
};