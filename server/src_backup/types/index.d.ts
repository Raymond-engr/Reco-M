import type { ValidatedRequest } from '../types/types.ts';

declare global {
  namespace Express {
    interface Request {
      validatedData?: ValidatedRequest | null;
    }
  }
}

export {};
