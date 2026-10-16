"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config/config");
const db_1 = require("./config/db");
const producer_1 = require("./kafka/producer");
// import authRoutes from './routes/authRoutes';
// const app = express();
// // Log every request (must come before routes)
// app.use((req, _res, next) => {
//   console.log(`--> ${req.method} ${req.url}`);
//   next();
// });
// // Parse JSON bodies (note the parentheses)
// app.use(express.json());
// // Every route in authRoutes starts with /api/auth
// app.use('/api/auth', authRoutes);
// // Health check
// app.get('/', (req, res) => {
//   res.send('API is running');
// });
// NEW: connect to MongoDB first, and only then start the server
// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`app Server running on http://localhost:${PORT}`);
//   })
// }).catch((error) => {
//   console.error('Failed to connect to MongoDB:', error);
//     process.exit(1); // fine on a laptop: no database means no app
// })
// Start things in order: database → Kafka → web server
const start = async () => {
    await (0, db_1.connectDB)();
    await (0, producer_1.connectProducer)(); // NEW (does nothing if KAFKA_BROKERS isn't set)
    app_1.default.listen(config_1.PORT, () => {
        console.log(`app Server running on http://localhost:${config_1.PORT}`);
    });
};
start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
// // Start the server last
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
