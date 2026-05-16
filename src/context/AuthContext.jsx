/**
 * Authentication Context
 * 
 * Provides global authentication state management.
 * Allows components to access current user and session information.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChange, getCurrentUser, getSession } from "../services/authHelpers";

// Create auth context
const AuthContext = createContext();

/**
 * Auth Context Provider Component
 * Wrap your app with this provider to enable authentication context
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Check initial localStorage auth state on mount
        const checkSession = async () => {
            try {
                const currentSession = await getSession();
                const currentUser = await getCurrentUser();
                setSession(currentSession);
                setUser(currentUser);
            } catch (err) {
                setError(err.message || "Failed to read auth state.");
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for custom auth events from authHelpers
        const unsubscribe = onAuthStateChange((session, event) => {
            setSession(session);
            setUser(session?.user || null);
            setLoading(false);
            if (event === "SIGNED_OUT") {
                setError("");
            }
        });

        return () => {
            unsubscribe?.();
        };
    }, []);

    const value = {
        user,
        session,
        loading,
        error,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * @returns {Object} - Auth context value
 */
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};

export default AuthContext;
