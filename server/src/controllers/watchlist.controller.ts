import { Request, Response } from 'express';
import User from '../models/user.model.js';
import { BadRequestError, NotFoundError } from '../utils/customErrors.js';
import asyncHandler from '../utils/asyncHandler.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

class WatchlistController {
  addToWatchlist = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { movieId } = req.body;

    if (!movieId) {
      throw new BadRequestError('Movie ID is required');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.watchlist.includes(movieId)) {
      throw new BadRequestError('Movie already in watchlist');
    }

    user.watchlist.push(movieId);
    await user.save();

    res.json({
      success: true,
      message: 'Movie added to watchlist'
    });
  });

  removeFromWatchlist = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { movieId } = req.params;
    
    const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { watchlist: movieId } },
    { new: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const wasMovieRemoved = !user.watchlist.includes(movieId);
  if (!wasMovieRemoved) {
    throw new BadRequestError('Movie not removed from watchlist');
  }
    
    res.json({
      success: true,
      message: 'Movie removed from watchlist'
    });
  });

  getWatchlist = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user._id)
      .populate('watchlist', 'title posterPath releaseDate rating');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: user.watchlist
    });
  });
}

export const watchlistController = new WatchlistController();