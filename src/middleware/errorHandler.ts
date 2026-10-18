import { Request, Response, NextFunction } from 'express';

// Runs when no route matched the URL
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({ message: 'Route not found' });
};

// Express recognizes an error handler by its FOUR parameters.
// Every error thrown anywhere in our routes ends up here.
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Errors from express.json(): broken JSON (400) or a body that's too large (413)
  const status = (err as { status?: number }).status;
  if (status && status >= 400 && status < 500) {
    res.status(status).json({
      message: status === 413 ? 'Request body is too large' : 'Invalid request body',
    });
    return;
  }

  // MongoDB error 11000 = "duplicate key": two people registered the same email at the same moment
  if ((err as { code?: number }).code === 11000) {
    res.status(409).json({ message: 'Email is already registered' });
    return;
  }

  // Anything else is unexpected: log the details for us, show a safe message to the client
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
};