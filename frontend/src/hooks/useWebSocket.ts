
import { useEffect, useRef, useState, useCallback } from 'react';
import type { Message, WebSocketMessage } from '../types/index';

const WS_URL = 'ws://localhost:3000';

export const useWebSocket = (roomId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);

  // Generate a persistent user ID
  const getOrCreateUserId = useCallback(() => {
    const storedId = localStorage.getItem('anonymous_user_id');
    if (storedId) return storedId;
    
    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('anonymous_user_id', newId);
    return newId;
  }, []);

  useEffect(() => {
    if (!roomId) return;

    // Clear existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Clear messages for new room
    setMessages([]);

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      const persistentUserId = getOrCreateUserId();
      setUserId(persistentUserId);
      
      // Send join message
      const joinMessage: WebSocketMessage = {
        type: 'join',
        payload: { 
          roomId,
          senderId: persistentUserId
        },
      };
      ws.send(JSON.stringify(joinMessage));

      // Add only ONE connection message
      setMessages(prev => {
        if (prev.length === 0 || !prev[prev.length - 1].content.includes('Connected')) {
          return [...prev, {
            type: 'system',
            content: 'Connected to room',
            timestamp: Date.now(),
          }];
        }
        return prev;
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'welcome') {
          setUsername(data.payload.username);
          setUserId(data.payload.userId);
          localStorage.setItem('anonymous_user_id', data.payload.userId);
          return;
        }

        if (data.type === 'message') {
          // Check if this message is from ourselves (shouldn't happen with fixed backend)
          const isOwnMessage = data.senderId === userId;
          
          setMessages(prev => [...prev, {
            type: isOwnMessage ? 'own' : 'user',
            content: data.message,
            timestamp: data.timestamp || Date.now(),
            sender: data.sender || 'Anonymous',
            senderId: data.senderId,
          }]);
          return;
        }

        if (data.type === 'system') {
          setMessages(prev => [...prev, {
            type: 'system',
            content: data.message,
            timestamp: data.timestamp || Date.now(),
          }]);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Add only ONE disconnect message
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (!lastMessage || !lastMessage.content.includes('Disconnected')) {
          return [...prev, {
            type: 'system',
            content: 'Disconnected',
            timestamp: Date.now(),
          }];
        }
        return prev;
      });
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [roomId]); // Only depend on roomId

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && message.trim()) {
      const chatMessage: WebSocketMessage = {
        type: 'chat',
        payload: { 
          message: message.trim(),
        },
      };
      
      // Send to server
      wsRef.current.send(JSON.stringify(chatMessage));
      
      // Immediately add our own message locally (won't get echo from server)
      setMessages(prev => [...prev, {
        type: 'own',
        content: message.trim(),
        timestamp: Date.now(),
        sender: username,
        senderId: userId,
      }]);
    }
  }, [username, userId]);

  const changeUsername = useCallback((newUsername: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && newUsername.trim()) {
      const usernameMessage: WebSocketMessage = {
        type: 'username',
        payload: { 
          username: newUsername.trim(),
        },
      };
      wsRef.current.send(JSON.stringify(usernameMessage));
      setUsername(newUsername.trim());
    }
  }, []);

  return { 
    messages, 
    sendMessage, 
    isConnected, 
    username, 
    changeUsername,
    userId 
  };
};