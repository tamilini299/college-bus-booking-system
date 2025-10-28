import axios from 'axios';

const baseURL = 'BACKEND_URL_PLACEHOLDER';

console.log('API Base URL:', baseURL);

export const api = axios.create({ 
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  console.log('Making API request to:', config.url);
  const raw = localStorage.getItem('cbbs_user');
  if (raw) {
    const user = JSON.parse(raw);
    config.headers['x-user-id'] = user.id;
    config.headers['x-user-role'] = user.role;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('API response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);
