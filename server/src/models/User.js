import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['seeker', 'recruiter'],
    default: 'seeker',
  },
  savedJobs: [{
    type: Schema.Types.ObjectId,
    ref: 'Job',
  }],
}, {
  timestamps: true,
});

export const User = mongoose.model("User", UserSchema);