import React, { useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { AIMovies } from '../types/types';
import SkeletonLoader from './SkeletonLoader';

interface SearchBarProps {
  onAiSearch: (query: string) => void;
}

interface ApiResponse {
  success: boolean;
  type: string;
  results: AIMovies[] | [];
  explanation: string;
  error?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SearchBar: React.FC<SearchBarProps> = ({ onAiSearch }) => {
  const [query, setQuery] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAiSearch(query);
  };

  return (
    <div>
      <h2 className="text-center text-xl font-semibold mb-2 mt-2">Search Movies With AI</h2>
      <form onSubmit={handleSubmit} className="relative w-[90vw] max-w-lg mx-auto mt-10 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2 pr-10 rounded-md bg-white text-gray-700 focus:outline-none ring-1 ring-black ring-opacity-20"
          placeholder="Enter Movie Search Query..."
        />
        <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2" aria-label="Search">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>
    </div>
  );
};


const SearchWithAI: React.FC= () => {
  const [responseData, setResponseData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAiSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setResponseData(null);
    try {
      const response: AxiosResponse<ApiResponse> = await axios.get(`${API_URL}/api/v1/aiSearch`, {
        params: { q: query },
      });
      setResponseData(response.results);
      console.log(responseData);
      console.log(responseData.results);
      console.log(responseData.explanation);
      console.log(response.data);
      console.log(responseData);
      console.log(responseData.results);
      console.log(responseData.explanation);
      
      
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message);
      } else {
        setError('An unknown error occurred');
      }
      setResponseData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4">
      <SearchBar onAiSearch={handleAiSearch} />

      {isLoading && (
        <SkeletonLoader count={4} />
      )}
      
      {error && <p className="mt-4 text-red-500">Error: {error}</p>}
    </div>
  );
};

export default SearchWithAI;