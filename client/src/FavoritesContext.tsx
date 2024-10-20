import React, { createContext, useState, useEffect, useContext } from 'react';
import { getFavoriteItems } from './services/FoodService';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number | string;
  image: string;  // Changed from image_url to match your MenuItem structure
  category: { name: string };
  is_available: boolean;
  stock: number;
  calories: number;
  allergens: string;
}

interface FavoritesContextType {
  favorites: number[];
  favoriteItems: MenuItem[];
  addToFavorites: (id: number) => void;
  removeFromFavorites: (id: number) => void;
  isLoading: boolean;
  error: string | null;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [favoriteItems, setFavoriteItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const fetchFavoriteItems = async () => {
      if (favorites.length === 0) {
        setFavoriteItems([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const items = await getFavoriteItems(favorites);
        setFavoriteItems(items);
      } catch (error: any) {
        console.error('Failed to fetch favorite items:', error);
        setError(error.message || 'Failed to fetch favorite items');
        setFavoriteItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteItems();
  }, [favorites]);

  const addToFavorites = (id: number) => {
    setFavorites(prev => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const removeFromFavorites = (id: number) => {
    setFavorites(prev => prev.filter(itemId => itemId !== id));
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteItems,
        addToFavorites,
        removeFromFavorites,
        isLoading,
        error
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export { FavoritesContext };