import React from 'react';
import SearchForm from '../components/SearchForm';
import Movies from '../components/Movies';

const Home: React.FC = () => {
  return (
    <main className="w-full min-h-screen bg-grey-10">
      <SearchForm />
      <Movies />
    </main>
  );
};

export default Home;
