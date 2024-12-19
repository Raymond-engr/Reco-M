import { useState, useEffect } from 'react';
import {API_ENDPOINT} from '../context/context'
import {Movie} from '../components/Movies';

interface FetchError {
  show: boolean;
  msg: string;
}

const useFetch = (urlParams: string): { isLoading: boolean; error: FetchError; data: Movie[] | null } => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FetchError>({ show: false, msg: '' });
  const [data, setData] = useState<Movie[] | null>(null);

  const fetchMovies = async (url: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(url);
      const result = await response.json();

      if (result.Response === 'True') {
        setData(result.Search || result);
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

  useEffect(() => {
    fetchMovies(`${API_ENDPOINT}${urlParams}`);
  }, [urlParams]);

  return { isLoading, error, data: data || [] };
};

export default useFetch;
