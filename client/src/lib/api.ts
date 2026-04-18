import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const connectionApi = {
  getConnections: () => api.get('/connections').then(res => res.data),
  getRequests: () => api.get('/connections/requests').then(res => res.data),
  getSuggestions: () => api.get('/connections/suggestions').then(res => res.data),
  sendRequest: (receiverId: string) => api.post(`/connections/request/${receiverId}`).then(res => res.data),
  acceptRequest: (connectionId: string) => api.patch(`/connections/accept/${connectionId}`).then(res => res.data),
  declineRequest: (connectionId: string) => api.patch(`/connections/decline/${connectionId}`).then(res => res.data),
  removeConnection: (connectionId: string) => api.delete(`/connections/${connectionId}`).then(res => res.data),
};

export default api;
