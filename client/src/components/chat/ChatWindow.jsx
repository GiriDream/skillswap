import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import SwapRequestCard from '../booking/SwapRequestCard';
import VideoCall from '../video/VideoCall';
import Notepad from '../video/Notepad';
import CompletionModal from '../booking/CompletionModal';

function ChatWindow() {
  const { targetId } = useParams();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [warning, setWarning] = useState(null);
  const [activeSwap, setActiveSwap] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.emit('joinRoom', { userId: user._id, targetId });

    api.get(`/messages/${targetId}`).then((res) => setMessages(res.data));

    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('userTyping', () => setIsTyping(true));
    socket.on('userStoppedTyping', () => setIsTyping(false));

    socket.on('contentWarning', ({ reason }) => {
      setWarning(reason);
      setTimeout(() => setWarning(null), 5000);
    });

    socket.on('swapRequestReceived', (swap) => setActiveSwap(swap));
    socket.on('swapStatusUpdated', (swap) => setActiveSwap(swap));

    return () => {
      socket.off('receiveMessage');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
      socket.off('contentWarning');
      socket.off('swapRequestReceived');
      socket.off('swapStatusUpdated');
    };
  }, [socket, targetId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    socket.emit('sendMessage', { senderId: user._id, receiverId: targetId, text });
    socket.emit('stopTyping', { senderId: user._id, receiverId: targetId });
    setText('');
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    socket.emit('typing', { senderId: user._id, receiverId: targetId });
  };

  const handleRequestSwap = async () => {
    const { data } = await api.post('/swap', { tutorId: targetId, skill: 'React', hours: 1 });
    setActiveSwap(data);
    socket.emit('swapRequestSent', { tutorId: targetId, learnerId: user._id, swap: data });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] bg-chalk">
      {/* Header */}
      <div className="bg-slate text-chalk p-4 flex items-center gap-3">
        <h2 className="font-display text-xl">Chat</h2>
        <span className={`w-2 h-2 rounded-full ${onlineUsers.includes(targetId) ? 'bg-leaf' : 'bg-chalk/30'}`} />
        <span className="text-xs text-chalk/60">
          {onlineUsers.includes(targetId) ? 'Online' : 'Offline'}
        </span>
        <button onClick={handleRequestSwap} className="ml-auto bg-marigold text-slate text-xs font-medium px-3 py-1.5 rounded-full hover:opacity-90 transition">
          Request Swap
        </button>
      </div>

      {/* Content warning banner */}
      {warning && (
        <div className="bg-vermilion/10 border-l-4 border-vermilion text-vermilion px-4 py-2 text-sm">
          ⚠️ {warning}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {activeSwap && (
          <SwapRequestCard
            swap={activeSwap}
            isTutor={activeSwap.tutor === user._id}
            onUpdate={(updated) => {
              setActiveSwap(updated);
              socket.emit('swapStatusChanged', { tutorId: targetId, learnerId: user._id, swap: updated });
            }}
          />
        )}

        {activeSwap?.status === 'Live' && (
          <div className="bg-white border border-slate/10 p-4 rounded-xl shadow-sm my-2">
            <button onClick={() => setShowVideoCall(true)} className="w-full bg-slate text-chalk py-2 rounded-lg mb-3 hover:bg-slate-light transition">
              🎥 Join Session Video Call
            </button>
            <Notepad room={[user._id, targetId].sort().join('_')} />
            <button onClick={() => setShowCompletion(true)} className="w-full mt-3 bg-leaf text-white py-2 rounded-lg text-sm hover:opacity-90 transition">
              Mark Session Complete
            </button>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m._id}
            className={`max-w-xs p-2.5 rounded-xl text-sm ${
              m.sender === user._id
                ? 'ml-auto bg-marigold text-slate'
                : 'bg-white border border-slate/10 text-slate'
            }`}
          >
            {m.text}
          </div>
        ))}
        {isTyping && <p className="text-xs text-slate/40 italic">typing...</p>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate/10 flex gap-2">
        <input
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 border border-slate/20 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-marigold"
        />
        <button onClick={handleSend} className="bg-slate text-chalk px-5 py-2 rounded-full text-sm hover:bg-slate-light transition">
          Send
        </button>
      </div>

      {/* Overlays */}
      {showVideoCall && (
        <VideoCall targetId={targetId} onClose={() => setShowVideoCall(false)} />
      )}

      {showCompletion && (
        <CompletionModal
          swap={activeSwap}
          targetId={targetId}
          onClose={() => setShowCompletion(false)}
          onConfirmed={(updated) => setActiveSwap(updated)}
        />
      )}
    </div>
  );
}

export default ChatWindow;