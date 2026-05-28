import axios from 'axios';

const API = axios.create({ 
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api' 
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('reficere_user') || 'null');
  if (user && user.token) {
    config.headers.Authorization = 'Bearer ' + user.token;
  }
  return config;
});

export const registerUser = (data) => API.post('/users/register', data);
export const loginUser = (data) => API.post('/users/login', data);
export const getProfile = () => API.get('/users/profile');

export const getIssues = (params) => API.get('/issues', { params });
export const getIssue = (id) => API.get('/issues/' + id);
export const createIssue = (data) => API.post('/issues', data);
export const updateIssue = (id, data) => API.put('/issues/' + id, data);
export const deleteIssue = (id) => API.delete('/issues/' + id);
export const addComment = (id, data) => API.post('/issues/' + id + '/comments', data);export const getAnalytics = () => API.get('/issues/analytics');

export const getNotifications = () => API.get('/notifications');
export const getUnreadCount = () => API.get('/notifications/unread');
export const markAsRead = (id) => API.put('/notifications/' + id + '/read');
export const markAllRead = () => API.put('/notifications/markallread');

export const getResources = () => API.get('/resources');
