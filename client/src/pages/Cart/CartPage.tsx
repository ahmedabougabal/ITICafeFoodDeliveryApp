import React, { useEffect } from 'react';
import { ConfigProvider, message } from 'antd';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { Title } from '../../components/Title/Title';
import Price from '../../components/Price/Price';
import QuantityControl from "./QuantityControl";
import EmptyCart from "./EmptyCart";

export const CartPage = () => {
    const { cart, createOrder, changeQuantity, removeFromCart, payOrder } = useCart();

    const getImagePath = (imageUrl) => {
        if (!imageUrl) return '/placeholder-food.png';
        if (imageUrl.startsWith('http')) return imageUrl;
        return `${process.env.REACT_APP_API_URL || ''}/media/${imageUrl}`;
    };

    const handleCheckout = async () => {
        try {
            await createOrder();
            message.success('Order placed successfully via cash!');
        } catch (error) {
            message.error(`Failed to place order: ${error.response?.data?.detail || error.message}`);
        }
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://www.paypal.com/sdk/js?client-id=Ae_OtnoT2KLzHjO-ecS1WR2OpLtxcNLcUIPiStI8Spx1WQO1r_QvhCwQPx-flPFSmkmvZr9Otw4YXU5d&currency=USD";
        script.async = true;
        script.onload = () => {
            if (window.paypal) {
                window.paypal.Buttons({
                    createOrder: (data, actions) => {
                        return actions.order.create({
                            purchase_units: [{
                                amount: {
                                    value: cart.totalPrice.toString(),
                                },
                            }],
                        });
                    },
                    onApprove: async (data, actions) => {
                        try {
                            const order = await actions.order.capture();
                            const createdOrder = await createOrder();
                            if (createdOrder) {
                                const method = data.paymentSource === "paypal" ? "paypal" : "visa";
                                await payOrder(createdOrder.id, method);
                                message.success(`Order placed successfully via ${method}`);
                            } else {
                                message.error('Failed to create order in our system.');
                            }
                        } catch (error) {
                            message.error(`Failed to place order: ${error.response?.data?.detail || error.message}`);
                        }
                    },
                }).render('#paypal-button-container');
            }
        };
        document.body.appendChild(script);
    }, [cart.totalPrice, cart.items]);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <ConfigProvider theme={{ token: { colorPrimary: '#ffbbbb' } }}>
                <div className="flex-grow">
                    <Title title="Cart Page" margin="1.5rem 0 0 2.5rem" />

                    {cart && cart.items.length > 0 ? (
                        <div className="flex flex-col md:flex-row gap-4 p-6">
                            {/* Cart Items List */}
                            <div className="w-full md:w-3/4">
                                <div className="border border-pink-200 rounded-lg overflow-hidden">
                                    {cart.items.map((item) => (
                                        <div key={item.food.id}
                                             className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center p-4 border-b border-pink-100 last:border-b-0">
                                            <div className="w-24 h-24 mx-auto sm:mx-0">
                                                <img
                                                    src={getImagePath(item.food.image)}
                                                    alt={item.food.name}
                                                    className="w-full h-full object-cover rounded-full"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-food.png';
                                                        e.target.onerror = null;
                                                    }}
                                                />
                                            </div>

                                            <div className="text-center sm:text-left">
                                                <Link to={`/food/${item.food.id}`}
                                                      className="text-lg font-medium hover:text-pink-600">
                                                    {item.food.name}
                                                </Link>
                                            </div>

                                            <div className="flex justify-center">
                                                <QuantityControl
                                                    min={1}
                                                    max={item.food.stock}
                                                    value={item.quantity}
                                                    onChange={(value) => changeQuantity(item, value)}
                                                />
                                            </div>

                                            <div className="text-center">
                                                <Price price={item.price} />
                                            </div>

                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => removeFromCart(item.food.id)}
                                                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Checkout Section */}
                            <div className="w-full md:w-1/4">
                                <div className="border border-pink-200 rounded-lg p-4 space-y-4">
                                    <div className="text-xl font-medium">
                                        <div className="flex justify-between items-center">
                                            <span>Items:</span>
                                            <span>{cart.totalCount}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span>Price:</span>
                                            <Price price={cart.totalPrice} />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Proceed To Checkout
                                    </button>

                                    <div id="paypal-button-container" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-grow flex items-center justify-center py-8">
                            <EmptyCart />
                        </div>
                    )}
                </div>
            </ConfigProvider>
        </div>
    );
};

export default CartPage;