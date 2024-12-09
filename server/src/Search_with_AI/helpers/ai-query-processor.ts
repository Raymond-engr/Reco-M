import { GoogleGenerativeAI } from '@google/generative-ai';
import pLimit from 'p-limit';
import { ExternalMovieService } from './externalMovieService';
import logger from '../utils/logger';

// Enum for Query Types
enum QueryType {
  RECOMMENDATION = 'recommendation',
  SPECIFIC_THEME = 'specific_theme',
  PLOT_DESCRIPTION = 'plot_description',
  GENERIC_SEARCH = 'generic_search'
}

// Query Analysis Result Interface
interface QueryAnalysisResult {
  type: QueryType;
  intent: string;
  keywords: string[];
  additionalContext: Record<string, any>;
}

// Movie Response Interface
interface MovieResponse {
  type: 'single' | 'multiple';
  results: IMovie[];
  explanation?: string;
}

class IntelligentMovieQueryHandler {
  private genAI: GoogleGenerativeAI;
  private externalMovieService: ExternalMovieService;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.externalMovieService = new ExternalMovieService();
  }

  // Main query processing method
  async processQuery(query: string): Promise<MovieResponse> {
    try {
      // Step 1: Analyze Query Intent
      const queryAnalysis = await this.analyzeQueryIntent(query);

      // Step 2: Generate Appropriate Response Based on Intent
      switch (queryAnalysis.type) {
        case QueryType.RECOMMENDATION:
          return this.generateRecommendation(queryAnalysis);
        
        case QueryType.SPECIFIC_THEME:
          return this.findMoviesByTheme(queryAnalysis);
        
        case QueryType.PLOT_DESCRIPTION:
          return this.findMovieByPlot(queryAnalysis);
        
        default:
          return this.performGenericSearch(queryAnalysis);
      }
    } catch (error) {
      logger.error('Movie Query Processing Error', error);
      return { type: 'multiple', results: [] };
    }
  }

  // Analyze Query Intent Using Gemini
  private async analyzeQueryIntent(query: string): Promise<QueryAnalysisResult> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `Analyze this movie search query in detail:
      Query: "${query}"
      
      Provide a JSON response with:
      - type: (recommendation/specific_theme/plot_description/generic_search)
      - intent: (detailed description of user's intent)
      - keywords: (list of relevant keywords)
      - additionalContext: (any extra contextual information)`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      const parsedResponse = this.extractAndParseJSON(response);

      return {
        type: this.mapQueryType(parsedResponse.type),
        intent: parsedResponse.intent,
        keywords: parsedResponse.keywords || [],
        additionalContext: parsedResponse.additionalContext || {}
      };
    } catch (error) {
      logger.error('Query Intent Analysis Error', error);
      return this.fallbackQueryAnalysis(query);
    }
  }

  // Extract and Parse JSON from AI response
  private extractAndParseJSON(text: string): any {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (error) {
      logger.error('JSON Parsing Error', error);
      return {};
    }
  }

  // Fallback query analysis
  private fallbackQueryAnalysis(query: string): QueryAnalysisResult {
    return {
      type: QueryType.GENERIC_SEARCH,
      intent: 'general movie search',
      keywords: query.split(/\s+/),
      additionalContext: {}
    };
  }

  // Map string to QueryType enum
  private mapQueryType(type: string): QueryType {
    const typeMap: Record<string, QueryType> = {
      'recommendation': QueryType.RECOMMENDATION,
      'specific_theme': QueryType.SPECIFIC_THEME,
      'plot_description': QueryType.PLOT_DESCRIPTION,
      'generic_search': QueryType.GENERIC_SEARCH
    };
    return typeMap[type.toLowerCase()] || QueryType.GENERIC_SEARCH;
  }

  // Generate Personalized Movie Recommendation
  private async generateRecommendation(analysis: QueryAnalysisResult): Promise<MovieResponse> {
  try {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate a list of movie titles that match this recommendation request:
    Context: ${analysis.intent}
    Additional Context: ${JSON.stringify(analysis.additionalContext)}
    
    Provide a comma-separated list of movie titles.`;

    const result = await model.generateContent(prompt);
    const recommendedTitles = result.response.text()
      .split(',')
      .map(title => title.trim())
      .filter(title => title);

    const limit = pLimit(5);
    
    const searchForTitle = async (title: string) => {
      try {
        const [tmdb, omdb] = await Promise.all([
          this.externalMovieService.searchTMDB(title),
          this.externalMovieService.searchOMDB(title)
        ]);
        return { tmdb, omdb };
      } catch (error) {
        logger.warn(`Failed to search for title: ${title}`, error);
        return null;
      }
    };

    const searchResults = await Promise.all(
      recommendedTitles.map(title => limit(() => searchForTitle(title)))
    );

    const successfulResults = searchResults.filter(Boolean).flatMap(result => [result?.tmdb, result?.omdb]);

    const combinedResults = this.externalMovieService.mergeDedupResults(successfulResults);

    const rankedResults = await this.verifyAndRankResults(combinedResults, analysis.intent);

    return {
      type: rankedResults.length === 1 ? 'single' : 'multiple',
      results: rankedResults,
      explanation: `Recommendations based on ${analysis.intent}`
    };
  } catch (error) {
    logger.error('Recommendation Generation Error', error);
    return { type: 'multiple', results: [] };
  }
}

  // Find Movies by Specific Theme
  // Find movies by theme
private async findMoviesByTheme(analysis: QueryAnalysisResult): Promise<MovieResponse> {
  try {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Find movie titles that match this theme:
    Theme: ${analysis.keywords.join(' ')}
    Intent: ${analysis.intent}
    
    Provide a comma-separated list of movie titles.`;

    const result = await model.generateContent(prompt);
    const themeTitles = result.response.text()
      .split(',')
      .map(title => title.trim())
      .filter(title => title);

    const limit = pLimit(5);

    const searchForTitle = async (title: string) => {
      try {
        const [tmdb, omdb] = await Promise.all([
          this.externalMovieService.searchTMDB(title),
          this.externalMovieService.searchOMDB(title)
        ]);
        return { tmdb, omdb };
      } catch (error) {
        logger.warn(`Failed to search for title: ${title}`, error);
        return null;
      }
    };

    const searchResults = await Promise.all(
      themeTitles.map(title => limit(() => searchForTitle(title)))
    );

    const successfulResults = searchResults.filter(Boolean).flatMap(result => [result?.tmdb, result?.omdb]);

    const combinedResults = this.externalMovieService.mergeDedupResults(successfulResults);

    const rankedResults = await this.verifyAndRankResults(combinedResults, analysis.intent);

    return {
      type: rankedResults.length === 1 ? 'single' : 'multiple',
      results: rankedResults,
      explanation: `Movies related to theme: ${analysis.intent}`
    };
  } catch (error) {
    logger.error('Theme-based Search Error', error);
    return { type: 'multiple', results: [] };
  }
}

