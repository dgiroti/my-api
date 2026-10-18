"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config/config");
const errorHandler_1 = require("./middleware/errorHandler");
// Create the app and plug in everything. No "listen" here!
const app = (0, express_1.default)();
// We sit behind one proxy (AWS, GitHub Codespaces, Kubernetes port-forward).
// This tells Express to trust it for the real client IP, which rate limiting needs.
app.set('trust proxy', 1);
// Security headers on every response
app.use((0, helmet_1.default)());
// Only these websites may call the API from a browser (empty list = none)
app.use((0, cors_1.default)({ origin: config_1.ALLOWED_ORIGINS }));
// Read JSON bodies, but refuse anything over 10 KB
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.json());
app.use('/api/auth', authRoutes_1.default);
app.get('/', (req, res) => {
    res.send('API is running');
});
// These two must come LAST: they catch whatever the routes above didn't handle
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
app.get('/', (req, res) => {
    res.send('API is running - deployed by CI/CD');
});
exports.default = app;
