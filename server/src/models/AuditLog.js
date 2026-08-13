import mongoose, { Schema } from "mongoose";

const AuditLogSchema = new Schema(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "USER_ROLE_CHANGED",
        "USER_ACTIVATED",
        "USER_DEACTIVATED",
        "JOB_ACTIVATED",
        "JOB_DEACTIVATED",
        "JOB_DELETED",
      ],
    },
    targetType: {
      type: String,
      required: true,
      enum: ["User", "Job"],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ targetType: 1 });

export const AuditLog = mongoose.model("AuditLog", AuditLogSchema);