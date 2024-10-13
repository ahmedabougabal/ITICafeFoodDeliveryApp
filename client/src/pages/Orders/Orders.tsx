import React, { useEffect, useState, useCallback } from 'react';
import { orderService } from "../../services/orderService";  // Import your order service
import classes from './orders.module.css'

interface OrderItem {
    id: number;
    name: string;
}

interface Order {
    id: number;
    branch_name: string;
    status: string;
    total_price: number;
    items: {
        id: number;
        item: OrderItem;
        quantity: number;
    }[];
}

// Memoized Order Item Component to prevent unnecessary re-renders
const OrderItemComponent = React.memo(({ order }: { order: Order }) => (
    <div key={order.id}>
        <div className={classes.orderDetails}>
        <h3>Order ID: {order.id}</h3>
        <p>Branch: {order.branch_name}</p>
        <p>Status: {order.status}</p>
        <p>Total Price: {order.total_price}</p>
        <p>Items:</p>
        
        </div>
        <ul className={classes.list}>
            {order.items.map(item => (
                <li key={item.id}>
                    {item.item.name} (Quantity: {item.quantity})
                </li>
            ))}
        </ul>
    </div>
));

export default function Orders() {
    const ORDER_KEY = 'orders';
    const [orders, setOrders] = useState<Order[]>([]);  // State for storing orders
    const [loading, setLoading] = useState(true);  // Loading state

    // Fetch orders from local storage and API on component mount
    useEffect(() => {
        const ordersStore = localStorage.getItem(ORDER_KEY);
        initOrders(ordersStore);
    }, []);  // Run once on mount

    // Update localStorage whenever the orders state changes
    useEffect(() => {
        localStorage.setItem(ORDER_KEY, JSON.stringify(orders));  // Update localStorage
    }, [orders]);  // Run when orders state changes

    // Function to fetch active orders from the service
    const initOrders = useCallback(async (ordersStore: string | null) => {
        try {
            setLoading(true);  // Start loading
            console.log('Fetching active orders from the API...');

            const apiResult = await orderService.getActiveOrders();  // Fetch orders from your service

            // Check if ordersStore is not null
            const storedOrders = ordersStore ? JSON.parse(ordersStore) : [];

            // Compare lengths of the API result and the stored orders
            if (Array.isArray(storedOrders) && storedOrders.length === apiResult.length) {
                console.log('Loading orders from localStorage:', ordersStore);
                setOrders(storedOrders);  // Load from localStorage if available
            } else {
                console.log('Using API data...');
                setOrders(apiResult);  // Use data from API if lengths do not match
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);  // Stop loading
        }
    }, []);  // Empty dependency array to prevent re-creation of the function

    return (
        <div className={classes.list}>
            {loading ? (
                <div>Loading...</div>
            ) : orders.length > 0 ? (
                orders.map(order => <OrderItemComponent key={order.id} order={order}  />)
            ) : (
                <div>No orders available</div>
            )}
        </div>
    );
}
