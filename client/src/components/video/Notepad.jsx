import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';

function Notepad({ room }) {
  const { socket } = useSocket();
  const [content, setContent] = useState('');

  useEffect(() => {
    socket.on('notepadUpdated', (newContent) => setContent(newContent));
    return () => socket.off('notepadUpdated');
  }, [socket]);

  const handleChange = (e) => {
    setContent(e.target.value);
    socket.emit('notepadChange', { room, content: e.target.value });
  };

  return (
    <textarea
      value={content}
      onChange={handleChange}
      placeholder="Shared notes... type here, both users see it live"
      className="w-full h-40 border rounded p-3 text-sm"
    />
  );
}

export default Notepad;