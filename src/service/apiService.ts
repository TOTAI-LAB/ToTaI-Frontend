import axios from 'axios';
import type { TelegramUser, AuthResponse, Chat, Message } from '../types';

// Create an instance of axios with the base URL of your backend
const api = axios.create({
  baseURL: 'https://uncanny-spooky-phantom-x5v4v4r7r4vvfp4q7-8000.app.github.dev/', // Replace with your backend API URL
});

import { API_BASE_URL } from '../config/constants';

export async function authenticateUser(user: TelegramUser): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  console.log('Response:', response); // Add this line to see the response object
  if (!response.ok) {
    throw new Error('Authentication failed');
  }

  return response.json(); // This should return AuthResponse
}


// Function to start a new chat session
export const startSession = async (): Promise<{ session_id: string }> => {
  const response = await api.post('/api/start-session');
  return response.data; // Return the session ID
};

// Function to send a chat message and get a response
export const sendChatMessage = async (chatId: string, message: Message): Promise<void> => {
  await api.post(`/api/chat/${chatId}/messages`, message);
};

// Function to retrieve a chat by ID
export const getChat = async (chatId: string): Promise<Chat> => {
  const response = await api.get<Chat>(`/api/chat/${chatId}`);
  return response.data; // Return the chat details
};

// Optional: Function to check remaining tokens for a user
export const getUserTokens = async (userId: number): Promise<{ user_id: number; tokens_left: number }> => {
  const response = await api.get(`/api/tokens/${userId}`);
  return response.data; // Return the tokens left for the user
};

// Optional: Function to replenish tokens
export const replenishTokens = async (userId: number, amount: number): Promise<{ user_id: number; tokens_left: number }> => {
  const response = await api.post('/api/tokens/replenish', { user_id: userId, amount });
  return response.data; // Return the updated tokens left for the user
};

export default api;
