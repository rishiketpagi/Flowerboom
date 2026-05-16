import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchUserOrders } from "../services/databaseHelpers";
import "../styles/Orders.css";

/**
 * Orders Component
 * 
 * Displays user's order history fetched from Supabase
 * Shows:
 * - Order ID and date
 * - Order status
 * - Total amount
 * - Items in each order
 */
const Orders = () => {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch user's orders when component mounts or user changes
    useEffect(() => {
        const loadOrders = async () => {
            // Don't proceed if still loading auth or no user
            if (authLoading || !user) {
                setLoading(false);
                if (!user && !authLoading) {
                    setError("You must be logged in to view orders");
                }
                return;
            }

            try {
                setLoading(true);
                setError("");

                // Fetch orders from Supabase
                const userOrders = await fetchUserOrders(user.id);
                setOrders(userOrders);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Failed to load orders. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [user, authLoading]);

    return (
        <div className="orders-page">
            <h2 className="orders-title">My Orders</h2>

            {loading && <p className="orders-message">Loading orders...</p>}
            {error && <p className="orders-message error">{error}</p>}

            {!loading && !error && orders.length === 0 && (
                <p className="orders-message">You have no orders yet. <Link to="/gallery">Start shopping</Link></p>
            )}

            {!loading && !error && orders.length > 0 && (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div className="order-card" key={order.id}>
                            <div className="order-header">
                                <div>
                                    <h3>Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                                    <p>
                                        {new Date(order.created_at).toLocaleString()}
                                    </p>
                                </div>

                                <div className="order-meta">
                                    <span className={`order-status ${order.status}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                    <h4>₹{Number(order.total_amount).toFixed(2)}</h4>
                                </div>
                            </div>

                            <div className="order-items">
                                {Array.isArray(order.items) && order.items.length > 0 ? (
                                    order.items.map((item, idx) => (
                                        <div className="order-item" key={idx}>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="order-item-img"
                                            />

                                            <div className="order-item-info">
                                                <h4>{item.name}</h4>
                                                <p>{item.category || "Flower"}</p>
                                                <p>Quantity: {item.quantity}</p>
                                                <p>Price: ₹{item.price}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No items in this order</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
