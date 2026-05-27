import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ================= INIT AUTH =================
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // ================= LOGIN FIXED =================
  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });

      const { access_token, user: userData } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      toast.success('Login successful!');
      return { success: true };

    } catch (error) {
      console.log("LOGIN ERROR RAW:", error.response?.data);

      let message = "Login failed";

      const data = error.response?.data;

      // ✅ Handle FastAPI validation errors (your case)
      if (data?.detail && Array.isArray(data.detail)) {
        message = data.detail.map(err => err.msg).join(", ");
      }
      // normal FastAPI error
      else if (typeof data?.detail === "string") {
        message = data.detail;
      }
      else if (data?.msg) {
        message = data.msg;
      }
      else if (typeof data === "string") {
        message = data;
      }

      toast.error(message);

      return { success: false, error: message };
    }
  };

  // ================= REGISTER =================
  const register = async (userData) => {
    try {
      await authAPI.register(userData);
      toast.success('Registration successful! Please login.');
      return { success: true };

    } catch (error) {
      let message = 'Registration failed';

      const data = error.response?.data;

      if (Array.isArray(data?.detail)) {
        message = data.detail[0]?.msg || message;
      } else if (typeof data?.detail === "string") {
        message = data.detail;
      }

      toast.error(message);
      return { success: false, error: message };
    }
  };

  // ================= LOGOUT =================
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // ignore
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  // ================= UPDATE USER =================
  const updateUser = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      toast.success('Profile updated successfully');
      return { success: true };

    } catch (error) {
      const data = error.response?.data;

      let message =
        data?.detail ||
        data?.msg ||
        'Failed to update profile';

      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;