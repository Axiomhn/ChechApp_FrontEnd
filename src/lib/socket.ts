import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const BASE_URL = API_URL.replace('/api/v1', '');

export const socket = io(BASE_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});
