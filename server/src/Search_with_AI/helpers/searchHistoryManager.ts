import SearchHistoryModel from '../models/search-history.model.js';
import { BadRequestError } from '../../utils/customErrors.js';
import { IMovies } from '../../types/types.js';
import logger from '../../utils/logger.js';

export class SearchHistoryManager {
  async saveSearchHistory(
    userId: string,
    query: string,
    movie: IMovies,
    searchType: 'single' | 'selected'
  ): Promise<void> {
    try {
      if (!userId || !query || !movie) {
        throw new BadRequestError('Incomplete search history data');
      }

      const searchHistoryEntry = new SearchHistoryModel({
        userId,
        query,
        movie,
        searchType,
        timestamp: new Date(),
      });

      await searchHistoryEntry.save();
    } catch (error) {
      logger.error('Error saving search history:', error);
      throw new Error('Failed to save to search history');
    }
  }

  async getUserSearchHistory(userId: string, limit: number = 10) {
    try {
      return await SearchHistoryModel.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit);
    } catch (error) {
      logger.error('Error retrieving search history:', error);
      return [];
    }
  }

  async clearUserSearchHistory(userId: string): Promise<void> {
    try {
      await SearchHistoryModel.deleteMany({ userId });
    } catch (error) {
      logger.error('Error clearing search history:', error);
    }
  }
}