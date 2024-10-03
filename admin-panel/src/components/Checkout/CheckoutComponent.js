import React from 'react';
import { useDispatch } from 'react-redux';
import { createOrder } from '../../slices/orderSlice';

const CheckoutComponent = ({ cart }) => {
  const dispatch = useDispatch()

  const handleCheckout = () => {
    const orderData = {
      items: cart.items.map(item => ({
        item_id: item.id,
        quantity: item.quantity
      })),
      total_price: cart.totalPrice
    };

    dispatch(createOrder(orderData))
      .then(() => {
        alert(
          'Your order has been placed successfully. Please wait for confirmation and preparation time.',
        )
        // Clear the cart or redirect to a confirmation page
      })
      .catch(error => {
        alert('There was an error placing your order. Please try again.');
      });
  };

  return (
    <div>
      <h2>Checkout</h2>
      {/* Display cart items and total */}
      <p>Total: ${cart.totalPrice}</p>
      <p>Payment Method: Cash on Pickup</p>
      <button onClick={handleCheckout}>Place Order</button>
    </div>
  );
};

export default CheckoutComponent;
