import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import SingleMovie from './components/SingleMovie';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: 'movies/:id', element: <SingleMovie /> },
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
