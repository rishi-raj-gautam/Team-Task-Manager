import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('task_user');
    const savedToken = localStorage.getItem('task_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    const userData = await api.login(email, password);
    const userObj = {
      id: userData._id || userData.id,
      _id: userData._id || userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    };
    setUser(userObj);
    localStorage.setItem('task_user', JSON.stringify(userObj));
  };

  const signup = async (name, email, password) => {
    const userData = await api.signup(name, email, password);
    const userObj = {
      id: userData._id || userData.id,
      _id: userData._id || userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    };
    setUser(userObj);
    localStorage.setItem('task_user', JSON.stringify(userObj));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('task_user');
    localStorage.removeItem('task_token');
  };

  if (isLoading) return null;

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
