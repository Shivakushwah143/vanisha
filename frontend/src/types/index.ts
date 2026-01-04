export interface Message {
  type: 'user' | 'system' | 'own';
  content: string;
  timestamp: number;
  sender?: string;
}

export interface WebSocketMessage {
  type: 'join' | 'chat';
  payload: {
    roomId?: string;
    message?: string;
  };
}
