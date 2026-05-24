import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signInUser, signUpUser } from "../services/authHelpers";
import { upsertProfile } from "../services/databaseHelpers";
import "../styles/Auth.css";

const getModeFromPath = (pathname) => (pathname === "/signup" ? "signup" : "signin");

const AuthPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState(getModeFromPath(location.pathname));
    const [signinForm, setSigninForm] = useState({ email: "", password: "" });
    const [signupForm, setSignupForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [signinError, setSigninError] = useState("");
    const [signinMessage, setSigninMessage] = useState("");
    const [signupError, setSignupError] = useState("");
    const [signupMessage, setSignupMessage] = useState("");
    const [signinLoading, setSigninLoading] = useState(false);
    const [signupLoading, setSignupLoading] = useState(false);
    const [showSigninPassword, setShowSigninPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        setActiveTab(getModeFromPath(location.pathname));
    }, [location.pathname]);

    const switchTab = (mode) => {
        setActiveTab(mode);
        navigate(mode === "signin" ? "/signin" : "/signup");
    };

    const handleSigninChange = (e) => {
        setSigninForm({ ...signinForm, [e.target.name]: e.target.value });
    };

    const handleSignupChange = (e) => {
        setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
    };

    const handleSigninSubmit = async (e) => {
        e.preventDefault();
        setSigninError("");
        setSigninMessage("");
        setSigninLoading(true);

        try {
            const result = await signInUser(signinForm.email, signinForm.password);
            setSigninMessage(result.message || "Login successful!");

            setTimeout(() => {
                navigate("/profile");
            }, 800);
        } catch (error) {
            console.error("Sign in error:", error);
            setSigninError(error.message || "Login failed. Please check your credentials.");
        } finally {
            setSigninLoading(false);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setSignupError("");
        setSignupMessage("");
        setSignupLoading(true);

        try {
            if (signupForm.password !== signupForm.confirmPassword) {
                setSignupError("Passwords do not match");
                setSignupLoading(false);
                return;
            }

            const result = await signUpUser(signupForm.email, signupForm.password, {
                name: signupForm.name,
            });

            await upsertProfile(result.user.id, {
                name: signupForm.name,
                email: signupForm.email,
            });

            setSignupMessage(result.message || "Sign up successful! Please verify your email.");

            setTimeout(() => {
                navigate("/profile");
            }, 1400);
        } catch (error) {
            console.error("Sign up error:", error);
            setSignupError(error.message || "Something went wrong during sign up");
        } finally {
            setSignupLoading(false);
        }
    };

    const isSignin = activeTab === "signin";

    return (
        <div className="auth-page">
            <div className="auth-shell">
                <section className="auth-card auth-card-simple">
                    <div className="auth-tabs" role="tablist" aria-label="Authentication tabs">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={isSignin}
                            className={isSignin ? "auth-tab active" : "auth-tab"}
                            onClick={() => switchTab("signin")}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={!isSignin}
                            className={!isSignin ? "auth-tab active" : "auth-tab"}
                            onClick={() => switchTab("signup")}
                        >
                            Sign Up
                        </button>
                    </div>

                    {isSignin ? (
                        <form onSubmit={handleSigninSubmit} className="auth-form">
                            <div className="auth-heading-block">
                                <h2 className="auth-title">Sign In</h2>
                                <p className="auth-copy">
                                    Use your email and password to continue.
                                </p>
                            </div>

                            {signinMessage && <div className="auth-success">{signinMessage}</div>}
                            {signinError && <div className="auth-error">{signinError}</div>}

                            <label className="auth-label">
                                Email address
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={signinForm.email}
                                    onChange={handleSigninChange}
                                    disabled={signinLoading}
                                    required
                                />
                            </label>

                            <label className="auth-label">
                                Password
                                <div className="auth-password-field">
                                    <input
                                        type={showSigninPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Enter your password"
                                        value={signinForm.password}
                                        onChange={handleSigninChange}
                                        disabled={signinLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="auth-password-toggle"
                                        onClick={() => setShowSigninPassword((value) => !value)}
                                        disabled={signinLoading}
                                    >
                                        {showSigninPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </label>

                            <button type="submit" className="auth-btn" disabled={signinLoading}>
                                {signinLoading ? "Signing In..." : "Sign In"}
                            </button>
                        </form>
                    ) : (
                        <form className="auth-form" onSubmit={handleSignupSubmit}>
                            <div className="auth-heading-block">
                                <h2 className="auth-title">Sign Up</h2>
                                <p className="auth-copy">
                                    Create your account to track orders and save your details.
                                </p>
                            </div>

                            {signupMessage && <div className="auth-success">{signupMessage}</div>}
                            {signupError && <div className="auth-error">{signupError}</div>}

                            <label className="auth-label">
                                Full name
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your full name"
                                    value={signupForm.name}
                                    onChange={handleSignupChange}
                                    disabled={signupLoading}
                                    required
                                />
                            </label>

                            <label className="auth-label">
                                Email address
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={signupForm.email}
                                    onChange={handleSignupChange}
                                    disabled={signupLoading}
                                    required
                                />
                            </label>

                            <label className="auth-label">
                                Password
                                <div className="auth-password-field">
                                    <input
                                        type={showSignupPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Create a password"
                                        value={signupForm.password}
                                        onChange={handleSignupChange}
                                        disabled={signupLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="auth-password-toggle"
                                        onClick={() => setShowSignupPassword((value) => !value)}
                                        disabled={signupLoading}
                                    >
                                        {showSignupPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </label>

                            <label className="auth-label">
                                Confirm password
                                <div className="auth-password-field">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Repeat your password"
                                        value={signupForm.confirmPassword}
                                        onChange={handleSignupChange}
                                        disabled={signupLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="auth-password-toggle"
                                        onClick={() => setShowConfirmPassword((value) => !value)}
                                        disabled={signupLoading}
                                    >
                                        {showConfirmPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </label>

                            <button className="auth-btn" type="submit" disabled={signupLoading}>
                                {signupLoading ? "Creating Account..." : "Create Account"}
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AuthPage;