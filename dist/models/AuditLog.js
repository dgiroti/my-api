"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = void 0;
const mongoose_1 = require("mongoose");
const auditLogSchema = new mongoose_1.Schema({
    type: { type: String, required: true },
    email: { type: String, required: true },
    userId: { type: String },
    timestamp: { type: Date, required: true },
});
// Saved in a collection called "auditlogs"
exports.AuditLog = (0, mongoose_1.model)('AuditLog', auditLogSchema);
