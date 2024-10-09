"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Socket } from 'socket.io-client';

interface CollaborationManagerProps {
  socket: Socket;
  streamId: string;
  isHost: boolean;
}

const CollaborationManager: React.FC<CollaborationManagerProps> = ({ socket, streamId, isHost }) => {
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [collaborationRequests, setCollaborationRequests] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!socket) return;

    socket.on('collaboration-requested', (userId: string) => {
      if (isHost) {
        setCollaborationRequests(prev => [...prev, userId]);
        toast({
          title: "Solicitud de colaboración",
          description: `El usuario ${userId} quiere colaborar en el stream.`,
        });
      }
    });

    socket.on('collaboration-approved', (userId: string) => {
      setCollaborators(prev => [...prev, userId]);
      toast({
        title: "Colaboración aprobada",
        description: `El usuario ${userId} ahora es un colaborador.`,
      });
    });

    socket.on('collaboration-ended', (userId: string) => {
      setCollaborators(prev => prev.filter(id => id !== userId));
      toast({
        title: "Colaboración finalizada",
        description: `El usuario ${userId} ya no es un colaborador.`,
      });
    });

    return () => {
      socket.off('collaboration-requested');
      socket.off('collaboration-approved');
      socket.off('collaboration-ended');
    };
  }, [socket, isHost, toast]);

  const requestCollaboration = () => {
    socket.emit('request-collaboration', { streamId, userId: 'current-user-id' });
  };

  const approveCollaboration = (userId: string) => {
    socket.emit('approve-collaboration', { streamId, userId });
    setCollaborationRequests(prev => prev.filter(id => id !== userId));
  };

  const endCollaboration = (userId: string) => {
    socket.emit('end-collaboration', { streamId, userId });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Colaboración</h3>
      {isHost ? (
        <>
          <div>
            <h4 className="font-medium">Solicitudes de colaboración:</h4>
            {collaborationRequests.map(userId => (
              <div key={userId} className="flex items-center space-x-2 mt-2">
                <span>{userId}</span>
                <Button onClick={() => approveCollaboration(userId)}>Aprobar</Button>
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-medium">Colaboradores actuales:</h4>
            {collaborators.map(userId => (
              <div key={userId} className="flex items-center space-x-2 mt-2">
                <span>{userId}</span>
                <Button onClick={() => endCollaboration(userId)}>Finalizar colaboración</Button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <Button onClick={requestCollaboration}>Solicitar colaboración</Button>
      )}
    </div>
  );
};

export default CollaborationManager;