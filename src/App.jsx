import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./Components/layout/Navbar";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import ProtectedRoute from "./Components/common/ProtectedRoute";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";

/**
 * Main App Component
 * 
 * Sets up routing and wraps the app with AuthProvider for global auth state management
 */

const App = () => {
  return (
    <BrowserRouter basename="/Flowerboom">
      <AuthProvider>
        <Navbar />

        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/gallery"
            element={
              // <ProtectedRoute>
              <Gallery />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <Cart />
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;