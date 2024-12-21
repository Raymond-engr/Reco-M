import { useState, useEffect } from 'react';
import {API_ENDPOINT} from '../context/context'
import {Movie} from '../components/Movies';

interface FetchError {
  show: boolean;
  msg: string;
}

const useFetch = (urlParams: string): { isLoading: boolean; error: FetchError; data: Movie[] | null; loadMore: () => void; } => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FetchError>({ show: false, msg: '' });
  const [data, setData] = useState<Movie[] | null>(null);
  const [page, setPage] = useState(1);

  const fetchMovies = async (url: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(url + `&page=${page}`);
      const result = await response.json();

      if (result.Response === 'True') {
        setData(prev => {
        if (Array.isArray(result.Search)) {
        return [...(prev || []), ...result.Search];
        } else {
        return result;
        }
        });
        setError({ show: false, msg: '' });
      } else {
        setError({ show: true, msg: result.Error });
      }
    } catch {
      setError({ show: true, msg: 'Something went wrong' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => setPage(prev => prev + 1);

  useEffect(() => {
    fetchMovies(`${API_ENDPOINT}${urlParams}`);
  }, [urlParams, page]);

  return { isLoading, error, data: data || [], loadMore };
};

export default useFetch;
