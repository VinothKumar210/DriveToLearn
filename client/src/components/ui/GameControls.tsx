import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/lib/stores/useAudio";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";

export function GameControls() {
  const { isMuted, toggleMute } = useAudio();

  return (
    <div className="absolute top-4 right-4 z-10">
      <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardContent className="p-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleMute}
              className="text-white hover:bg-gray-700/50"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}