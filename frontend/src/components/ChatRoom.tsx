
import { useState, useEffect, useRef } from 'react';
import { Send, Copy, Check, LogOut, Circle, User, Edit2 } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import type { Message } from '../types/index';

interface ChatRoomProps {
  roomId: string;
  onLeave: () => void;
}

export const ChatRoom = ({ roomId, onLeave }: ChatRoomProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const { messages, sendMessage, isConnected, username, changeUsername } = useWebSocket(roomId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    if (confirm('Are you sure you want to leave? This chat will be lost forever.')) {
      onLeave();
    }
  };

  const handleUsernameChange = () => {
    if (newUsername.trim()) {
      changeUsername(newUsername.trim());
      setNewUsername('');
      setShowUsernameModal(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Generate color based on sender ID for consistency
  const getSenderColor = (senderId?: string) => {
    if (!senderId) return 'text-text-secondary';
    
    // Simple hash function for consistent color
    let hash = 0;
    for (let i = 0; i < senderId.length; i++) {
      hash = senderId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      'text-blue-400',
      'text-green-400',
      'text-purple-400',
      'text-pink-400',
      'text-yellow-400',
      'text-indigo-400',
      'text-teal-400',
      'text-orange-400'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <>
      {/* Username Change Modal */}
      {showUsernameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md border border-border-subtle">
            <h3 className="text-xl font-semibold text-text-primary mb-4">
              Change Your Username
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Current: <span className="text-accent">{username}</span>
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username"
                  className="w-full bg-surface text-text-primary placeholder-text-muted px-4 py-3 rounded-lg border border-border-subtle focus:border-accent focus:outline-none"
                  maxLength={20}
                />
                <p className="text-text-muted text-sm mt-2">
                  This will be visible to others in the chat
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUsernameChange}
                  disabled={!newUsername.trim()}
                  className="flex-1 bg-accent hover:bg-accent-hover text-app py-3 rounded-lg font-medium transition-all disabled:opacity-50"
                >
                  Change Username
                </button>
                <button
                  onClick={() => setShowUsernameModal(false)}
                  className="px-6 bg-surface hover:bg-surface/80 text-text-secondary py-3 rounded-lg font-medium transition-all border border-border-subtle"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-app flex flex-col">
        <div className="bg-card border-b border-border-subtle px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Circle
                  className={`w-2 h-2 ${
                    isConnected ? 'text-success fill-success' : 'text-danger fill-danger'
                  }`}
                />
                <span className="text-text-secondary text-sm">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {/* Username Display */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowUsernameModal(true)}
                  className="flex items-center gap-2 bg-surface hover:bg-surface/80 text-text-primary px-3 py-1.5 rounded-lg transition-all duration-200 border border-border-subtle hover:border-accent/50"
                  title="Change username"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium truncate max-w-25">
                    {username || 'Loading...'}
                  </span>
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyRoomId}
                className="flex items-center gap-2 bg-surface hover:bg-surface/80 text-text-primary px-4 py-2 rounded-lg transition-all duration-200 border border-border-subtle hover:border-accent/50"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-sm font-medium">{roomId}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleLeave}
                className="flex items-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger px-4 py-2 rounded-lg transition-all duration-200 border border-danger/30 hover:border-danger/50"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Leave</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message: Message, index: number) => (
              <div
                key={index}
                className={`flex ${
                  message.type === 'own' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'system' ? (
                  <div className="text-center w-full">
                    <span className="inline-block bg-surface px-4 py-2 rounded-lg text-text-muted text-sm border border-border-subtle">
                      {message.content}
                    </span>
                  </div>
                ) : (
                  <div
                    className={`max-w-[70%] ${
                      message.type === 'own'
                        ? 'bg-message-own'
                        : 'bg-message-other'
                    } rounded-2xl px-4 py-3 border border-border-subtle`}
                  >
                    {/* Show sender name for non-own messages */}
                    {message.type !== 'own' && message.sender && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold ${getSenderColor(message.senderId)}`}>
                          {message.sender}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-text-primary wrap-break-words">{message.content}</p>
                    <span className="text-text-muted text-xs mt-1 block">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="bg-card border-t border-border-subtle px-4 py-4">
          <form
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto flex gap-3"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Type your message as ${username}...`}
              className="flex-1 bg-surface text-text-primary placeholder-text-muted px-6 py-4 rounded-xl border border-border-subtle focus:border-accent focus:outline-none transition-colors"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || !isConnected}
              className="bg-accent hover:bg-accent-hover text-app px-8 py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
};