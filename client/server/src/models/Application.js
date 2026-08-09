import mongoose, { Schema } from "mongoose";

const ApplicationSchema = new Schema({
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  applicant: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coverLetter: {
    type: String,
    trim: true,
  },
  resume: {
    type: String, // URL or path to resume file
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Ensure one user can't apply twice to same job
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export const Application = mongoose.model("Application", ApplicationSchema);