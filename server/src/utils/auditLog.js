import { AuditLog } from "../models/AuditLog.js";

/**
 * Create an audit log entry
 * @param {Object} params
 * @param {string} params.actorId - Admin user ID
 * @param {string} params.action - Action type
 * @param {string} params.targetType - "User" | "Job"
 * @param {string} params.targetId - Target document ID
 * @param {string} params.details - Human readable message
 * @param {Object} [params.metadata] - Extra data
 */
export async function createAuditLog({
  actorId,
  action,
  targetType,
  targetId,
  details,
  metadata = {},
}) {
  try {
    await AuditLog.create({
      actor: actorId,
      action,
      targetType,
      targetId,
      details,
      metadata,
    });
  } catch (error) {
    // Don't break the main action if logging fails
    console.error("Failed to create audit log:", error.message);
  }
}