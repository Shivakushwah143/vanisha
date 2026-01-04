import { useState } from 'react';
import { MessageCircle, Plus, LogIn, Shield, Clock, Lock } from 'lucide-react';

interface HomeProps {
  onJoinRoom: (roomId: string) => void;
}

export const Home = ({ onJoinRoom }: HomeProps) => {
  const [roomId, setRoomId] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    onJoinRoom(newRoomId);
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      onJoinRoom(roomId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full"></div>
              <MessageCircle className="w-20 h-20 text-accent relative" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-text-primary mb-3">
            Silent Chat
          </h1>
          <p className="text-text-secondary text-lg">
            Anonymous conversations that disappear
          </p>
        </div>

        <div className="bg-card rounded-2xl p-8 mb-6 border border-border-subtle">
          {!showJoinInput ? (
            <div className="space-y-4">
              <button
                onClick={handleCreateRoom}
                className="w-full bg-accent hover:bg-accent-hover text-app py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
              >
                <Plus className="w-5 h-5" />
                Create New Room
              </button>

              <button
                onClick={() => setShowJoinInput(true)}
                className="w-full bg-surface hover:bg-surface/80 text-text-primary py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 border border-border-subtle hover:border-accent/50"
              >
                <LogIn className="w-5 h-5" />
                Join Existing Room
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter room code"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="w-full bg-surface text-text-primary placeholder-text-muted px-6 py-4 rounded-xl border border-border-subtle focus:border-accent focus:outline-none transition-colors"
                maxLength={8}
              />

              <div className="flex gap-3">
                <button
                  onClick={handleJoinRoom}
                  disabled={!roomId.trim()}
                  className="flex-1 bg-accent hover:bg-accent-hover text-app py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
                >
                  Join Room
                </button>

                <button
                  onClick={() => {
                    setShowJoinInput(false);
                    setRoomId('');
                  }}
                  className="px-6 bg-surface hover:bg-surface/80 text-text-secondary py-4 rounded-xl font-semibold transition-all duration-200 border border-border-subtle"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-card/50 rounded-xl p-4 border border-border-subtle">
            <Shield className="w-6 h-6 text-accent mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-text-secondary text-sm">No Data Saved</p>
          </div>

          <div className="bg-card/50 rounded-xl p-4 border border-border-subtle">
            <Clock className="w-6 h-6 text-accent mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-text-secondary text-sm">Temporary</p>
          </div>

          <div className="bg-card/50 rounded-xl p-4 border border-border-subtle">
            <Lock className="w-6 h-6 text-accent mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-text-secondary text-sm">Anonymous</p>
          </div>
        </div>

        <div className="mt-8 text-center text-text-muted text-sm">
          <p>Your messages vanish when you leave</p>
        </div>
      </div>
    </div>
  );
};
