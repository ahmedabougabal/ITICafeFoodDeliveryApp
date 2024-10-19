import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Food } from '../types/Food';
import { orderService } from '../services/orderService';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  food: Food;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: {
    items: CartItem[];
    totalPrice: number;
    totalCount: number;
  };
  addToCart: (food: Food) => void;
  removeFromCart: (foodId: string) => void;
  changeQuantity: (cartItem: CartItem, newQuantity: number) => void;
  createOrder: () => Promise<any>;
  payOrder: (id: number, method: string) => Promise<any>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_KEY = 'cart';
const EMPTY_CART = {
  items: [],
  totalPrice: 0,
  totalCount: 0,
};

interface CartProviderProps {
  children: ReactNode;
}

const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const initCart = getCartFromLocalStorage();
  const [cartItems, setCartItems] = useState<CartItem[]>(initCart.items);
  const [totalPrice, setTotalPrice] = useState<number>(initCart.totalPrice);
  const [totalCount, setTotalCount] = useState<number>(initCart.totalCount);

  const clearCart = () => {
    setCartItems([]);
    setTotalPrice(0);
    setTotalCount(0);
    localStorage.removeItem(CART_KEY);
  };

  useEffect(() => {
    const totalPrice = sum(cartItems.map((item) => {
      console.log(`Item price: ${item.price}, type: ${typeof item.price}`);
      return item.price;
    }));
    console.log(`Calculated total price: ${totalPrice}`);
    const totalCount = sum(cartItems.map((item) => item.quantity));
    setTotalPrice(totalPrice);
    setTotalCount(totalCount);

    localStorage.setItem(
      CART_KEY,
      JSON.stringify({
        items: cartItems,
        totalPrice,
        totalCount,
      })
    );
  }, [cartItems]);

  function getCartFromLocalStorage() {
    const storedCart = localStorage.getItem(CART_KEY);
    console.log('Stored cart:', storedCart);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        console.log('Parsed cart:', parsedCart);
        return parsedCart;
      } catch (error) {
        console.error('Error parsing stored cart:', error);
        return EMPTY_CART;
      }
    }
    return EMPTY_CART;
  }

  const sum = (items: number[]) => {
    console.log('Summing items:', items);
    return items.reduce((prevValue, curValue) => {
      const sum = prevValue + curValue;
      console.log(`${prevValue} + ${curValue} = ${sum}`);
      return sum;
    }, 0);
  };

  const removeFromCart = (foodId: string) => {
    console.log(`Removing food with ID: ${foodId} from cart...`);
    const filteredCartItems = cartItems.filter((item) => item.food.id !== foodId);
    setCartItems(filteredCartItems);
    console.log('Cart updated after removal:', filteredCartItems);
  };

  const changeQuantity = (cartItem: CartItem, newQuantity: number) => {
    console.log(`Changing quantity of food with ID: ${cartItem.food.id} to ${newQuantity}...`);
    const { food } = cartItem;
    const changedCartItem = {
      ...cartItem,
      quantity: newQuantity,
      price: food.price * newQuantity,
    };
    setCartItems(
      cartItems.map((item) => (item.food.id === food.id ? changedCartItem : item))
    );
    console.log('Cart updated after quantity change:', cartItems);
  };

  const addToCart = (food: Food) => {
    console.log(`Adding food with ID: ${food.id} to cart...`);
    console.log('Food price:', food.price, 'type:', typeof food.price);
    const cartItem = cartItems.find((item) => item.food.id === food.id);
    if (cartItem) {
      changeQuantity(cartItem, cartItem.quantity + 1);
    } else {
      setCartItems([...cartItems, { food, quantity: 1, price: Number(food.price) }]);
    }
    console.log('Cart updated after addition:', cartItems);
  };

  const payOrder = async (id: number, method: string) => {
    try {
      const response = await orderService.payOrder(id, method);
      return response;
    } catch (error) {
      console.error('Error paying order:', error);
    }
  };

  const createOrder = async () => {
    try {
      console.log('Cart data before creating order:', cartItems);
      const orderData = {
        items: cartItems.map((item) => ({
          item_id: item.food.id,
          quantity: item.quantity,
          price_at_time_of_order: item.price / item.quantity, // will validate item.price is total price for the quantity with backend
        })),
        total_price: totalPrice,
      };
      console.log('Prepared order data:', orderData);
      const response = await orderService.createOrder(orderData);
      console.log('Created order:', response);
      clearCart();
      navigate('/order-success'); // Redirect to the success page
      return response;
    } catch (error) {
      console.error('Error creating order:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart: { items: cartItems, totalPrice, totalCount },
        removeFromCart,
        changeQuantity,
        addToCart,
        createOrder,
        payOrder,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartProvider;