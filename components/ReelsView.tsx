
import React, { useRef, useState } from 'react';
import { Video, User } from '../types';

interface ReelsViewProps {
  reels: Video[];
  currentUser: User | null;
  onLike: (videoId: string) => void;
  onSubscribe: (authorId: string) => void;
  onVisitChannel: (authorId: string) => void;
  onShare: (video: Video) => void;
}

const ReelsView: React.FC<ReelsViewProps> = ({ reels, currentUser, onLike, onSubscribe, onVisitChannel, onShare }) => {
  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-30 text-center px-4">
        <i className="fa-solid fa-bolt text-6xl mb-4 text-yellow-500"></i>
        <h3 className="text-xl font-bold">No Nexus Reels yet</h3>
        <p className="mt-2 max-w-xs">Be the first to upload a short-form reel using the Studio!</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black">
      {reels.map((reel) => (
        <ReelItem 
          key={reel.id} 
          reel={reel} 
          currentUser={currentUser} 
          onLike={onLike} 
          onSubscribe={onSubscribe}
          onVisitChannel={onVisitChannel}
          onShare={onShare}
        />
      ))}
    </div>
  );
};

const ReelItem = ({ reel, currentUser, onLike, onSubscribe, onVisitChannel, onShare }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const isLiked = currentUser?.likedVideos?.includes(reel.id);
  const isSubscribed = currentUser?.subscriptions?.includes(reel.authorId);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative h-full w-full snap-start snap-always flex items-center justify-center bg-black group">
      <video 
        ref={videoRef}
        src={reel.videoUrl}
        className="h-full w-full object-cover max-w-[500px]"
        loop
        autoPlay
        muted={false}
        onClick={togglePlay}
        playsInline
      />
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <i className="fa-solid fa-play text-6xl text-white/50"></i>
        </div>
      )}

      {/* Reel Overlays */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 pointer-events-none max-w-[500px] mx-auto w-full">
        <div className="flex items-end justify-between w-full">
          {/* Metadata */}
          <div className="flex-1 pr-12 pointer-events-auto">
             <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/20 cursor-pointer"
                  onClick={() => onVisitChannel(reel.authorId)}
                >
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${reel.authorName}`} alt="Avatar" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">@{reel.authorName.toLowerCase().replace(/\s/g, '')}</p>
                    <button 
                      onClick={() => onSubscribe(reel.authorId)}
                      className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${isSubscribed ? 'bg-white/10 text-white' : 'bg-white text-black'}`}
                    >
                      {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                  </div>
                </div>
             </div>
             <h3 className="text-white text-sm font-bold mb-2 line-clamp-2">{reel.title}</h3>
             <div className="flex flex-wrap gap-2">
                {reel.tags?.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="text-blue-400 text-xs font-bold">#{tag}</span>
                ))}
             </div>
          </div>

          {/* Action Sidebar */}
          <div className="flex flex-col gap-6 items-center pointer-events-auto">
             <div className="flex flex-col items-center gap-1 group/act">
                <button 
                  onClick={() => onLike(reel.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${isLiked ? 'bg-red-600 text-white' : 'bg-black/40 backdrop-blur-md text-white hover:bg-white/10'}`}
                >
                  <i className="fa-solid fa-heart"></i>
                </button>
                <span className="text-[10px] font-bold">{reel.likes.toLocaleString()}</span>
             </div>

             <div className="flex flex-col items-center gap-1">
                <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-xl text-white hover:bg-white/10">
                  <i className="fa-solid fa-comment-dots"></i>
                </button>
                <span className="text-[10px] font-bold">128</span>
             </div>

             <div className="flex flex-col items-center gap-1">
                <button 
                  onClick={() => onShare(reel)}
                  className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-xl text-white hover:bg-white/10"
                >
                  <i className="fa-solid fa-share"></i>
                </button>
                <span className="text-[10px] font-bold">Share</span>
             </div>

             <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 animate-spin-slow flex items-center justify-center border-2 border-white/20">
                <i className="fa-solid fa-music text-[10px] text-white"></i>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelsView;
