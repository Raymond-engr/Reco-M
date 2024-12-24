import React from 'react';
import SearchWithAI from '../components/AiSearch';

const Home: React.FC = () => {
  return (
    <main className="w-full min-h-screen bg-grey-10">
      <SearchWithAI />
    </main>
  );
};

export default Home;