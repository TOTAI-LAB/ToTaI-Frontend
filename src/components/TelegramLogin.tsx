import React, { useEffect, useRef } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginProps {
  botName: string;
  onAuth: (user: TelegramUser) => void;
  buttonSize?: 'large' | 'medium' | 'small';
  cornerRadius?: number;
  showAvatar?: boolean;
}

export default function TelegramLogin({
  botName,
  onAuth,
  buttonSize = 'large',
  cornerRadius = 8,
  showAvatar = false,
}: TelegramLoginProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create a unique callback name for this instance
    const callbackName = `onTelegramAuth_${Math.random().toString(36).substr(2, 9)}`;

    // Add the callback to the window object
    (window as any)[callbackName] = (user: TelegramUser) => {
      onAuth(user);
    };

    // Create and append the script element
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', buttonSize);
    script.setAttribute('data-radius', cornerRadius.toString());
    script.setAttribute('data-onauth', `${callbackName}(user)`);
    script.setAttribute('data-request-access', 'write');
    if (!showAvatar) {
      script.setAttribute('data-userpic', 'false');
    }
    script.async = true;

    // Append the script to the container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(script);
    }

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      delete (window as any)[callbackName];
    };
  }, [botName, onAuth, buttonSize, cornerRadius, showAvatar]);

  return <div ref={containerRef} className="telegram-login-container"></div>;
}