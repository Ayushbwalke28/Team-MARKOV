import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
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

export const postApi = {
  create: (payload: { text: string; authorType: 'user' | 'company'; media?: string[] }) =>
    api.post('/posts', payload).then(res => res.data),
  uploadMedia: (postId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/posts/${postId}/media`, formData).then(res => res.data);
  },
  getComments: (postId: string) => api.get(`/posts/${postId}/comments`).then(res => res.data),
  addComment: (postId: string, text: string) => api.post(`/posts/${postId}/comments`, { text }).then(res => res.data),
};

export default api;
