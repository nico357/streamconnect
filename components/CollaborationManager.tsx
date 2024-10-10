"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/use-toast';

interface CollaborationManagerProps {
  streamId: string;
  isHost: boolean;
}

const CollaborationManager: React.FC<CollaborationManagerProps> = ({ streamId, isHost }) => {
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [collaborationRequests, setCollaborationRequests] = useState<string[]>([]);
  const { toast } = useToast();
  const { socket, requestCollaboration, approveCollaboration, endCollaboration } = useSocket(streamId);

  useEffect(() => {
    if (!socket) return;

    const handleCollaborationRequested = (userId: string) => {
      if (isHost) {
        setCollaborationRequests(prev => [...prev, userId]);
        toast({
          title: "Solicitud de colaboración",
          description: `El usuario ${userId} quiere colaborar en el stream.`,
        });
      }
    };

    const handleCollaborationApproved = (userId: string) => {
      setCollaborators(prev => [...prev, userId]);
      toast({
        title: "Colaboración aprobada",
        description: `El usuario ${userId} ahora es un colaborador.`,
      });
    };

    const handleCollaborationEnded = (userId: string) => {
      setCollaborators(prev => prev.filter(id => id !== userId));
      toast({
        title: "Colaboración finalizada",
        description: `El usuario ${userId} ya no es un colaborador.`,
      });
    };

    socket.on('collaboration-requested', handleCollaborationRequested);
    socket.on('collaboration-approved', handleCollaborationApproved);
    socket.on('collaboration-ended', handleCollaborationEnded);

    return () => {
      socket.off('collaboration-requested', handleCollaborationRequested);
      socket.off('collaboration-approved', handleCollaborationApproved);
      socket.off('collaboration-ended', handleCollaborationEnded);
    };
  }, [socket, isHost, toast]);

  const handleRequestCollaboration = () => {
    requestCollaboration({ streamId, userId: 'current-user-id' });
  };

  const handleApproveCollaboration = (userId: string) => {
    approveCollaboration({ streamId, userId });
    setCollaborationRequests(prev => prev.filter(id => id !== userId));
  };

  const handleEndCollaboration = (userId: string) => {
    endCollaboration({ streamId, userId });
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
                <Button onClick={() => handleApproveCollaboration(userId)}>Aprobar</Button>
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-medium">Colaboradores actuales:</h4>
            {collaborators.map(userId => (
              <div key={userId} className="flex items-center space-x-2 mt-2">
                <span>{userId}</span>
                <Button onClick={() => handleEndCollaboration(userId)}>Finalizar colaboración</Button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <Button onClick={handleRequestCollaboration}>Solicitar colaboración</Button>
      )}
    </div>
  );
};

export default CollaborationManager;
