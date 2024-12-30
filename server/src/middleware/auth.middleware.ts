import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/customErrors.js';
import { tokenService } from '../services/token.service.js';
import User from '../models/user.model.js';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const payload = tokenService.verifyAccessToken(token);
    const user = await User.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError('Not authorized to access this route');
    }
    next();
  };
};

// Rate limiting middleware for API endpoints
export const rateLimiter = (limit: number, windowMs: number) => {
  const requests = new Map();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const now = Date.now();
    
    // Clean old requests
    if (requests.has(ip)) {
      const userRequests = requests.get(ip);
      const validRequests = userRequests.filter((timestamp: number) => 
        now - timestamp < windowMs
      );
      
      if (validRequests.length >= limit) {
        throw new UnauthorizedError('Rate limit exceeded');
      }
      
      requests.set(ip, [...validRequests, now]);
    } else {
      requests.set(ip, [now]);
    }
    
    next();
  };
};