import type { Request, Response } from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import type { ValidatedRequest } from '../../middleware/validateRequest.js';
import IntelligentMovieQueryHandler from '../helpers/ai-query-processor.js';
import { SearchHistoryManager } from '../helpers/searchHistoryManager.js';
import { BadRequestError, GeminiAPIError, RateLimitError, ExternalServiceAPIError } from '../../utils/customErrors.js';
import logger from '../../utils/logger.js';

const movieQueryHandler = new IntelligentMovieQueryHandler();
const searchHistoryManager = new SearchHistoryManager();

export const getAiMovie = asyncHandler(async (req: Request, res: Response) => {
  const { q: query } = (req as Request & { validatedQuery: ValidatedRequest }).validatedQuery;
  const userId = req.user._id;

  if (!query) {
    throw new BadRequestError('Query is required');
  }

  try {
    logger.info(`Processing AI movie search for query: "${query}"`);

    const response = await movieQueryHandler.processQuery(query);

    if (response.type === 'single' && response.results.length > 0 && userId) {
      logger.info(`Saving search history for user ${userId}`);
      await searchHistoryManager.saveSearchHistory(
        userId,
        query,
        response.results[0],
        'single'
      );
    }

    res.status(200).json({
      success: true,
      type: response.type,
      results: response.results,
      explanation: response.explanation || `Search results for: ${query}`,
    });
  } catch (error: any) {
    handleAiSearchError(error);
  }
});

const handleAiSearchError = (error: any): never => {
  logger.error(`AI Search error: ${error.message}`, { error });

  if (error instanceof GeminiAPIError) {
    if (error.statusCode === 429) {
      throw new RateLimitError('Gemini API rate limit exceeded', error.details?.retryAfter);
    } else {
      throw new GeminiAPIError('Error processing Gemini API request', error.statusCode, error.details);
    }
  }

  if (error instanceof ExternalServiceAPIError) {
    throw new ExternalServiceAPIError('Error with external movie service', error.statusCode, error.details);
  }

  throw new Error('Internal server error');
};