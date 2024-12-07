import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIQueryProcessor {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  // Parse and enhance query intent
  async analyzeQueryIntent(query: string): Promise<QueryAnalysisResult> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `Analyze this movie search query in detail:
      Query: "${query}"
      
      Provide a JSON response with:
      - queryType: (recommendation/specific_theme/plot_description/generic_search)
      - intent: (detailed description of user's intent)
      - keywords: (list of relevant keywords)
      - additionalContext: (any extra contextual information)`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return JSON.parse(this.extractJSONFromText(response));
    } catch (error) {
      console.error('Query Intent Analysis Error:', error);
      return this.fallbackQueryAnalysis(query);
    }
  }

  // Extract JSON from AI response
  private extractJSONFromText(text: string): string {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : '{}';
  }

  // Fallback query analysis
  private fallbackQueryAnalysis(query: string): QueryAnalysisResult {
    return {
      queryType: 'generic_search',
      intent: 'general movie search',
      keywords: query.split(/\s+/),
      additionalContext: {}
    };
  }

  // Verify and rank movie results
  async verifyAndRankResults(
    results: MovieSchema[], 
    originalQuery: string
  ): Promise<MovieSchema[]> {
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
      console.error('Result Ranking Error:', error);
      return results;
    }
  }

  // Reorder results based on AI-generated ranking
  private reorderResultsByRanking(
    results: MovieSchema[], 
    rankedTitles: string[]
  ): MovieSchema[] {
    const rankedResults: MovieSchema[] = [];
    const unrankedResults: MovieSchema[] = [];

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
