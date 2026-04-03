import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { setLogoutCallback } from '../api/client';
import { ROLE_ACCESS } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setUser(null);
    setToken(null);
  }, []);

  useEffect(() => {
    setLogoutCallback(logout);
    (async () => {
      try {
        const [storedToken, storedUser] = await AsyncStorage.multiGet(['token', 'user']);
        if (storedToken[1] && storedUser[1]) {
          setToken(storedToken[1]);
          setUser(JSON.parse(storedUser[1]));
        }
      } catch (e) {
        // clear corrupt data
        await AsyncStorage.multiRemove(['token', 'user']);
      } finally {
        setLoading(false);
      }
    })();
  }, [logout]);

  const login = async (username, password) => {
    const { data } = await apiClient.post('/auth/login', { username, password });
    const { token: newToken, user: newUser } = data;
    await AsyncStorage.setItem('token', newToken);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  // Check if current user's role has access to a module
  const hasPermission = useCallback((module) => {
    if (!user) return false;
    const isSuperAdmin = user.role === 'Super Admin';
    if (isSuperAdmin) return true;
    const allowed = ROLE_ACCESS[user.role] || [];
    return allowed.includes(module);
  }, [user]);

  // Check if user can perform write (create/update/delete) actions
  const canWrite = useCallback((module) => {
    if (!user) return false;
    const readOnlyRoles = ['Viewer'];
    if (readOnlyRoles.includes(user.role)) return false;
    return hasPermission(module);
  }, [user, hasPermission]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser, hasPermission, canWrite }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
