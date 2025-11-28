import React, { createContext, useContext, useState, useEffect } from 'react';

// TODO: Replace this mock auth with real provider (Clerk/Firebase/Auth0)
// This is a simple localStorage-based auth for UI development only

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Mock login function
  const login = async (email, password) => {
    // TODO: Replace with real auth provider call
    // For now, accept any email/password and create mock user
    
    const mockUser = {
      id: 'user_' + Date.now(),
      email: email,
      name: email.split('@')[0],
      role: 'customer', // customer | employee | admin
      plan: 'Pro',
      createdAt: new Date().toISOString()
    };

    const mockToken = 'mock_token_' + Date.now();
    
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('user_data', JSON.stringify(mockUser));
    setUser(mockUser);
    
    return { success: true, user: mockUser };
  };

  // Mock signup function
  const signup = async (email, password, name) => {
    // TODO: Replace with real auth provider call
    
    const mockUser = {
      id: 'user_' + Date.now(),
      email: email,
      name: name || email.split('@')[0],
      role: 'customer',
      plan: null, // No plan until they subscribe
      createdAt: new Date().toISOString()
    };

    const mockToken = 'mock_token_' + Date.now();
    
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('user_data', JSON.stringify(mockUser));
    setUser(mockUser);
    
    return { success: true, user: mockUser };
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
