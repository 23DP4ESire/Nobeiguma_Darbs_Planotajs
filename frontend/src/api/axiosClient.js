import axios from 'axios'

// Use relative path - Vite proxy will forward /api/* to http://localhost:8000/api/*
const API_BASE_URL = '/api'

console.log('API Base URL:', API_BASE_URL)

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Add request interceptor for debugging and token auth
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }

    console.log('API Request:', config.method.toUpperCase(), config.url)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for handling errors
axiosClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.message)
    return Promise.reject(error)
  }
)

export default axiosClient
