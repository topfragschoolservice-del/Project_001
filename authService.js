import api from './api.js';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  if (response.data.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
  }
  return response.data.data.user;
};

const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
  }
  return response.data.data.user;
};

const logout = async () => {
  try {
    await api.get('/auth/logout');
  } finally {
    // Always clear local storage even if the network request fails
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgotPassword', { email });
  return response.data;
};

const resetPassword = async (token, password) => {
  const response = await api.patch(`/auth/resetPassword/${token}`, { password });
  return response.data;
};

const getCurrentUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

const updateTokens = (token, refreshToken) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export default {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  getAccessToken,
  getRefreshToken,
  updateTokens
};