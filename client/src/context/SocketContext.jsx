import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

// Store socket instance outside of component to prevent re-creation
let socketInstance = null;

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socketInstance?.connected || false);

  const initSocket = useCallback(() => {
    // Connect only if not already connected or connecting
    if (socketInstance) return;

    console.log('Initializing socket connection...');
    socketInstance = io('https://collaborative-code-editor-2jnc.onrender.com');

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected:', socketInstance.id);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected');
    });
  }, []);
  
  // Clean up the connection when the provider unmounts
  useEffect(() => {
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketInstance, isConnected, initSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};