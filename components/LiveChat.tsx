"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/useSocket';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

interface LiveChatProps {
  streamId: string;
}

const LiveChat: React.FC<LiveChatProps> = ({ streamId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isModerator, setIsModerator] = useState(false); // In a real app, this would come from user authentication
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { socket, sendMessage, deleteMessage, muteUser } = useSocket(streamId);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: ChatMessage) => {
      setMessages(prevMessages => [...prevMessages, msg]);
    };

    const handleMessageDeleted = (msgId: string) => {
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== msgId));
    };

    const handleUserMuted = (userId: string) => {
      toast({
        title: "Usuario silenciado",
        description: `El usuario ${userId} ha sido silenciado.`,
      });
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-deleted', handleMessageDeleted);
    socket.on('user-muted', handleUserMuted);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-deleted', handleMessageDeleted);
      socket.off('user-muted', handleUserMuted);
    };
  }, [socket, toast]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && socket) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        user: 'Usuario', // In a real app, this would come from the authenticated user
        message: newMessage.trim(),
        timestamp: new Date(),
      };
      sendMessage({ streamId, content: message.message, userId: message.user });
      setNewMessage('');
    }
  };

  const handleDeleteMessage = (msgId: string) => {
    if (isModerator) {
      deleteMessage({ streamId, msgId });
    }
  };

  const handleMuteUser = (userId: string) => {
    if (isModerator) {
      muteUser({ streamId, userId });
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
