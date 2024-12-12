import axios from 'axios';
import logger from '../../utils/logger.js';
import { AppError } from '../../utils/customErrors.js';
import { handleExternalServiceError } from '../helpers/handleExternalServiceErrors.js';
import { IMovies } from '../../types/types.js';
import validateEnv from '../../utils/validateEnv.js';

validateEnv();

interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string | null;
  genre_ids: number[];
  popularity: number;
  original_language: string;
  adult: boolean;
}

interface TMDBDetailedMovie {
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  keywords: { keywords: Array<{ id: number; name: string }> };
}

interface TMDBCredits {
  cast: Array<{ name: string; character: string }>;
}

interface TMDBResponse {
  results: TMDBMovie[];
}

interface OMDBMovie {
  Title: string;
  Poster: string;
  Year: string;
  Ratings: Array<{ Source: string; Value: string }>;
}

interface OMDBResponse {
  Search: OMDBMovie[];
}

export class ExternalMovieService {
  private tmdbApiKey: string;
  private omdbApiKey: string;
  private tmdbGenreMap: Map<number, string>;

  constructor() {
    this.tmdbApiKey = process.env.TMDB_API_KEY || '';
    this.omdbApiKey = process.env.OMDB_API_KEY || '';
    this.tmdbGenreMap = new Map<number, string>();

    if (!this.tmdbApiKey || !this.omdbApiKey) {
      logger.error('API keys for TMDB or OMDB are not set');
      throw new AppError('API keys for TMDB or OMDB are not set', 500);
    }
  }

  private async fetchTMDBGenres(): Promise<void> {
    if (this.tmdbGenreMap.size > 0) return;

    try {
      const response = await axios.get<{ genres: Array<{ id: number; name: string }> }>(
        'https://api.themoviedb.org/3/genre/movie/list',
        { params: { api_key: this.tmdbApiKey, language: 'en-US' } }
      );

      response.data.genres.forEach((genre) => {
        this.tmdbGenreMap.set(genre.id, genre.name);
      });

      logger.info('Fetched and cached TMDB genres');
    } catch (error: any) {
      handleExternalServiceError('TMDB', error);
    }
  }

  private async fetchMovieDetails(movieId: number): Promise<Partial<IMovies>> {
    try {
      const [detailsResponse, creditsResponse] = await Promise.all([
        axios.get<TMDBDetailedMovie>(`https://api.themoviedb.org/3/movie/${movieId}`, {
          params: { api_key: this.tmdbApiKey },
        }),
        axios.get<TMDBCredits>(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          params: { api_key: this.tmdbApiKey },
        }),
      ]);

      const details = detailsResponse.data;
      const credits = creditsResponse.data;

      return {
        time_duration: details.runtime ? `${details.runtime} mins` : undefined,
        metadata: {
          keywords: details.keywords.keywords.map((keyword) => keyword.name),
          lastUpdated: new Date(),
        },
        cast: (credits.cast || []).slice(0, 5).map((member) => member.name) || [],
      };
    } catch (error: any) {
      handleExternalServiceError('TMDB', error);
      return { cast: [] };
    }
  }

  async searchTMDB(query: string): Promise<IMovies[]> {
    try {
      const response = await axios.get<TMDBResponse>('https://api.themoviedb.org/3/search/movie', {
        params: { api_key: this.tmdbApiKey, query, language: 'en-US', page: 1 },
        timeout: 30000,
      });

      const movies = response.data.results;
      
      if (!movies) {
        logger.warn(`TMDB returned no results for query: ${query}`);
        return [];
      }
      
      return Promise.all(
        movies.map(async (movie) => {
          await this.fetchTMDBGenres();
          const genres = (movie.genre_ids || []).map((id) => this.tmdbGenreMap.get(id) || 'Unknown Genre');
          const additionalDetails = await this.fetchMovieDetails(movie.id);

          return {
            name: movie.title,
            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
            description: movie.overview,
            year_released: movie.release_date?.split('-')[0] || '',
            ...additionalDetails,
            metadata: {
              ...additionalDetails.metadata,
              genres,
              popularity: movie.popularity,
              lastUpdated: additionalDetails.metadata?.lastUpdated || new Date(),
            },
            cast: additionalDetails.cast || [],
          };
        })
      );
    } catch (error: any) {
      handleExternalServiceError('TMDB', error);
    }
  }

  async searchOMDB(query: string): Promise<IMovies[]> {
    try {
      const response = await axios.get<OMDBResponse>('http://www.omdbapi.com/', {
        params: { apikey: this.omdbApiKey, s: query, type: 'movie' },
        timeout: 30000,
      });

      const movies = response.data.Search;

      if (!movies) {
        logger.warn(`OMDB returned no results for query: ${query}`);
        return [];
      }

      return movies.map((movie) => ({
        name: movie.Title,
        poster: movie.Poster || '',
        description: '', // Requires additional API calls
        cast: [], // Requires additional API calls
        year_released: movie.Year,
        metadata: {
          ratings: movie.Ratings?.map((rating) => ({
            source: rating.Source,
            value: rating.Value,
          })),
          lastUpdated: new Date(),
        },
      }));
    } catch (error: any) {
      handleExternalServiceError('OMDB', error);
    }
  }

  mergeDedupResults(resultSets: IMovies[][]): IMovies[] {
    const uniqueMovies = new Map<string, IMovies>();

    resultSets.forEach((results) => {
      results.forEach((movie) => {
        const key = `${movie.name}-${movie.year_released}`;
        if (!uniqueMovies.has(key)) {
          uniqueMovies.set(key, movie);
        } else {
          const existing = uniqueMovies.get(key)!;
          existing.metadata = {
            ...existing.metadata,
            genres: [...(existing.metadata?.genres || []), ...(movie.metadata?.genres || [])],
            ratings: [...(existing.metadata?.ratings || []), ...(movie.metadata?.ratings || [])],
            lastUpdated: existing.metadata?.lastUpdated || new Date(),
          };
        }
      });
    });

    logger.info(`Merged and deduplicated ${uniqueMovies.size} movies.`);
    return Array.from(uniqueMovies.values());
  }
}