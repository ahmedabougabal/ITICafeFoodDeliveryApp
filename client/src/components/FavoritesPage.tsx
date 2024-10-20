import React from 'react';
import { useFavorites } from '../FavoritesContext.tsx';
import { FaHeart, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '../components/ui/Card';

const FavoritesPage: React.FC = () => {
  const { favoriteItems, removeFromFavorites, isLoading, error } = useFavorites();
  const [removingId, setRemovingId] = React.useState<number | null>(null);

  const handleRemoveFromFavorites = async (id: number) => {
    try {
      setRemovingId(id);
      await new Promise(resolve => setTimeout(resolve, 300));
      removeFromFavorites(id);
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove from favorites');
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center py-8 text-xl text-red-500 bg-red-50 p-4 rounded-lg shadow">
          <FaHeart className="text-4xl mb-4 mx-auto" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        My Favorites
        <span className="ml-2 text-2xl text-gray-500">({favoriteItems.length})</span>
      </h1>

      {favoriteItems.length === 0 ? (
        <div className="text-center py-12">
          <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600">You haven't added any favorites yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {favoriteItems.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className={`relative ${removingId === item.id ? 'opacity-50' : ''}`}
              >
                <Card className="favorite-item hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <Card.Image
                      src={item.image ? `/media/${item.image}` : '/api/placeholder/400/300'}
                      alt={item.name}
                      className="h-48 object-cover"
                    />
                    <button
                      onClick={() => handleRemoveFromFavorites(item.id)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-red-500 hover:text-white transition-colors"
                      disabled={removingId === item.id}
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  </div>
                  <Card.Header>
                    <Card.Title className="text-xl font-bold">{item.name}</Card.Title>
                    <Card.Description className="text-gray-600">{item.description}</Card.Description>
                  </Card.Header>
                  <Card.Content>
                    <p className="text-lg font-semibold text-green-600">
                      Price: ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                    </p>
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;