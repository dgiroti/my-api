"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const connectDB = async () => {
    try {
        // readyState 1 means "already connected".
        // Lambda keeps your function "warm" and reuses it for many requests,
        // so we connect once and reuse that connection.
        if (mongoose_1.default.connection.readyState === 1) {
            return;
        }
        // "await" means: wait here until the connection is finished
        await mongoose_1.default.connect(config_1.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // give up after 5 seconds instead of 30
            family: 4
        });
        console.log('MongoDB connected');
    }
    catch (error) {
        // If MongoDB isn't running or the address is wrong, we end up here
        console.error('MongoDB connection failed:', error);
        if (error?.reason?.servers) {
            for (const [host, desc] of error?.reason?.servers) {
                console.error(host, '→', desc.error?.message);
            }
        }
        process.exit(1);
        // Stop the app, because it can't work without a database
    }
};
exports.connectDB = connectDB;
