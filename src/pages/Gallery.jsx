import React, { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchFlowers, searchFlowers } from "../services/databaseHelpers";
import { useCart } from "../hooks/useCart";
import "../styles/Gallery.css";

/**
 * Carousel Component
 * Displays a featured carousel of flowers with navigation
 */
const Carousel = ({ flowers, onAddToCart }) => {
    const [index, setIndex] = useState(0);
    const total = flowers.length;

    useEffect(() => {
        setIndex(0);
    }, [flowers]);

    const next = useCallback(() => {
        setIndex((prev) => (prev + 1) % total);
    }, [total]);

    const prev = useCallback(() => {
        setIndex((prev) => (prev - 1 + total) % total);
    }, [total]);

    if (total === 0) return null;

    return (
        <div className="new-carousel">
            <button className="new-btn prev" onClick={prev}>‹</button>

            <div className="carousel-center">
                <div className="carousel-image-wrapper">
                    <img
                        src={flowers[index].image}
                        alt={flowers[index].name}
                        className="carousel-fixed-image"
                    />

                    <div className="carousel-overlay"></div>

                    <div className="carousel-content">
                        <span className="carousel-badge">
                            {flowers[index].category || "Featured Bloom"}
                        </span>

                        <h3 className="flower-title">{flowers[index].name}</h3>
                        <p className="flower-desc">{flowers[index].description}</p>

                        <div className="carousel-price-row">
                            <p className="flower-price">₹{flowers[index].price}</p>
                            <button
                                className="add-cart-btn"
                                onClick={() => onAddToCart(flowers[index])}
                            >
                                Add to Cart
                            </button>
                        </div>

                        <div className="carousel-footer">
                            <div className="carousel-dots">
                                {flowers.map((_, i) => (
                                    <span
                                        key={i}
                                        className={`dot ${i === index ? "active" : ""}`}
                                        onClick={() => setIndex(i)}
                                    ></span>
                                ))}
                            </div>

                            <div className="carousel-count">
                                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button className="new-btn next" onClick={next}>›</button>
        </div>
    );
};

/**
 * FlowerGrid Component
 * Displays flowers in a grid layout
 */
const FlowerGrid = ({ flowers, onAddToCart }) => {
    return (
        <div className="new-grid">
            {flowers.map((flower) => (
                <div key={flower.id} className="new-grid-card">
                    <div className="new-grid-img-wrap">
                        <img src={flower.image} alt={flower.name} className="new-grid-img" />
                        <span className="grid-tag">{flower.category || "Bloom"}</span>
                    </div>

                    <div className="new-grid-info">
                        <h4>{flower.name}</h4>
                        <p>{flower.description}</p>
                        <p><strong>₹{flower.price}</strong></p>
                        <button
                            className="add-cart-btn grid-cart-btn"
                            onClick={() => onAddToCart(flower)}
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Gallery Component
 * Main gallery page that fetches and displays flowers from Supabase
 */
const Gallery = () => {
    const [flowers, setFlowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchParams] = useSearchParams();
    const { addToCart } = useCart();

    const searchTerm = searchParams.get("search")?.toLowerCase().trim() || "";

    // Fetch flowers from Supabase on component mount
    useEffect(() => {
        const loadFlowers = async () => {
            try {
                setLoading(true);
                setError("");

                // If there's a search term, use search function
                if (searchTerm) {
                    const results = await searchFlowers(searchTerm);
                    setFlowers(results);
                } else {
                    // Otherwise, fetch all flowers
                    const allFlowers = await fetchFlowers();
                    setFlowers(allFlowers);
                }
            } catch (err) {
                console.error("Error loading flowers:", err);
                setError("Failed to load flowers. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadFlowers();
    }, [searchTerm]);

    /**
     * Handle adding flower to cart
     */
    const handleAddToCart = (flower) => {
        addToCart(flower);
        alert(`${flower.name} added to cart`);
    };

    // Filter flowers based on search term
    const filteredFlowers = flowers.filter((flower) => {
        const name = flower.name?.toLowerCase() || "";
        const description = flower.description?.toLowerCase() || "";
        const category = flower.category?.toLowerCase() || "";

        return (
            name.includes(searchTerm) ||
            description.includes(searchTerm) ||
            category.includes(searchTerm)
        );
    });

    return (
        <section className="new-gallery-section">
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <h2 className="gallery-title">Featured Blooms</h2>
            <p className="gallery-subtitle">
                Discover elegant floral beauty through a soft, modern gallery experience.
            </p>

            {searchTerm && !loading && (
                <p className="gallery-subtitle">
                    Showing results for: <strong>{searchTerm}</strong>
                </p>
            )}

            {loading && <p className="gallery-subtitle">Loading flowers...</p>}
            {error && <p className="gallery-subtitle" style={{ color: "#d32f2f" }}>{error}</p>}

            {!loading && !error && filteredFlowers.length > 0 && (
                <>
                    <Carousel flowers={filteredFlowers} onAddToCart={handleAddToCart} />

                    <h2 className="gallery-title mt">Flower Collection</h2>
                    <p className="gallery-subtitle">
                        Explore our curated garden of timeless blossoms.
                    </p>

                    <FlowerGrid flowers={filteredFlowers} onAddToCart={handleAddToCart} />
                </>
            )}

            {!loading && !error && filteredFlowers.length === 0 && (
                <p className="gallery-subtitle">
                    No flowers found for <strong>{searchTerm}</strong>.
                </p>
            )}
        </section>
    );
};

export default Gallery;
