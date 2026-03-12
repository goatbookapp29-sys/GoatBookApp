import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// For Production: Replace with your Render URL
// For Development: Use your PC's IP address
const BASE_URL = 'https://goatbook-bankend.onrender.com/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const setAuthToken = async (token) => {
  if (token) {
    await SecureStore.setItemAsync('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    await SecureStore.deleteItemAsync('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const setSelectedFarm = async (farmId) => {
  if (farmId) {
    await SecureStore.setItemAsync('selectedFarmId', farmId);
    api.defaults.headers.common['X-Farm-ID'] = farmId;
  } else {
    await SecureStore.deleteItemAsync('selectedFarmId');
    delete api.defaults.headers.common['X-Farm-ID'];
  }
};

// Interceptor to load token and farmId on startup
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  const farmId = await SecureStore.getItemAsync('selectedFarmId');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (farmId) config.headers['X-Farm-ID'] = farmId;
  return config;
});

export default api;
