import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const flowerImages = [
    {
        src: "https://images.pexels.com/photos/931162/pexels-photo-931162.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "Fresh bouquet of pink flowers",
    },
    {
        src: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "Bright bouquet of colorful flowers",
    },
    {
        src: "https://images.pexels.com/photos/1166644/pexels-photo-1166644.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "Elegant white and pink floral arrangement",
    },
    {
        src: "https://images.pexels.com/photos/461530/pexels-photo-461530.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "Fresh yellow and red flowers in bloom",
    },
];

const Home = () => {
    const [activeFlowerIndex, setActiveFlowerIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setActiveFlowerIndex((currentIndex) => (currentIndex + 1) % flowerImages.length);
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="home-container">

            <section className="hero-section">
                <div className="hero-blob blob-1"></div>
                <div className="hero-blob blob-2"></div>

                <div className="home-shell hero-layout">
                    <div className="hero-content">
                        <span className="hero-badge">Fresh Floral Experience</span>
                        <h1>
                            Bloom with <span>FlowerBoom</span>
                        </h1>
                        <p>
                            Fresh blooms delivered with love — explore our exclusive flower
                            collections designed to brighten your every moment with elegance,
                            color, and timeless floral beauty.
                        </p>

                        <div className="hero-buttons">
                            <Link to="/gallery" className="explore-btn">Shop Flowers</Link>
                            <Link to="/about" className="learn-btn">Learn More</Link>
                            <Link to="/cart" className="explore-btn">Go to Cart</Link>
                        </div>

                        <div className="hero-stats">
                            <div className="stat-box">
                                <h3>500+</h3>
                                <span>Happy Clients</span>
                            </div>
                            <div className="stat-box">
                                <h3>120+</h3>
                                <span>Premium Bouquets</span>
                            </div>
                            <div className="stat-box">
                                <h3>24/7</h3>
                                <span>Order Support</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-image-card">
                            <img
                                className="hero-image"
                                src={flowerImages[activeFlowerIndex].src}
                                alt={flowerImages[activeFlowerIndex].alt}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="home-shell">
                <section className="features">
                    <h2>Why Choose <span>FlowerBoom?</span></h2>
                    <p className="section-subtitle">
                        We bring freshness, elegance, and thoughtful floral design to every order.
                    </p>

                    <div className="feature-grid">
                        <div className="feature-card">
                            <div className="icon-wrap">
                                <img src="https://cdn-icons-png.flaticon.com/512/706/706164.png" alt="Fresh" />
                            </div>
                            <h3>Freshly Handpicked</h3>
                            <p>Every bouquet is crafted from hand-selected, farm-fresh flowers.</p>
                        </div>

                        <div className="feature-card">
                            <div className="icon-wrap">
                                <img src="https://cdn-icons-png.flaticon.com/512/3106/3106770.png" alt="Delivery" />
                            </div>
                            <h3>Same-Day Delivery</h3>
                            <p>We deliver your happiness right on time — every time.</p>
                        </div>

                        <div className="feature-card">
                            <div className="icon-wrap">
                                <img src="https://cdn-icons-png.flaticon.com/512/616/616408.png" alt="Custom" />
                            </div>
                            <h3>Customized Bouquets</h3>
                            <p>Choose colors, styles, and wrapping for a beautifully personal gift.</p>
                        </div>
                    </div>
                </section>

                <section className="testimonials">
                    <h2>What Our Customers Say</h2>
                    <p className="section-subtitle">
                        Real moments made more beautiful with FlowerBoom.
                    </p>

                    <div className="testimonial-grid">
                        <div className="testimonial">
                            <div className="quote-mark">“</div>
                            <p>The roses were absolutely stunning — my wife loved them!</p>
                            <span>– Tarak</span>
                        </div>
                        <div className="testimonial">
                            <div className="quote-mark">“</div>
                            <p>Super fast delivery and beautifully wrapped. Totally worth it!</p>
                            <span>– Atmaram B</span>
                        </div>
                        <div className="testimonial">
                            <div className="quote-mark">“</div>
                            <p>FlowerBoom made my mom’s birthday truly special. Thank you!</p>
                            <span>– Ananya P</span>
                        </div>
                    </div>
                </section>
            </div>

            <footer className="footer">
                <p>© 2025 FlowerBoom | Crafted with 💖 for every bloom lover.</p>
            </footer>
        </div>
    );
};

export default Home;
