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
        const result = searchTerm ? await search(searchTerm) : await getAll();
        console.log('Received data:', result);

        let foodsArray = [];
        if (Array.isArray(result)) {
          foodsArray = result;
        } else if (typeof result === 'object' && result !== null) {
          // Check for common API response structures
          if (Array.isArray(result.data)) {
            foodsArray = result.data;
          } else if (Array.isArray(result.results)) {
            foodsArray = result.results;
          } else if (Array.isArray(result.items)) {
            foodsArray = result.items;
          } else {
            throw new Error('Unexpected data structure');
          }
        } else {
          throw new Error('Invalid data received from API');
        }

        setFoods(foodsArray);
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
      {foods.length > 0 ? (
        <Thumbnails foods={foods} />
      ) : (
        <div>No food items available</div>
      )}
    </>
  )
}

export default HomePage