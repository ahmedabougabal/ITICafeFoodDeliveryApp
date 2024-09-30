import React, { useEffect, useState } from 'react'
import { getAll, search } from '../../services/FoodService';
import Thumbnails from '../../components/Thumbnails/Thumbnails';
import { useParams } from 'react-router-dom';
import Search from '../../components/Search/Search';

const HomePage = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchTerm } = useParams();

  useEffect(() => {
    const loadFoods = async () => {
      try {
        setLoading(true);
        const loadedFoods = searchTerm ? await search(searchTerm) : await getAll();
        setFoods(loadedFoods);
        setError(null);
      } catch (err) {
        setError('Failed to load menu items. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFoods();
  }, [searchTerm]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Search />
      <Thumbnails foods={foods} />
    </>
  )
}

export default HomePage