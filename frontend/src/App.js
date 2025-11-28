import React from "react";
import "./App.css";
import "./LandingPage.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Pricing from "./components/Pricing";
import Employee from "./components/Employee";
import Admin from "./components/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentCanceled from "./components/PaymentCanceled";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/canceled" element={<PaymentCanceled />} />
            
            {/* Protected Routes - Customer */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Protected Routes - Employee */}
            <Route
              path="/employee"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <Employee />
                </ProtectedRoute>
              }
            />
            
            {/* Protected Routes - Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Admin />
                </ProtectedRoute>
              }
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