// Find movie by specific plot description
private async findMovieByPlot(analysis: QueryAnalysisResult): Promise<MovieResponse> {
  try {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Find movie titles that match this plot description:
    Plot: ${analysis.intent}
    
    Provide a comma-separated list of movie titles.`;

    const result = await model.generateContent(prompt);
    const plotTitles = result.response.text()
      .split(',')
      .map(title => title.trim())
      .filter(title => title);

    const limit = pLimit(5);

    const searchForTitle = async (title: string) => {
      try {
        const [tmdb, omdb] = await Promise.all([
          this.externalMovieService.searchTMDB(title),
          this.externalMovieService.searchOMDB(title)
        ]);
        return { tmdb, omdb };
      } catch (error) {
        logger.warn(`Failed to search for title: ${title}`, error);
        return null;
      }
    };

    const searchResults = await Promise.all(
      plotTitles.map(title => limit(() => searchForTitle(title)))
    );

    const successfulResults = searchResults.filter(Boolean).flatMap(result => [result?.tmdb, result?.omdb]);

    const combinedResults = this.externalMovieService.mergeDedupResults(successfulResults);

    const rankedResults = await this.verifyAndRankResults(combinedResults, analysis.intent);

    return {
      type: rankedResults.length === 1 ? 'single' : 'multiple',
      results: rankedResults,
      explanation: `Movies matching plot description`
    };
  } catch (error) {
    logger.error('Plot-based Movie Search Error', error);
    return { type: 'multiple', results: [] };
  }
}

  // Generic Search Fallback
  private async performGenericSearch(analysis: QueryAnalysisResult): Promise<MovieResponse> {
    try {
      const [tmdbResults, omdbResults] = await Promise.all([
            this.externalMovieService.searchTMDB(analysis.keywords.join(' ')),
            this.externalMovieService.searchOMDB(analysis.keywords.join(' '))
        ]);

      const combinedResults = this.externalMovieService.mergeDedupResults([tmdbResults, omdbResults]);
      const rankedResults = await this.verifyAndRankResults(combinedResults, analysis.intent);

      return {
        type: rankedResults.length === 1 ? 'single' : 'multiple',
        results: rankedResults,
        explanation: 'Generic movie search results'
      };
    } catch (error) {
      logger.error('Generic Search Error', error);
      return { type: 'multiple', results: [] };
    }
  }

  // Verify and Rank Results
  private async verifyAndRankResults(
    results: IMovie[], 
    originalQuery: string
  ): Promise<IMovie[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `Rank and verify these movie search results for the query: "${originalQuery}"
      
      Criteria for ranking:
      1. Relevance to query
      2. Recency
      3. Popularity
      4. Thematic match
      
      Provide a ranked list of movie titles in order of relevance.`;

      const result = await model.generateContent(prompt);
      const rankedTitles = result.response.text()
        .split('\n')
        .map(title => title.trim())
        .filter(title => title);

      // Reorder results based on AI-generated ranking
      return this.reorderResultsByRanking(results, rankedTitles);
    } catch (error) {
      logger.error('Result Ranking Error', error);
      return results;
    }
  }

  // Reorder results based on AI-generated ranking
  private reorderResultsByRanking(
    results: IMovie[], 
    rankedTitles: string[]
  ): IMovie[] {
    const rankedResults: IMovie[] = [];
    const unrankedResults: IMovie[] = [];

    // First pass: add ranked results
    rankedTitles.forEach(title => {
      const matchedMovie = results.find(movie => 
        movie.name.toLowerCase().includes(title.toLowerCase())
      );
      if (matchedMovie) {
        rankedResults.push(matchedMovie);
      }
    });

    // Second pass: add any remaining unranked results
    results.forEach(movie => {
      if (!rankedResults.includes(movie)) {
        unrankedResults.push(movie);
      }
    });

    return [...rankedResults, ...unrankedResults];
  }
}

export default IntelligentMovieQueryHandler;