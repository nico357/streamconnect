"use client";

import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface LiveStreamProps {
  setIsStreaming: (isStreaming: boolean) => void;
}

const LiveStream: React.FC<LiveStreamProps> = ({ setIsStreaming }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Error accessing media devices.", err);
          toast({
            title: "Error",
            description: "No se pudo acceder a la cámara o micrófono.",
            variant: "destructive",
          });
        });
    }
  }, [toast]);

  const handleStopStream = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    const tracks = stream?.getTracks();
    tracks?.forEach(track => track.stop());
    setIsStreaming(false);
    toast({
      title: "Transmisión finalizada",
      description: "Tu transmisión ha terminado.",
    });
  };

  return (
    <div className="space-y-4">
      <video ref={videoRef} autoPlay muted className="w-full rounded-lg" />
      <Button onClick={handleStopStream} variant="destructive">Detener Transmisión</Button>
    </div>
  );
};

export default LiveStream;