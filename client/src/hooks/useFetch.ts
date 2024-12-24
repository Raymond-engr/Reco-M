import { useState, useEffect } from 'react';
import axios from 'axios';
import { Movies } from '../components/MovieCard';
import { Movie } from '../components/SingleMovie';

interface FetchError {
  show: boolean;
  msg: string;
}

const API_KEY = import.meta.env.VITE_API_KEY;
const API_ENDPOINT = 'https://www.omdbapi.com';

axios.defaults.baseURL = API_ENDPOINT;

const api = axios.create({
  baseURL: API_ENDPOINT,
  timeout: 5000,
});

const useFetch = (urlParams: string): { 
  isLoading: boolean; 
  error: FetchError; 
  data: Movies[] | Movie | null; 
  loadMore: () => void; 
} => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FetchError>({ show: false, msg: '' });
  const [data, setData] = useState<Movies[] | Movie | null>(null);
  const [page, setPage] = useState(1);

  const fetchMovies = async (url: string) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/?apikey=${API_KEY}${url}&page=${page}`);
      const result = response.data;

      if (result.Response === 'True') {
        setData(prev => {
          if (Array.isArray(result.Search)) {
            return [...(Array.isArray(prev) ? prev : []), ...result.Search];
          } else {
            return result;
          }
        });
        setError({ show: false, msg: '' });
      } else {
        setError({ show: true, msg: result.Error });
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.Error || err.message
        : 'Something went wrong';
      setError({ show: true, msg: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => setPage(prev => prev + 1);

  useEffect(() => {
    fetchMovies(urlParams);
  }, [urlParams, page]);

  return { isLoading, error, data, loadMore };
};

export default useFetch;