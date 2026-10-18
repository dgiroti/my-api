import express from 'express';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import cors from 'cors';
import { ALLOWED_ORIGINS } from './config/config';
import { notFound, errorHandler } from './middleware/errorHandler';

// Create the app and plug in everything. No "listen" here!
const app = express();

// We sit behind one proxy (AWS, GitHub Codespaces, Kubernetes port-forward).
// This tells Express to trust it for the real client IP, which rate limiting needs.
app.set('trust proxy', 1);

// Security headers on every response
app.use(helmet());
// Only these websites may call the API from a browser (empty list = none)
app.use(cors({ origin: ALLOWED_ORIGINS }));


// Read JSON bodies, but refuse anything over 10 KB
app.use(express.json({ limit: '10kb' }));

app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

// These two must come LAST: they catch whatever the routes above didn't handle
app.use(notFound);
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('API is running - deployed by CI/CD');
});

export default app;

