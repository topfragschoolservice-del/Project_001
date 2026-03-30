import api from './api.js';

const updateParentChildren = async (children) => {
  const response = await api.patch('/users/update-children', { children });
  return response.data;
};

const updateDriverInfo = async (driverData) => {
  const response = await api.patch('/users/update-driver-profile', driverData);
  return response.data;
};

export default {
  updateParentChildren,
  updateDriverInfo,
};