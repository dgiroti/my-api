import { Schema, model } from 'mongoose';

export interface IAuditLog {
  type: string;
  email: string;
  userId?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  type: { type: String, required: true },
  email: { type: String, required: true },
  userId: { type: String },
  timestamp: { type: Date, required: true },
});

// Saved in a collection called "auditlogs"
export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);