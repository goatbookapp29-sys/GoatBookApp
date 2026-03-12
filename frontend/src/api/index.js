import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// UPDATE THIS with your PC's IP address for phone testing
// For simulator.html on the same machine, 'localhost' works.
// For physical phone, use: '10.11.136.249'
// For Production: Replace with your Render URL (e.g., https://your-app.onrender.com/api)
// For Development: Use your PC's IP address
const BASE_URL = 'http://10.11.136.249:5000/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout for mobile testing
});

export const setAuthToken = async (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await SecureStore.setItemAsync('userToken', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    await SecureStore.deleteItemAsync('userToken');
  }
};

export default api;
