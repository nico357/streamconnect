"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import io from 'socket.io-client';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

const LiveChat: React.FC = () => {
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isModerator, setIsModerator] = useState(false); // En una aplicación real, esto vendría de la autenticación del usuario
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const socketInitializer = async () => {
      await fetch('/api/socket');
      const newSocket = io();

      newSocket.on('connect', () => {
        console.log('Connected to socket');
      });

      newSocket.on('new-message', (msg: ChatMessage) => {
        setMessages(prevMessages => [...prevMessages, msg]);
      });

      newSocket.on('message-deleted', (msgId: string) => {
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== msgId));
      });

      newSocket.on('user-muted', (userId: string) => {
        toast({
          title: "Usuario silenciado",
          description: `El usuario ${userId} ha sido silenciado.`,
        });
      });

      setSocket(newSocket);
    };

    socketInitializer();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && socket) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        user: 'Usuario', // En una aplicación real, esto vendría del usuario autenticado
        message: newMessage.trim(),
        timestamp: new Date(),
      };
      socket.emit('send-message', message);
      setNewMessage('');
    }
  };

  const handleDeleteMessage = (msgId: string) => {
    if (socket && isModerator) {
      socket.emit('delete-message', msgId);
    }
  };

  const handleMuteUser = (userId: string) => {
    if (socket && isModerator) {
      socket.emit('mute-user', userId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2 flex justify-between items-start">
            <div>
              <span className="font-bold">{msg.user}: </span>
              <span>{msg.message}</span>
              <span className="text-xs text-gray-500 ml-2">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            {isModerator && (
              <div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteMessage(msg.id)}>Eliminar</Button>
                <Button variant="ghost" size="sm" onClick={() => handleMuteUser(msg.user)}>Silenciar</Button>
              </div>
            )}
          </div>
        ))}
      </ScrollArea>
      <div className="flex p-4">
        <Input
          type="text"
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-grow mr-2"
        />
        <Button onClick={handleSendMessage}>Enviar</Button>
      </div>
    </div>
  );
};

export default LiveChat;