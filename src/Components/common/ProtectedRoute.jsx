import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * ProtectedRoute Component
 * 
 * Restricts access to authenticated users only.
 * Redirects unauthenticated users to sign in page.
 * 
 * Usage:
 * <ProtectedRoute>
 *   <SomeProtectedComponent />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const storedUser = localStorage.getItem("flowerboom_user");

    // Show loading while checking authentication
    if (loading) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh"
            }}>
                <p>Loading...</p>
            </div>
        );
    }

    // Redirect to sign in if not authenticated
    if ((!isAuthenticated || !user) && !storedUser) {
        return <Navigate to="/signin" replace />;
    }

    // Render protected component if authenticated
    return children;
};

export default ProtectedRoute;
