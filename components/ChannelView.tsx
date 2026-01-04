
import React, { useMemo } from 'react';
import { User, Video } from '../types';
import VideoCard from './VideoCard';

interface ChannelViewProps {
  author: User;
  videos: Video[];
  currentUser: User | null;
  onVideoClick: (video: Video) => void;
  onSubscribe: (authorId: string) => void;
}

const ChannelView: React.FC<ChannelViewProps> = ({ author, videos, currentUser, onVideoClick, onSubscribe }) => {
  const channelVideos = useMemo(() => videos.filter(v => v.authorId === author.id), [videos, author.id]);
  const isSubscribed = currentUser?.subscriptions?.includes(author.id);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Banner */}
      <div className="h-48 md:h-64 lg:h-80 w-full bg-gradient-to-r from-red-900 to-black relative">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Profile Info */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 -mt-12 md:-mt-16 mb-8 relative z-10">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#0f0f0f] bg-white/10 overflow-hidden shadow-2xl">
            <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-center md:text-left pt-14 md:pt-20">
            <h1 className="text-3xl md:text-4xl font-bold mb-1">{author.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-sm text-white/60 mb-6">
              <span className="font-bold text-white">@{author.name.toLowerCase().replace(' ', '')}</span>
              <span>{author.followers.toLocaleString()} subscribers</span>
              <span>{channelVideos.length} videos</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              {currentUser?.id !== author.id ? (
                <button 
                  onClick={() => onSubscribe(author.id)}
                  className={`px-8 py-2.5 rounded-full font-bold transition-all ${isSubscribed ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-black hover:bg-white/90'}`}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              ) : (
                <button className="bg-white/10 hover:bg-white/20 px-8 py-2.5 rounded-full font-bold">
                  Customize Channel
                </button>
              )}
              <button className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-full font-bold">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
          <div className="flex gap-8">
            <button className="pb-3 border-b-2 border-white font-bold whitespace-nowrap">Home</button>
            <button className="pb-3 text-white/60 font-medium whitespace-nowrap hover:text-white">Videos</button>
            <button className="pb-3 text-white/60 font-medium whitespace-nowrap hover:text-white">Shorts</button>
            <button className="pb-3 text-white/60 font-medium whitespace-nowrap hover:text-white">Playlists</button>
            <button className="pb-3 text-white/60 font-medium whitespace-nowrap hover:text-white">Community</button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-10 gap-x-4 pb-20">
          {channelVideos.length > 0 ? (
            channelVideos.map(video => (
              <VideoCard key={video.id} video={video} onClick={onVideoClick} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center opacity-30">
              <i className="fa-solid fa-clapperboard text-6xl mb-4"></i>
              <p className="text-xl font-bold">No videos uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelView;
