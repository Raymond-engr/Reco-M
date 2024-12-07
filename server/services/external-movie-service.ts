import axios from 'axios';
import MovieModel from '../Search_with_AI/movie.model';

export class ExternalMovieService {
  private tmdbApiKey: string;
  private omdbApiKey: string;

  constructor() {
    this.tmdbApiKey = process.env.TMDB_API_KEY || '';
    this.omdbApiKey = process.env.OMDB_API_KEY || '';
  }

  // Search TMDB for movies
  async searchTMDB(query: string): Promise<MovieSchema[]> {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
        params: {
          api_key: this.tmdbApiKey,
          query: query,
          language: 'en-US',
          page: 1
        }
      });

      return response.data.results.map(movie => ({
        name: movie.title,
        poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        description: movie.overview,
        cast: [], // Requires additional API call
        year_released: movie.release_date?.split('-')[0],
        time_duration: '', // Requires additional API call
        metadata: {
          source: 'TMDB',
          lastUpdated: new Date(),
          popularity: movie.popularity
        }
      }));
    } catch (error) {
      console.error('TMDB Search Error:', error);
      return [];
    }
  }

  // Search OMDB for movies
  async searchOMDB(query: string): Promise<MovieSchema[]> {
    try {
      const response = await axios.get('http://www.omdbapi.com/', {
        params: {
          apikey: this.omdbApiKey,
          s: query,
          type: 'movie'
        }
      });

      return response.data.Search?.map(movie => ({
        name: movie.Title,
        poster: movie.Poster,
        description: '', // Requires additional API call
        cast: [], // Requires additional API call
        year_released: movie.Year,
        time_duration: '', // Additional call needed
        metadata: {
          source: 'OMDB',
          lastUpdated: new Date()
        }
      })) || [];
    } catch (error) {
      console.error('OMDB Search Error:', error);
      return [];
    }
  }

  // Deduplicate and merge results
  mergeDedupResults(resultSets: MovieSchema[][]): MovieSchema[] {
    const uniqueMovies = new Map<string, MovieSchema>();
    
    resultSets.forEach(results => {
      results.forEach(movie => {
        const key = `${movie.name}-${movie.year_released}`;
        if (!uniqueMovies.has(key)) {
          uniqueMovies.set(key, movie);
        }
      });
    });

    return Array.from(uniqueMovies.values());
  }
}