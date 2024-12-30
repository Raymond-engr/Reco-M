import { Request, Response } from 'express';
import User from '../models/user.model.js';
import { BadRequestError, UnauthorizedError } from '../utils/customErrors.js';
import asyncHandler from '../utils/asyncHandler.js';

class UserController {
  
  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    // Get current user logic here
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    // Update profile logic here
  });
}

export const userController = new UserController();