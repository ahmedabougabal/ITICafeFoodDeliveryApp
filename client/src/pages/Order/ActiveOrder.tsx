import React, { useEffect, useState } from 'react';
import orderService from '../../services/orderService';
import Price from '../../components/Price/Price';
import ProgressCountDown from '../../components/ProgressCountDown/ProgressCountDown';
import Card from '../../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const FancyRefreshButton: React.FC<{
  onClick: () => void;
  isRefreshing: boolean;
}> = ({ onClick, isRefreshing }) => {
  return (
    <button
      onClick={onClick}
      disabled={isRefreshing}
      className={`
        relative overflow-hidden
        inline-flex items-center px-6 py-3
        rounded-lg font-medium text-white
        shadow-lg transform transition-all duration-300
        disabled:opacity-75 disabled:cursor-not-allowed
        before:absolute before:inset-0
        before:bg-gradient-to-r before:from-purple-600 before:via-pink-600 before:to-blue-600
        before:animate-gradient-xy before:bg-[length:200%_200%]
        hover:scale-105 hover:shadow-xl
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
      `}
    >
      <span className="relative inline-flex items-center">
        <RefreshCw
          className={`w-5 h-5 mr-2 transition-transform duration-500 
            ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`}
        />
        <span className="relative">
          {isRefreshing ? 'Refreshing...' : 'Refresh Orders'}
        </span>
      </span>

      {/* Shine effect */}
      <span
        className={`
          absolute inset-0 
          bg-gradient-to-r from-transparent via-white/30 to-transparent 
          -translate-x-full 
          ${isRefreshing ? '' : 'group-hover:animate-shine'}
        `}
      />
    </button>
  );
};

const ActiveOrders: React.FC = () => {
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchActiveOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.ActiveOrders();
      setActiveOrders(data);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to fetch active orders');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchActiveOrders();
  };

  useEffect(() => {
    fetchActiveOrders();
    const intervalId = setInterval(fetchActiveOrders, 120000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading && !isRefreshing) {
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
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header section with proper spacing */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">
            Active Orders
            <span className="ml-2 text-xl text-gray-500">({activeOrders.length})</span>
          </h1>
          <FancyRefreshButton
            onClick={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>
      </div>

      {/* Rest of the component remains the same */}
      <div className="max-w-7xl mx-auto">
        {activeOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No active orders found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {activeOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <Card.Header>
                      <div className="flex justify-between items-center mb-4">
                        <Card.Title>Order #{order.id}</Card.Title>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>Payment: {order.payment_status}</p>
                        <p>Branch: {order.branch_name}</p>
                        <p>Created: {new Date(order.created_at).toLocaleString()}</p>
                      </div>
                    </Card.Header>

                    <Card.Content>
                      <div className="space-y-4">
                        {order.items.map((itemWrapper: any, index: number) => (
                          <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                            <img
                              src={itemWrapper.item.image}
                              alt={itemWrapper.item.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div>
                              <h3 className="font-medium">{itemWrapper.item.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="inline-block w-16">Price:</span>
                                <Price price={itemWrapper.item.price} />
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="inline-block w-16">Quantity:</span>
                                {itemWrapper.quantity}
                              </p>
                              <p className="text-sm font-medium mt-1">
                                <span className="inline-block w-16">Total:</span>
                                <Price price={`${(itemWrapper.quantity * parseFloat(itemWrapper.item.price)).toFixed(2)}`} />
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Price:</span>
                          <span className="text-lg font-bold">
                            <Price price={`${parseFloat(order.total_price).toFixed(2)}`} />
                          </span>
                        </div>
                        {order.status === "preparing" && (
                          <div className="mt-4">
                            <ProgressCountDown initTime={order.updated_at} preparation={order.preparation_time} />
                          </div>
                        )}
                      </div>
                    </Card.Content>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveOrders;