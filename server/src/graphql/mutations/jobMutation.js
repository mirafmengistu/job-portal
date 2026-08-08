import { GraphQLNonNull, GraphQLString, GraphQLList, GraphQLBoolean, GraphQLID, GraphQLInputObjectType } from "graphql";
import JobType from "../types/JobType.js";
import { Job } from "../../models/Job.js";

// Input type for salary
const SalaryInputType = new GraphQLInputObjectType({
  name: "SalaryInput",
  fields: {
    min: { type: GraphQLString },
    max: { type: GraphQLString },
  },
});

export const jobMutation = {
  // Create a new job (only recruiter)
  createJob: {
    type: JobType,
    args: {
      title: { type: GraphQLNonNull(GraphQLString) },
      company: { type: GraphQLNonNull(GraphQLString) },
      description: { type: GraphQLNonNull(GraphQLString) },
      location: { type: GraphQLNonNull(GraphQLString) },
      type: { type: GraphQLNonNull(GraphQLString) },
      salary: { type: SalaryInputType },
      requirements: { type: new GraphQLList(GraphQLString) },
      postedBy: { type: GraphQLNonNull(GraphQLID) },
    },
    async resolve(parent, args) {
      try {
        const job = new Job({
          title: args.title,
          company: args.company,
          description: args.description,
          location: args.location,
          type: args.type,
          salary: args.salary,
          requirements: args.requirements || [],
          postedBy: args.postedBy,
        });

        await job.save();
        return job;
      } catch (error) {
        throw new Error(`Failed to create job: ${error.message}`);
      }
    },
  },

  // Update a job (only recruiter who posted it)
  updateJob: {
    type: JobType,
    args: {
      id: { type: GraphQLNonNull(GraphQLID) },
      title: { type: GraphQLString },
      company: { type: GraphQLString },
      description: { type: GraphQLString },
      location: { type: GraphQLString },
      type: { type: GraphQLString },
      salary: { type: SalaryInputType },
      requirements: { type: new GraphQLList(GraphQLString) },
      isActive: { type: GraphQLBoolean },
    },
    async resolve(parent, args) {
      try {
        const job = await Job.findByIdAndUpdate(
          args.id,
          { $set: args },
          { new: true, runValidators: true }
        );
        if (!job) {
          throw new Error('Job not found');
        }
        return job;
      } catch (error) {
        throw new Error(`Failed to update job: ${error.message}`);
      }
    },
  },

  // Delete a job (only recruiter who posted it)
  deleteJob: {
    type: JobType,
    args: {
      id: { type: GraphQLNonNull(GraphQLID) },
    },
    async resolve(parent, args) {
      try {
        const job = await Job.findByIdAndDelete(args.id);
        if (!job) {
          throw new Error('Job not found');
        }
        return job;
      } catch (error) {
        throw new Error(`Failed to delete job: ${error.message}`);
      }
    },
  },
};