import { Request, Response } from 'express';
import { SearchHistoryManager } from '../helpers/searchHistoryManager.js';
import { ServerError, SuccessResponse } from '../../utils/ResponseHelpers.js';
import logger from '../../utils/logger.js';

const searchHistoryManager = new SearchHistoryManager();

export const saveSearchHistory = async (req: Request, res: Response) => {
  try {
    const { userId, query, movie } = req.body;

    await searchHistoryManager.saveSearchHistory(userId, query, movie, 'selected');
    SuccessResponse(res, 'Search history saved successfully');
  } catch (error) {
    logger.error('Save search history error:', error);
    ServerError(res, 'Failed to save search history');
  }
};

export const getSearchHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const searchHistory = await searchHistoryManager.getUserSearchHistory(userId, limit);
    SuccessResponse(res, 'Retrieved search history successfully', 200, searchHistory);
  } catch (error) {
    logger.error('Retrieve search history error:', error);
    ServerError(res, 'Failed to retrieve search history');
  }
};

export const clearSearchHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    await searchHistoryManager.clearUserSearchHistory(userId);
    SuccessResponse(res, 'Search history cleared successfully');
  } catch (error) {
    logger.error('Clear search history error:', error);
    ServerError(res, 'Failed to clear search history');
  }
};