import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config';

// // The shape of the data we put inside the token during login
// interface TokenPayload extends JwtPayload {
//   id: number;
// }

// The shape of the data we put inside the token during login
interface TokenPayload extends JwtPayload {
  id: string;
}

export const auth = (req: Request, res: Response, next: NextFunction): void => {
  
  const authHeader = req.headers.authorization;

  // Reject when the header is missing OR doesn't start with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return; // stop here so we never reach verify() without a token
  }

  // authHeader is now narrowed to `string`, so token is a `string` too
  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  let payload: TokenPayload;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // verify() returns a plain string if the token was signed with a string payload
    if (typeof decoded === 'string') {
      throw new Error('Unexpected token payload');
    }

    payload = decoded as TokenPayload;
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }

  // Outside the try, so errors from later middleware aren't reported as auth failures
  res.locals.userId = payload.id;
  next();
};