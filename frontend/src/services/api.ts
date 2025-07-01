import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

// Intercetor para adicionar o token JWT em cada requisição
api.interceptors.request.use(
  (config) => {
    // Verificamos se estamos no ambiente do navegador para aceder ao localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('fintech.token');
      if (token) {
        // Adicionamos o header de autorização
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // É crucial retornar sempre o objeto 'config'
    return config;
  },
  (error) => {
    // Tratamento de erros da requisição
    return Promise.reject(error);
  }
);

export default api;