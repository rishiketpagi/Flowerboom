import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUpUser } from "../services/authHelpers";
import "../styles/SignUp.css";

const SignUp = () => {
    const navigate = useNavigate();

    const [formdata, setFormdata] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormdata({ ...formdata, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            // Validate form
            if (formdata.password !== formdata.confirmPassword) {
                setError("Passwords do not match");
                setLoading(false);
                return;
            }

            // Sign up user with Supabase
            const result = await signUpUser(
                formdata.email,
                formdata.password,
                { name: formdata.name }
            );

            setMessage(result.message || "Sign up successful! Please verify your email.");

            // Redirect after short delay
            setTimeout(() => {
                navigate("/signin");
            }, 1500);
        } catch (error) {
            console.error("Sign up error:", error);
            setError(error.message || "Something went wrong during sign up");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <h2>Create Account</h2>

            <form className="auth-form" onSubmit={handleSubmit}>
                {message && <div className="auth-success">{message}</div>}
                {error && <div className="auth-error">{error}</div>}

                <input
                    className="auth-input"
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formdata.name}
                    onChange={handleChange}
                    disabled={loading}
                    required
                />

                <input
                    className="auth-input"
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formdata.email}
                    onChange={handleChange}
                    disabled={loading}
                    required
                />

                <input
                    className="auth-input"
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formdata.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                />

                <input
                    className="auth-input"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formdata.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    required
                />

                <button className="auth-btn" type="submit" disabled={loading}>
                    {loading ? "Creating Account..." : "Sign Up"}
                </button>

                <p className="auth-switch">
                    Already have an account? <Link to="/signin">Sign In</Link>
                </p>
            </form>
        </div>
    );
};

export default SignUp;
