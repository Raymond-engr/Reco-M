import { Request, Response } from 'express';
import User from '../models/user.model.js';
import { BadRequestError, NotFoundError } from '../utils/customErrors.js';
import asyncHandler from '../utils/asyncHandler.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

class UserController {
  getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user._id)
      .select('-password -refreshToken')
      .populate('watchlist', 'title posterPath releaseDate rating')
      .populate('searchHistory', 'query timestamp');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: user
    });
  });

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const allowedUpdates = ['name', 'email'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      throw new BadRequestError('Invalid updates');
    }

    if (req.body.email && req.body.email !== req.user.email) {
      
      const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
      throw new BadRequestError('Email is already in use');
    }
      
      req.body.isEmailVerified = false;
      const verificationToken = req.user.generateVerificationToken();
      await emailService.sendVerificationEmail(req.body.email, verificationToken);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: user,
      message: req.body.email ? 'Profile updated. Please verify your new email address.' : 'Profile updated successfully'
    });
  });
  
  getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Admin function to get all users 
  });
}

export const userController = new UserController();