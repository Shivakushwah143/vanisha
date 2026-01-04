// export interface Message {
//   type: 'user' | 'system' | 'own';
//   content: string;
//   timestamp: number;
//   sender?: string;
// }

// export interface WebSocketMessage {
//   type: 'join' | 'chat';
//   payload: {
//     roomId?: string;
//     message?: string;
//   };
// }


export interface Message {
  type: 'user' | 'system' | 'own';
  content: string;
  timestamp: number;
  sender?: string;
  senderId?: string; // Add this for temporary user identification
}

export interface WebSocketMessage {
  type: 'join' | 'chat' | 'username'; // Add username type
  payload: {
    roomId?: string;
    message?: string;
    username?: string; // Add username field
    senderId?: string; // Add senderId for temporary identification
  };
}

export interface UserData {
  username: string;
  color?: string; // Optional: for visual distinction
}