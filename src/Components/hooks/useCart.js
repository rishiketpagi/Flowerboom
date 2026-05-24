/**
 * Custom Hook: useCart
 * 
 * Manages shopping cart state and operations.
 * Cart is persisted in localStorage.
 */

import { useState, useEffect, useCallback } from "react";

const CART_STORAGE_KEY = "flowerboom_cart";

export const useCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initialize cart from localStorage
    useEffect(() => {
        try {
            const storedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (storedCart) {
                setCartItems(JSON.parse(storedCart));
            }
            setLoading(false);
        } catch (error) {
            console.error("Error loading cart from localStorage:", error);
            setLoading(false);
        }
    }, []);

    // Save cart to localStorage whenever it changes
    const saveCart = useCallback((items) => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
            setCartItems(items);
            // Dispatch custom event for other components to listen
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) {
            console.error("Error saving cart to localStorage:", error);
        }
    }, []);

    /**
     * Add item to cart
     */
    const addToCart = useCallback(
        (item) => {
            const existingItem = cartItems.find((i) => i.id === item.id);

            if (existingItem) {
                // Update quantity if item already in cart
                const updatedCart = cartItems.map((i) =>
                    i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
                );
                saveCart(updatedCart);
            } else {
                // Add new item with quantity 1
                saveCart([...cartItems, { ...item, quantity: 1 }]);
            }
        },
        [cartItems, saveCart]
    );

    /**
     * Remove item from cart
     */
    const removeFromCart = useCallback(
        (itemId) => {
            const updatedCart = cartItems.filter((item) => item.id !== itemId);
            saveCart(updatedCart);
        },
        [cartItems, saveCart]
    );

    /**
     * Update item quantity
     */
    const updateQuantity = useCallback(
        (itemId, quantity) => {
            if (quantity < 1) {
                removeFromCart(itemId);
                return;
            }

            const updatedCart = cartItems.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            );
            saveCart(updatedCart);
        },
        [cartItems, saveCart, removeFromCart]
    );

    /**
     * Clear entire cart
     */
    const clearCart = useCallback(() => {
        saveCart([]);
    }, [saveCart]);

    /**
     * Get cart total
     */
    const getTotal = useCallback(() => {
        return cartItems.reduce(
            (total, item) => total + item.price * (item.quantity || 1),
            0
        );
    }, [cartItems]);

    /**
     * Get cart item count
     */
    const getItemCount = useCallback(() => {
        return cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
    }, [cartItems]);

    return {
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
    };
};
