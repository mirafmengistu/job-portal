import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
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
      required: false, // optional for Google users
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows multiple nulls
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    role: {
      type: String,
      enum: ["seeker", "recruiter", "admin"],
      default: "seeker",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    savedJobs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", UserSchema);