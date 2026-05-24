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
    const { cartItems, loading, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [placingOrder, setPlacingOrder] = useState(false);

    const totalAmount = getTotal();
    const totalItems = cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
    const currencyFormatter = new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const formatPrice = (value) => `₹${currencyFormatter.format(value)}`;

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
            <div className="cart-hero">
                <div className="cart-hero-copy">
                    <span className="cart-badge">Shopping bag</span>
                    <h2 className="cart-title">Your Cart</h2>
                    <p className="cart-subtitle">
                        Review your flowers, adjust quantities, and place the order when everything looks right.
                    </p>
                </div>

                <div className="cart-hero-card">
                    <div>
                        <span className="cart-hero-label">Items</span>
                        <strong>{totalItems}</strong>
                    </div>
                    <div>
                        <span className="cart-hero-label">Subtotal</span>
                        <strong>{formatPrice(totalAmount)}</strong>
                    </div>
                    <div>
                        <span className="cart-hero-label">Delivery</span>
                        <strong>Free</strong>
                    </div>
                </div>
            </div>

            {message && <div className="cart-message success">{message}</div>}
            {error && <div className="cart-message error">{error}</div>}

            {loading ? (
                <div className="cart-loading-card">Loading your cart...</div>
            ) : cartItems.length === 0 ? (
                <div className="cart-empty-state">
                    <Link to="/gallery" className="cart-empty-icon" aria-label="Go to gallery">
                        +
                    </Link>
                    <h3>Your cart is empty</h3>
                    <p>
                        Browse the gallery to pick a bouquet, then come back here to review your order.
                    </p>
                    <Link to="/gallery" className="cart-empty-cta">
                        Continue shopping
                    </Link>
                </div>
            ) : (
                <div className="cart-layout">
                    <div className="cart-list">
                        {cartItems.map((item) => {
                            const itemTotal = item.price * (item.quantity || 1);

                            return (
                                <div className="cart-card" key={item.id}>
                                    <img src={item.image} alt={item.name} className="cart-img" />

                                    <div className="cart-info">
                                        <div className="cart-info-head">
                                            <div>
                                                <h3>{item.name}</h3>
                                                <p>{item.description}</p>
                                            </div>

                                            <div className="cart-price-block">
                                                <span className="cart-price-label">Price</span>
                                                <span className="cart-price">{formatPrice(item.price)}</span>
                                            </div>
                                        </div>

                                        <div className="cart-meta-row">
                                            <span className="cart-pill">Qty {item.quantity}</span>
                                            <span className="cart-line-total">Line total {formatPrice(itemTotal)}</span>
                                        </div>

                                        <div className="cart-actions">
                                            <div className="quantity-control" aria-label={`Quantity controls for ${item.name}`}>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, "decrease")}
                                                    disabled={placingOrder}
                                                    aria-label={`Decrease quantity of ${item.name}`}
                                                >
                                                    -
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, "increase")}
                                                    disabled={placingOrder}
                                                    aria-label={`Increase quantity of ${item.name}`}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                className="remove-btn"
                                                onClick={() => removeFromCart(item.id)}
                                                disabled={placingOrder}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="cart-summary">
                        <h3>Order summary</h3>

                        <div className="cart-summary-row">
                            <span>Subtotal</span>
                            <strong>{formatPrice(totalAmount)}</strong>
                        </div>

                        <div className="cart-summary-row">
                            <span>Delivery</span>
                            <strong>Free</strong>
                        </div>

                        <div className="cart-summary-row total-row">
                            <span>Total</span>
                            <strong>{formatPrice(totalAmount)}</strong>
                        </div>

                        <p className="cart-summary-note">
                            Secure checkout with your saved account details. You will be redirected to your orders page after placing it.
                        </p>

                        <button
                            className="checkout-btn"
                            onClick={handlePlaceOrder}
                            disabled={placingOrder || cartItems.length === 0}
                        >
                            {placingOrder ? "Placing Order..." : "Place Order"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
