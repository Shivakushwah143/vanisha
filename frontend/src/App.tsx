import { useState } from 'react';
import { Home } from './components/Home';
import { ChatRoom } from './components/ChatRoom';

function App() {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoom(roomId);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
  };

  return (
    <>
      {currentRoom ? (
        <ChatRoom roomId={currentRoom} onLeave={handleLeaveRoom} />
      ) : (
        <Home onJoinRoom={handleJoinRoom} />
      )}
    </>
  );
}

export default App;
