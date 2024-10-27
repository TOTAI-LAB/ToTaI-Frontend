import React, { useEffect, useState } from 'react';
import { TrendingUp, Send, Twitter } from 'lucide-react';
import { CONTRACT_ADDRESS, TWITTER_URL, TELEGRAM_URL, TELEGRAM_BOT_NAME } from '../config/constants';
import type { TelegramUser, AuthResponse } from '../types';
import { authenticateUser } from '../service/apiService';

type LoginScreenProps = {
  onAuth: (authResponse: AuthResponse) => void; // Updated to accept AuthResponse
  authError: string | null;
};

export default function LoginScreen({ onAuth, authError }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    document.body.appendChild(script);

    (window as any).telegramCallback = async (user: TelegramUser) => {
      console.log('Telegram callback triggered with user:', user); // Add this line
      setLoading(true);
      try {
        const authResponse = await authenticateUser(user);
        onAuth(authResponse); 
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    

    return () => {
      document.body.removeChild(script);
      delete (window as any).telegramCallback;
    };
  }, [onAuth]);

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
        
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-slate-900 rounded-lg text-center">
            <a
              href={`https://etherscan.io/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors font-mono text-sm break-all"
            >
              {CONTRACT_ADDRESS}
            </a>
          </div>

          <div className="flex justify-center gap-4">
            <a
              href={TWITTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
            >
              <Twitter size={24} />
            </a>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
            >
              <Send size={24} />
            </a>
          </div>
        </div>
        
        {authError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
            {authError}
          </div>
        )}
        
        <div className="space-y-4">
          <div 
            className="flex justify-center"
            id="telegram-login-btn"
          >
            <script
              async
              src="https://telegram.org/js/telegram-widget.js?22"
              data-telegram-login={TELEGRAM_BOT_NAME}
              data-size="large"
              data-radius="8"
              data-onauth="telegramCallback(user)"
              data-request-access="write"
            ></script>
          </div>
        </div>
        {loading && <p className="text-white text-center">Loading...</p>}
      </div>
    </div>
  );
}
