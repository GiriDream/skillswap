import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const newSocket = io('https://skillswap-backend-8cmi.onrender.com');
    setSocket(newSocket);

    // Re-announce on every connect (initial AND any reconnect) — keeps server's
    // onlineUsers map accurate so video call / chat signaling never breaks.
    newSocket.on('connect', () => {
      newSocket.emit('join', user._id);
    });

    newSocket.on('onlineUsers', (users) => setOnlineUsers(users));

    return () => newSocket.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);