import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { signOutUser } from "../../services/authHelpers";
import { useCart } from "../../hooks/useCart";
import "../../styles/Navbar.css";

/**
 * Navbar Component
 * 
 * Main navigation bar with:
 * - Logo and navigation links
 * - Search functionality
 * - Cart count badge
 * - User authentication display
 * - Mobile menu
 */
const Navbar = () => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { user, isAuthenticated, loading } = useAuth();
    const { getItemCount } = useCart();
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();

    // Update cart count from localStorage when cart is updated
    useEffect(() => {
        const updateCartCount = () => {
            const newCount = getItemCount();
            setCartCount(newCount);
        };

        updateCartCount();
        window.addEventListener("cartUpdated", updateCartCount);

        return () => window.removeEventListener("cartUpdated", updateCartCount);
    }, [getItemCount]);

    /**
     * Handle user logout
     */
    const handleLogout = async () => {
        try {
            await signOutUser();
            localStorage.removeItem("flowerboom_cart");
            window.dispatchEvent(new Event("cartUpdated"));
            navigate("/signin");
            setOpen(false);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    /**
     * Handle search submission
     */
    const handleSearch = (e) => {
        e.preventDefault();
        const trimmed = searchTerm.trim();

        navigate(trimmed ? `/gallery?search=${encodeURIComponent(trimmed)}` : "/gallery");
        setOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/home" className="navbar-logo">
                    <span className="flower">Flower</span>
                    <span className="shop">Boom</span>
                </Link>

                <div className="nav-center">
                    <NavLink to="/home" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
                    <NavLink to="/gallery" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Gallery</NavLink>

                    <NavLink to="/cart" className={({ isActive }) => isActive ? "nav-link cart-link active" : "nav-link cart-link"}>
                        Cart
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </NavLink>
                </div>

                <div className="nav-right">
                    <form className="search-box" onSubmit={handleSearch}>
                        <input
                            className="search-input"
                            placeholder="Search flowers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-btn" type="submit">Search</button>
                    </form>
                    <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>About</NavLink>
                    {!loading && isAuthenticated && user && (
                        <>
                            <NavLink to="/orders" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Orders</NavLink>
                            <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link profile-link active" : "nav-link profile-link"}>Profile</NavLink>
                            <button className="logout-btn" onClick={handleLogout}>Logout</button>
                        </>
                    )}

                    {!loading && !isAuthenticated && (
                        <>
                            <NavLink to="/signin" className={({ isActive }) => isActive ? "nav-link auth-link active" : "nav-link auth-link"}>Account</NavLink>
                        </>
                    )}

                    <button
                        className="menu-btn"
                        onClick={() => setOpen(!open)}
                        aria-label="Toggle menu"
                    >
                        {open ? "✕" : "☰"}
                    </button>
                </div>

                <div className={`mobile-menu ${open ? "open" : ""}`}>
                    <NavLink to="/home" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setOpen(false)}>Home</NavLink>
                    <NavLink to="/gallery" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setOpen(false)}>Gallery</NavLink>
                    <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setOpen(false)}>About</NavLink>
                    <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setOpen(false)}>Contact</NavLink>

                    <NavLink to="/cart" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setOpen(false)}>Cart</NavLink>

                    {!loading && isAuthenticated && user && (
                        <>
                            <NavLink to="/orders" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={() => setOpen(false)}>Orders</NavLink>
                            <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link profile-link active" : "nav-link profile-link"} onClick={() => setOpen(false)}>Profile</NavLink>
                            <button className="logout-btn mobile-logout" onClick={handleLogout}>Logout</button>
                        </>
                    )}

                    {!loading && !isAuthenticated && (
                        <>
                            <NavLink to="/signin" className={({ isActive }) => isActive ? "nav-link auth-link active" : "nav-link auth-link"} onClick={() => setOpen(false)}>Account</NavLink>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
