import api from './api.js';

const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

const logout = async () => {
  const response = await api.get('/auth/logout');
  return response.data;
};

const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgotPassword', { email });
  return response.data;
};

const resetPassword = async (token, password) => {
  const response = await api.patch(`/auth/resetPassword/${token}`, { password });
  return response.data;
};

export default {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword
};