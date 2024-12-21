import React, { useContext, useState, ReactNode } from 'react';
import { Movie } from "../components/Movies";
import useFetch from '../hooks/useFetch';

const API_KEY = import.meta.env.VITE_API_KEY;
export const API_ENDPOINT = `https://www.omdbapi.com/?apikey=${API_KEY}`;

interface ContextType {
  isLoading: boolean;
  error: { show: boolean; msg: string };
  movies:  Movie[] | null;
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
