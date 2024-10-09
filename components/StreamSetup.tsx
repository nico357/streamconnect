"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface StreamSetupProps {
  setIsStreaming: (isStreaming: boolean) => void;
}

const StreamSetup: React.FC<StreamSetupProps> = ({ setIsStreaming }) => {
  const [platforms, setPlatforms] = useState({
    facebook: false,
    youtube: false,
  });
  const [resolution, setResolution] = useState("720p");
  const [bitrate, setBitrate] = useState(2500);
  const { toast } = useToast();

  const handlePlatformChange = (platform: 'facebook' | 'youtube') => {
    setPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  const handleStartStream = async () => {
    if (!platforms.facebook && !platforms.youtube) {
      toast({
        title: "Error",
        description: "Por favor, selecciona al menos una plataforma para transmitir.",
        variant: "destructive",
      });
      return;
    }

    // Aquí iría la lógica para iniciar la transmisión en las plataformas seleccionadas
    console.log('Iniciando transmisión en:', platforms);
    console.log('Configuración:', { resolution, bitrate });
    
    // Simulamos el inicio de la transmisión
    setTimeout(() => {
      setIsStreaming(true);
      toast({
        title: "Transmisión iniciada",
        description: `Tu transmisión ha comenzado exitosamente con resolución ${resolution} y bitrate ${bitrate}kbps.`,
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Plataformas</h3>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="facebook" 
            checked={platforms.facebook}
            onCheckedChange={() => handlePlatformChange('facebook')}
          />
          <Label htmlFor="facebook">Facebook Live</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="youtube" 
            checked={platforms.youtube}
            onCheckedChange={() => handlePlatformChange('youtube')}
          />
          <Label htmlFor="youtube">YouTube Live</Label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Configuración de video</h3>
        <div className="space-y-2">
          <Label htmlFor="resolution">Resolución</Label>
          <Select onValueChange={setResolution} defaultValue={resolution}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona la resolución" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="480p">480p</SelectItem>
              <SelectItem value="720p">720p</SelectItem>
              <SelectItem value="1080p">1080p</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bitrate">Bitrate: {bitrate} kbps</Label>
          <Slider
            id="bitrate"
            min={1000}
            max={6000}
            step={500}
            value={[bitrate]}
            onValueChange={(value) => setBitrate(value[0])}
          />
        </div>
      </div>

      <Button onClick={handleStartStream} className="w-full">Iniciar Transmisión</Button>
    </div>
  );
};

export default StreamSetup;