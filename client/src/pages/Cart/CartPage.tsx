import React, { useEffect } from 'react';
import classes from './cartpage.module.css';
import { useCart } from '../../hooks/useCart';
import { Title } from '../../components/Title/Title';
import { ConfigProvider, InputNumber, message } from 'antd';
import { Link } from 'react-router-dom';
import Price from '../../components/Price/Price';

export const CartPage = () => {
    const { cart, createOrder, changeQuantity, removeFromCart, payOrder } = useCart();

    const getImagePath = (imageUrl: string) => {
        // If the imageUrl doesn't exist, return placeholder
        if (!imageUrl) {
            return '/placeholder-food.png';
        }

        // If it's already a full URL, use it as is
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }

        // Otherwise, use the correct path from your Django media structure
        // Assuming your Django MEDIA_URL is configured correctly
        return `${process.env.REACT_APP_API_URL || ''}/media/${imageUrl}`;
    };



    const handleCheckout = async () => {
        try {
            await createOrder();
            message.success('Order placed successfully via cash!');
        } catch (error: any) {
            console.error('Checkout error:', error);
            message.error(`Failed to place order: ${error.response?.data?.detail || error.message}`);
        }
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://www.paypal.com/sdk/js?client-id=Ae_OtnoT2KLzHjO-ecS1WR2OpLtxcNLcUIPiStI8Spx1WQO1r_QvhCwQPx-flPFSmkmvZr9Otw4YXU5d&currency=USD";
        script.async = true;
        script.onload = () => {
            // Render PayPal button when the script is loaded
            if (window.paypal) {
                window.paypal.Buttons({
                    createOrder: (data, actions) => {
                        return actions.order.create({
                            purchase_units: [{
                                amount: {
                                    value: cart.totalPrice.toString(), // Ensure value is a string
                                },
                            }],
                        });
                    },
                    
                    onApprove: async (data, actions) => {
                        try {
                            const order = await actions.order.capture();
                            const createdOrder = await createOrder();
                            // Check if the order was created successfully
                            if (createdOrder) {
                                
                                console.log('Created Order:', createdOrder);

                                const method = data.paymentSource == "paypal" ? "paypal" : "visa";

                                const payedOrder = await payOrder(createdOrder.id, method);
                                message.success(`Order placed successfully via ${method}`);
                            } else {
                                message.error('Failed to create order in our system.');
                            }
                        } catch (error) {
                            console.error('Payment or order creation error:', error);
                            message.error(`Failed to place order: ${error.response?.data?.detail || error.message}`);
                        }
                    },
                }).render('#paypal-button-container');
            }
        };
        document.body.appendChild(script);
    }, [cart.totalPrice, cart.items]);


  return (
        <div className="min-h-screen flex flex-col">
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: '#ffbbbb',
                    },
                }}
            >
                <div className="flex-grow">
                    <Title title='Cart Page' margin='1.5rem 0 0 2.5rem' />

                    {cart && cart.items.length > 0 ? (
                        <div className={classes.container}>
                            <ul className={classes.list}>
                                {cart.items.map((item: any) => (
                                    <li key={item.food.id}>
                                        <div className="w-24 h-24 overflow-hidden rounded-lg border border-gray-200">
                                            {item.food.imageUrl ? (
                                                <img
                                                    src={getImagePath(item.food.imageUrl)}
                                                    alt={item.food.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = '/placeholder-food.png'; // Fallback image
                                                        target.onerror = null; // Prevent infinite loop
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                    <span className="text-gray-400">No image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <Link to={`/food/${item.food.id}`} className="text-lg font-medium hover:text-[#ff6b6b]">
                                                {item.food.name}
                                            </Link>
                                        </div>
                                        <div>
                                            <InputNumber
                                                min={1}
                                                max={10}
                                                value={item.quantity}
                                                onChange={(value) => changeQuantity(item, Number(value))}
                                                className={classes.quantity_input}
                                            />
                                        </div>
                                        <div>
                                            <Price price={item.price} />
                                        </div>
                                        <div>
                                            <button
                                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                onClick={() => removeFromCart(item.food.id)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className={classes.checkout}>
                                <div>
                                    <div className={classes.food_count}>Items: {cart.totalCount}</div>
                                    <div className={classes.total_price}>
                                        <Price price={cart.totalPrice} />
                                    </div>
                                </div>
                                <button onClick={handleCheckout} className={classes.checkout_button}>
                                    Proceed To Checkout
                                </button>
                                <div id="paypal-button-container"></div>
                            </div>
                        </div>
                    ) : (
                        <div className={classes.empty_cart}>
                            <p>Your cart is empty.</p>
                            <Link to="/" className={classes.continue_shopping}>
                                Continue Shopping
                            </Link>
                        </div>
                    )}
                </div>
            </ConfigProvider>
        </div>
    );
};

// // paypal.d.ts
// declare global {
//     interface Window {
//         paypal: any; // You can use a more specific type if you have one
//     }
// }
// export {};
