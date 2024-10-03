import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Food } from '../types/Food';
import { orderService } from '../services/orderService';

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
  const initCart = getCartFromLocalStorage();
  const [cartItems, setCartItems] = useState<CartItem[]>(initCart.items);
  const [totalPrice, setTotalPrice] = useState<number>(initCart.totalPrice);
  const [totalCount, setTotalCount] = useState<number>(initCart.totalCount);

  useEffect(() => {
    const totalPrice = sum(cartItems.map((item) => item.price));
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
    return storedCart ? JSON.parse(storedCart) : EMPTY_CART;
  }

  const sum = (items: number[]) => {
    return items.reduce((prevValue, curValue) => prevValue + curValue, 0);
  };

  const removeFromCart = (foodId: string) => {
    const filteredCartItems = cartItems.filter((item) => item.food.id !== foodId);
    setCartItems(filteredCartItems);
  };

  const changeQuantity = (cartItem: CartItem, newQuantity: number) => {
    const { food } = cartItem;
    const changedCartItem = {
      ...cartItem,
      quantity: newQuantity,
      price: food.price * newQuantity,
    };
    setCartItems(
      cartItems.map((item) => (item.food.id === food.id ? changedCartItem : item))
    );
  };

  const addToCart = (food: Food) => {
    const cartItem = cartItems.find((item) => item.food.id === food.id);
    if (cartItem) {
      changeQuantity(cartItem, cartItem.quantity + 1);
    } else {
      setCartItems([...cartItems, { food, quantity: 1, price: food.price }]);
    }
  };

  const createOrder = async () => {
    try {
      const orderData = {
        items: cartItems.map((item) => ({
          item_id: item.food.id,
          quantity: item.quantity,
        })),
        total_price: totalPrice,
      };
      const createdOrder = await orderService.createOrder(orderData);
      setCartItems([]);
      return createdOrder;
    } catch (error) {
      console.error('Error creating order:', error);
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