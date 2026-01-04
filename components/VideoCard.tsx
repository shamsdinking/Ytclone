
import React, { useState, useRef, useEffect } from 'react';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = window.setTimeout(() => setIsPreviewing(true), 1100);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
    setIsPreviewing(false);
  };

  return (
    <div 
      className="flex flex-col gap-3 cursor-pointer group"
      onClick={() => onClick(video)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#1a1a1a] shadow-lg border border-white/5 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-black/60 group-hover:-translate-y-1">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${isPreviewing ? 'scale-110 opacity-0 blur-sm' : 'group-hover:scale-105'}`} 
        />

        {isPreviewing && (
          <div className="absolute inset-0 z-10 animate-in fade-in duration-500">
            <video
              ref={videoRef}
              src={video.videoUrl}
              muted
              playsInline
              autoPlay
              loop
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-bold backdrop-blur-sm z-20 group-hover:opacity-0 transition-opacity">
          {video.type === 'reel' ? 'REEL' : '12:45'}
        </div>
      </div>

      <div className="flex gap-3 px-1">
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden ring-1 ring-white/10 group-hover:ring-red-600 transition-all duration-300 transform group-hover:scale-110">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${video.authorName}`} alt={video.authorName} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <h3 className="font-bold text-sm line-clamp-2 leading-tight mb-1 group-hover:text-red-500 transition-colors">
            {video.title}
          </h3>
          <p className="text-white/40 text-[11px] hover:text-white transition-colors flex items-center gap-1 mb-1">
            {video.authorName}
            <i className="fa-solid fa-circle-check text-[10px] text-blue-400/50"></i>
          </p>
          
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/30">
            {/* View Count Animation */}
            <span className="flex items-center gap-1 group-hover:scale-110 group-hover:text-blue-400 transition-all duration-300 origin-left">
              <i className="fa-solid fa-eye text-[9px]"></i>
              {video.views.toLocaleString()}
            </span>
            <span>•</span>
            {/* Like Count Animation */}
            <span className="flex items-center gap-1 group-hover:scale-110 group-hover:text-red-500 transition-all duration-300 origin-left delay-75">
              <i className="fa-solid fa-heart text-[9px]"></i>
              {video.likes.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
