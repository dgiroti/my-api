"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const serverless_http_1 = __importDefault(require("serverless-http"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const serverlessApp = (0, serverless_http_1.default)(app_1.default);
const handler = async (event, context) => {
    try {
        await (0, db_1.connectDB)();
    }
    catch (error) {
        console.error('Database connection failed:', error);
        // Reply with a clean error instead of crashing
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Database connection failed' }),
        };
    }
    // Hand the request to Express, exactly like a normal server would
    return serverlessApp(event, context);
};
exports.handler = handler;
