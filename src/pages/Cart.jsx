import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder } from "../services/databaseHelpers";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../hooks/useCart";
import "../styles/Cart.css";

/**
 * Cart Component
 * 
 * Displays shopping cart with:
 * - List of items with quantities
 * - Item removal functionality
 * - Order placement with Supabase integration
 * - Total price calculation
 */

const Cart = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [placingOrder, setPlacingOrder] = useState(false);

    const totalAmount = getTotal();

    /**
     * Handle quantity increase
     */
    const handleQuantityChange = (id, type) => {
        const item = cartItems.find(item => item.id === id);
        if (!item) return;

        const newQuantity = type === "increase" ? item.quantity + 1 : Math.max(1, item.quantity - 1);
        updateQuantity(id, newQuantity);
    };

    /**
     * Place order in Supabase
     */
    const handlePlaceOrder = async () => {
        setMessage("");
        setError("");

        // Validate user is logged in
        if (!user) {
            setError("You must be logged in to place an order");
            return;
        }

        // Validate cart is not empty
        if (cartItems.length === 0) {
            setError("Your cart is empty");
            return;
        }

        try {
            setPlacingOrder(true);

            // Create order in Supabase
            const newOrder = await createOrder(
                user.id,
                cartItems,
                totalAmount,
                {
                    email: user.email,
                    orderDate: new Date().toISOString()
                }
            );

            setMessage(`Order placed successfully! Order ID: ${newOrder.id}`);

            // Clear cart after successful order
            clearCart();

            // Redirect to orders page after delay
            setTimeout(() => {
                navigate("/orders");
            }, 2000);
        } catch (err) {
            console.error("Order placement error:", err);
            setError(err.message || "Failed to place order. Please try again.");
        } finally {
            setPlacingOrder(false);
        }
    };

    return (
        <div className="cart-page">
            <h2 className="cart-title">Your Cart</h2>

            {message && <div className="cart-message success">{message}</div>}
            {error && <div className="cart-message error">{error}</div>}

            {cartItems.length === 0 ? (
                <p className="cart-empty">Your cart is empty. <Link to="/gallery">Continue shopping</Link></p>
            ) : (
                <>
                    <div className="cart-list">
                        {cartItems.map((item) => (
                            <div className="cart-card" key={item.id}>
                                <img src={item.image} alt={item.name} className="cart-img" />

                                <div className="cart-info">
                                    <h3>{item.name}</h3>
                                    <p>{item.description}</p>
                                    <p className="cart-price">₹{item.price}</p>

                                    <div className="cart-actions">
                                        <button
                                            onClick={() => handleQuantityChange(item.id, "decrease")}
                                            disabled={placingOrder}
                                        >
                                            -
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item.id, "increase")}
                                            disabled={placingOrder}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button
                                    className="remove-btn"
                                    onClick={() => removeFromCart(item.id)}
                                    disabled={placingOrder}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h3>Total: ₹{totalAmount.toFixed(2)}</h3>
                        <button
                            className="checkout-btn"
                            onClick={handlePlaceOrder}
                            disabled={placingOrder || cartItems.length === 0}
                        >
                            {placingOrder ? "Placing Order..." : "Place Order"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;
