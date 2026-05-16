import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInUser } from "../services/authHelpers";
import "../styles/SignIn.css";

const SignIn = () => {
    const navigate = useNavigate();

    const [formdata, setFormdata] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormdata({
            ...formdata,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            // Sign in user with Supabase
            const result = await signInUser(formdata.email, formdata.password);

            setMessage(result.message || "Login successful!");

            // Redirect after short delay
            setTimeout(() => {
                navigate("/gallery");
            }, 800);
        } catch (error) {
            console.error("Sign in error:", error);
            setError(error.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signin-container">
            <h2>Sign In</h2>

            <form onSubmit={handleSubmit}>
                {message && <div className="auth-success">{message}</div>}
                {error && <div className="auth-error">{error}</div>}

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formdata.email}
                    onChange={handleChange}
                    disabled={loading}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formdata.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Signing In..." : "Login"}
                </button>

                <p className="auth-switch">
                    Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
                </p>
            </form>
        </div>
    );
};

export default SignIn;
