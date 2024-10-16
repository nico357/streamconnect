"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tv, Users, Settings, MessageSquare } from "lucide-react";
import StreamSetup from '@/components/StreamSetup';
import LiveStream from '@/components/LiveStream';
import LiveChat from '@/components/LiveChat';
import CollaborationManager from '@/components/CollaborationManager';
import { useSocket } from '@/hooks/useSocket';

export default function Home() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamId, setStreamId] = useState<string>('');
  const { isConnected, joinStream, leaveStream } = useSocket(streamId);

  const startStream = () => {
    const newStreamId = `stream-${Date.now()}`;
    setStreamId(newStreamId);
    joinStream(newStreamId);
    setIsStreaming(true);
  };

  const stopStream = () => {
    leaveStream(streamId);
    setStreamId('');
    setIsStreaming(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">StreamConnect</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Tabs defaultValue="stream" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="stream">
                <Tv className="mr-2 h-4 w-4" />
                Transmitir
              </TabsTrigger>
              <TabsTrigger value="collaborate">
                <Users className="mr-2 h-4 w-4" />
                Colaborar
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </TabsTrigger>
            </TabsList>
            <TabsContent value="stream">
              <Card>
                <CardHeader>
                  <CardTitle>{isStreaming ? 'Transmisión en Vivo' : 'Iniciar Transmisión'}</CardTitle>
                  <CardDescription>{isStreaming ? 'Tu transmisión está en curso' : 'Configura y comienza tu transmisión en vivo'}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isStreaming ? (
                    <LiveStream setIsStreaming={stopStream} />
                  ) : (
                    <StreamSetup setIsStreaming={startStream} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="collaborate">
              <Card>
                <CardHeader>
                  <CardTitle>Colaboración</CardTitle>
                  <CardDescription>Gestiona la colaboración en tu transmisión</CardDescription>
                </CardHeader>
                <CardContent>
                  {isConnected && streamId && (
                    <CollaborationManager 
                      streamId={streamId} 
                      isHost={true} 
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración</CardTitle>
                  <CardDescription>Personaliza tu experiencia de transmisión</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Ajusta la configuración de tu transmisión:</p>
                  {/* Aquí irían los controles de configuración */}
                </CardContent>
                <CardFooter>
                  <Button>Guardar Configuración</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="chat">
              <Card className="h-[600px]">
                <CardHeader>
                  <CardTitle>Chat en Vivo</CardTitle>
                  <CardDescription>Interactúa con tu audiencia</CardDescription>
                </CardHeader>
                <CardContent className="h-[calc(100%-130px)]">
                  {isConnected && streamId && (
                    <LiveChat streamId={streamId} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="md:col-span-1">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle>Chat en Vivo</CardTitle>
              <CardDescription>Interactúa con tu audiencia</CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-130px)]">
              {isConnected && streamId && (
                <LiveChat streamId={streamId} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
