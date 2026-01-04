
import React from 'react';
import { User, Video } from '../types';
import VideoCard from './VideoCard';

interface HistoryViewProps {
  user: User;
  videos: Video[];
  onVideoClick: (video: Video) => void;
  onClearHistory: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ user, videos, onVideoClick, onClearHistory }) => {
  const historyVideos = (user.watchHistory || [])
    .map(id => videos.find(v => v.id === id))
    .filter((v): v is Video => !!v);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Watch History</h1>
          <p className="text-white/60 text-sm mt-1">Videos you've watched on Nexus</p>
        </div>
        {historyVideos.length > 0 && (
          <button 
            onClick={onClearHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 text-sm font-bold text-red-500 transition-colors"
          >
            <i className="fa-solid fa-trash-can"></i>
            Clear all watch history
          </button>
        )}
      </div>

      {historyVideos.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-10 gap-x-4">
            {historyVideos.map(video => (
              <VideoCard key={`history-${video.id}`} video={video} onClick={onVideoClick} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 opacity-30 text-center">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <i className="fa-solid fa-clock-rotate-left text-5xl"></i>
          </div>
          <h3 className="text-xl font-bold">No watch history</h3>
          <p className="max-w-xs mt-2">When you watch videos, they'll show up here for you to find again.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
