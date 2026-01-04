import { useEffect, useRef, useState } from 'react';
import type { Message, WebSocketMessage } from '../types/index';

const WS_URL = 'ws://localhost:3000';

export const useWebSocket = (roomId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      const joinMessage: WebSocketMessage = {
        type: 'join',
        payload: { roomId },
      };
      ws.send(JSON.stringify(joinMessage));

      setMessages((prev) => [
        ...prev,
        {
          type: 'system',
          content: 'Connected to room',
          timestamp: Date.now(),
        },
      ]);
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'user',
          content: event.data,
          timestamp: Date.now(),
        },
      ]);
    };

    ws.onerror = () => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'system',
          content: 'Connection error occurred',
          timestamp: Date.now(),
        },
      ]);
    };

    ws.onclose = () => {
      setIsConnected(false);
      setMessages((prev) => [
        ...prev,
        {
          type: 'system',
          content: 'Disconnected from room',
          timestamp: Date.now(),
        },
      ]);
    };

    return () => {
      ws.close();
    };
  }, [roomId]);

  const sendMessage = (message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const chatMessage: WebSocketMessage = {
        type: 'chat',
        payload: { message },
      };
      wsRef.current.send(JSON.stringify(chatMessage));

      setMessages((prev) => [
        ...prev,
        {
          type: 'own',
          content: message,
          timestamp: Date.now(),
        },
      ]);
    }
  };

  return { messages, sendMessage, isConnected };
};
