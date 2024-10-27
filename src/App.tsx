import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatBox from './components/ChatBox';
import StarterPrompts from './components/StarterPrompts';
import { Chat, Message, TelegramUser, AuthResponse } from './types';
import { CONTRACT_ADDRESS, API_BASE_URL } from './config/constants';

declare global {
  interface Window {
    Telegram?: {
      Login: {
        auth: (options: any) => void;
      };
    };
  }
}

function App() {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'YourBotName');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    document.head.appendChild(script);

    // @ts-ignore
    window.onTelegramAuth = async (user: TelegramUser) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });
        
        if (response.ok) {
          const data: AuthResponse = await response.json();
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        }
      } catch (error) {
        console.error('Authentication error:', error);
      }
    };
  }, []);

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
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-md w-full border border-slate-700">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
              <TrendingUp size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-white text-center">Terminal of Trade AI</h1>
          <p className="mb-4 text-blue-500 text-center font-mono">$TOTAI</p>
          <div className="p-4 bg-slate-900 rounded-lg mb-6 text-center">
            <a
              href={`https://etherscan.io/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors font-mono text-sm break-all"
            >
              {CONTRACT_ADDRESS}
            </a>
          </div>
          <div id="telegram-login-button" className="flex justify-center"></div>
        </div>
      </div>
    );
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

export default App;