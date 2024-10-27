import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import ChatBox from './components/ChatBox';
import StarterPrompts from './components/StarterPrompts';
import type { Chat, Message, TelegramUser, AuthResponse } from './types';
import { API_BASE_URL } from './config/constants';

export default function App() {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleTelegramAuth = async (telegramUser: TelegramUser) => {
    try {
      setAuthError(null);
      const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telegramUser),
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data: AuthResponse = await response.json();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError('Failed to authenticate. Please try again.');
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/start-session`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const { session_id } = await response.json();
        const newChat: Chat = {
          id: session_id,
          title: 'New Analysis',
          messages: [],
        };
        setChats([newChat, ...chats]);
        setActiveChat(session_id);
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!activeChat || !user) return;

    const currentChat = chats.find((chat) => chat.id === activeChat);
    if (!currentChat) return;

    const newMessage: Message = { role: 'user', content: message };
    const updatedMessages = [...currentChat.messages, newMessage];
    
    setChats(
      chats.map((chat) =>
        chat.id === activeChat
          ? { ...chat, messages: updatedMessages }
          : chat
      )
    );

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: activeChat,
          user_id: user.user_id,
          query: message,
        }),
      });

      if (response.ok) {
        const { response: botResponse } = await response.json();
        const botMessage: Message = { role: 'assistant', content: botResponse };
        
        setChats(
          chats.map((chat) =>
            chat.id === activeChat
              ? { ...chat, messages: [...updatedMessages, botMessage] }
              : chat
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setChats([]);
    setActiveChat(null);
  };

  if (!user) {
    return <LoginScreen onAuth={handleTelegramAuth} authError={authError} />;
  }

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar
        chats={chats}
        activeChat={activeChat}
        onNewChat={handleNewChat}
        onSelectChat={setActiveChat}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <ChatBox
            messages={chats.find((chat) => chat.id === activeChat)?.messages || []}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        ) : (
          <StarterPrompts onSelectPrompt={(prompt) => {
            handleNewChat().then(() => handleSendMessage(prompt));
          }} />
        )}
      </div>
    </div>
  );
}