
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export const SpotifyPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([50]);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Lista de músicas de domínio público/livres
  const playlist = [
    {
      title: "Meditation Music",
      artist: "Peaceful Sounds",
      url: "https://www.soundjay.com/misc/sounds/meditation-bell-783.mp3"
    }
  ];

  const [currentTrack] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      // Use a simple tone generator instead of external audio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.start();
      
      setTimeout(() => {
        oscillator.stop();
      }, 1000);
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-4 bg-gray-800/80 rounded-lg p-3 backdrop-blur-sm border border-gray-700">
      <audio ref={audioRef} src={playlist[currentTrack]?.url} />
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <SkipBack className="w-4 h-4" />
        </Button>
        
        <Button 
          onClick={togglePlay}
          size="sm" 
          className="bg-lime-500 hover:bg-lime-600 text-gray-900"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 max-w-xs">
        <div className="text-sm text-white font-medium truncate">
          {playlist[currentTrack]?.title || "Música de Trabalho"}
        </div>
        <div className="text-xs text-gray-400 truncate">
          {playlist[currentTrack]?.artist || "Sons Relaxantes"}
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
          <div className="flex-1 h-1 bg-gray-600 rounded">
            <div 
              className="h-full bg-lime-500 rounded transition-all duration-200"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-xs text-gray-400">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-gray-400" />
        <div className="w-20">
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={1}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
