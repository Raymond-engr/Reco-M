import { Request, Response } from 'express';
import { AIQueryProcessor } from '../utils/ai-query-processor';
import { ExternalMovieService } from '../services/external-movie-service';
import { SearchHistoryManager } from '../services/search-history.service';

export class AISearchController {
  private aiQueryProcessor: AIQueryProcessor;
  private externalMovieService: ExternalMovieService;
  private searchHistoryManager: SearchHistoryManager;

  constructor() {
    this.aiQueryProcessor = new AIQueryProcessor();
    this.externalMovieService = new ExternalMovieService();
    this.searchHistoryManager = new SearchHistoryManager();
  }

  // Main AI-powered search method
  async aiSearch(req: Request, res: Response): Promise<Response> {
    try {
      const { query, userId } = req.body;

      // Validate input
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      // Analyze query intent
      const queryAnalysis = await this.aiQueryProcessor.analyzeQueryIntent(query);

      // Search multiple sources
      const [tmdbResults, omdbResults] = await Promise.all([
        this.externalMovieService.searchTMDB(query),
        this.externalMovieService.searchOMDB(query)
      ]);

      // Merge and deduplicate results
      const combinedResults = this.externalMovieService.mergeDedupResults([
        tmdbResults, 
        omdbResults
      ]);

      // Verify and rank results
      const rankedResults = await this.aiQueryProcessor.verifyAndRankResults(
        combinedResults, 
        query
      );

      // Determine result type
      const resultType = rankedResults.length === 1 ? 'single' : 'multiple';

      // Save search history for single results
      if (resultType === 'single' && userId) {
        await this.searchHistoryManager.saveSearchHistory(
          userId, 
          query, 
          rankedResults[0], 
          'single'
        );
      }

      return res.json({
        type: resultType,
        results: rankedResults,
        explanation: `Search results for: ${query}`
      });
    } catch (error) {
      console.error('AI Search Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}