export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface AuthResponse {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  tokens_left: number;
}

declare global {
  interface Window {
    Telegram: {
      Login: {
        widget: (config: any) => void;
      };
    };
    telegramCallback: (user: TelegramUser) => void;
  }
}