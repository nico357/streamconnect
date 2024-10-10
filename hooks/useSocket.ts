import { useState, useEffect, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

export const useSocket = (streamId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInitializer = async () => {
      await fetch('/api/socket');
      const newSocket = io();
      setSocket(newSocket);

      newSocket.on('connect', () => {
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      if (streamId) {
        newSocket.emit('join-stream', streamId);
      }
    };

    socketInitializer();

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        if (streamId) {
          socket.emit('leave-stream', streamId);
        }
        socket.disconnect();
      }
    };
  }, [streamId]);

  const joinStream = useCallback((newStreamId: string) => {
    if (socket) {
      socket.emit('join-stream', newStreamId);
    }
  }, [socket]);

  const leaveStream = useCallback((currentStreamId: string) => {
    if (socket) {
      socket.emit('leave-stream', currentStreamId);
    }
  }, [socket]);

  const sendMessage = useCallback((msg: { streamId: string; content: string; userId: string }) => {
    if (socket) {
      socket.emit('send-message', msg);
    }
  }, [socket]);

  const deleteMessage = useCallback((data: { streamId: string; msgId: string }) => {
    if (socket) {
      socket.emit('delete-message', data);
    }
  }, [socket]);

  const muteUser = useCallback((data: { streamId: string; userId: string }) => {
    if (socket) {
      socket.emit('mute-user', data);
    }
  }, [socket]);

  const requestCollaboration = useCallback((data: { streamId: string; userId: string }) => {
    if (socket) {
      socket.emit('request-collaboration', data);
    }
  }, [socket]);

  const approveCollaboration = useCallback((data: { streamId: string; userId: string }) => {
    if (socket) {
      socket.emit('approve-collaboration', data);
    }
  }, [socket]);

  const endCollaboration = useCallback((data: { streamId: string; userId: string }) => {
    if (socket) {
      socket.emit('end-collaboration', data);
    }
  }, [socket]);

  return {
    socket,
    isConnected,
    joinStream,
    leaveStream,
    sendMessage,
    deleteMessage,
    muteUser,
    requestCollaboration,
    approveCollaboration,
    endCollaboration
  };
};
