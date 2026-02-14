import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { setLogoutCallback } from '../api/client';

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

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
