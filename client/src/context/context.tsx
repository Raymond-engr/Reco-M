import React, { useContext, useState, ReactNode } from 'react';
import { Movies } from '../components/MovieCard';
import useFetch from '../hooks/useFetch';
import { Movie } from '../components/SingleMovie';

interface ContextType {
  isLoading: boolean;
  error: { show: boolean; msg: string };
  movies: Movies[] | Movie | null;
  loadMore: () => void;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
}

const AppContext = React.createContext<ContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [query, setQuery] = useState('batman');
  const { isLoading, error, data: movies, loadMore } = useFetch(`&s=${query}`);

  return (
    <AppContext.Provider value={{ isLoading, error, movies, loadMore, query, setQuery }}>
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = (): ContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within AppProvider');
  }
  return context;
};