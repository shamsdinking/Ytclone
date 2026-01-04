
import React, { useState, useMemo } from 'react';
import { Video, Comment } from '../types';

interface VideoPlayerProps {
  video: Video;
  relatedVideos: Video[];
  currentUser: any;
  comments: Comment[];
  onVideoClick: (video: Video) => void;
  onLike: (videoId: string) => void;
  onComment: (videoId: string, text: string) => void;
  onSubscribe: (authorId: string) => void;
  onVisitChannel: (authorId: string) => void;
  onShare: (video: Video) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  relatedVideos, 
  currentUser, 
  comments,
  onVideoClick, 
  onLike, 
  onComment, 
  onSubscribe,
  onVisitChannel,
  onShare
}) => {
  const [commentText, setCommentText] = useState('');
  const [showDesc, setShowDesc] = useState(false);
  
  const videoComments = useMemo(() => 
    comments.filter(c => c.videoId === video.id),
  [comments, video.id]);

  const isLiked = currentUser?.likedVideos?.includes(video.id);
  const isSubscribed = currentUser?.subscriptions?.includes(video.authorId);

  const algorithmicallyRelated = useMemo(() => {
    return relatedVideos
      .map(v => {
        let score = 0;
        if (v.authorId === video.authorId) score += 10;
        const sharedTags = v.tags?.filter(tag => video.tags?.includes(tag)) || [];
        score += sharedTags.length * 2;
        return { video: v, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.video.views - a.video.views;
      })
      .map(item => item.video)
      .slice(0, 4);
  }, [video, relatedVideos]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    onComment(video.id, commentText);
    setCommentText('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 max-w-[1800px] mx-auto animate-in fade-in duration-500 pb-20">
      <div className="lg:col-span-2 space-y-6">
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group border border-white/5">
            <video 
              src={video.videoUrl} 
              controls 
              autoPlay
              className="w-full h-full"
            />
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-xl font-bold leading-tight">{video.title}</h1>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onLike(video.id)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all border ${isLiked ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-white/10 border-white/10 hover:bg-white/20'}`}
                >
                  <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`}></i>
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                  <span className="ml-1 border-l border-white/20 pl-2 text-sm font-mono">{video.likes.toLocaleString()}</span>
                </button>
                
                <div className="text-sm text-white/40 flex items-center gap-2">
                  <span className="font-bold">{video.views.toLocaleString()} views</span>
                  <span>•</span>
                  <span className="font-bold">{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4 py-3 border-y border-white/10">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full bg-white/10 overflow-hidden cursor-pointer ring-1 ring-white/10 hover:ring-white/30 transition-all"
                  onClick={() => onVisitChannel(video.authorId)}
                >
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${video.authorName}`} alt="Author" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span 
                    className="font-bold cursor-pointer hover:underline flex items-center gap-1"
                    onClick={() => onVisitChannel(video.authorId)}
                  >
                    {video.authorName}
                    <i className="fa-solid fa-circle-check text-[10px] text-blue-400"></i>
                  </span>
                  <span className="text-xs text-white/60">Verified Creator</span>
                </div>
                {currentUser?.id !== video.authorId && (
                  <button 
                    onClick={() => onSubscribe(video.authorId)}
                    className={`ml-4 px-6 py-2 rounded-full font-bold transition-all ${isSubscribed ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-black hover:bg-white/90'}`}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onShare(video)}
                  className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <i className="fa-solid fa-share"></i>
                  <span className="text-sm font-bold text-white">Share</span>
                </button>
                <button className="bg-white/10 p-2.5 rounded-full hover:bg-white/20 transition-colors">
                  <i className="fa-solid fa-ellipsis"></i>
                </button>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-[#1e1e1e] rounded-2xl p-4 text-sm hover:bg-[#252525] transition-colors group cursor-pointer" onClick={() => setShowDesc(!showDesc)}>
              <div className={`whitespace-pre-wrap leading-relaxed ${!showDesc ? 'line-clamp-3' : ''}`}>
                 {video.description || "No description provided."}
              </div>
              {video.tags && video.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {video.tags.map(tag => (
                    <span key={tag} className="text-blue-400 font-bold">#{tag}</span>
                  ))}
                </div>
              )}
              <button className="text-white font-bold mt-2 text-xs uppercase tracking-widest opacity-60 hover:opacity-100">
                {showDesc ? 'Show less' : 'Show more'}
              </button>
            </div>
          </div>

          {/* Algorithmically Related Below Player */}
          {algorithmicallyRelated.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 px-1">
                <i className="fa-solid fa-wand-magic-sparkles text-purple-400 text-sm"></i>
                <h3 className="font-bold text-lg">Recommended for you</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {algorithmicallyRelated.map(v => (
                  <div key={`rel-${v.id}`} className="flex flex-col gap-2 cursor-pointer group" onClick={() => onVideoClick(v)}>
                    <div className="aspect-video rounded-xl overflow-hidden bg-white/5 relative">
                      <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={v.title} />
                      <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-[10px] px-1.5 py-0.5 rounded font-bold">12:45</div>
                    </div>
                    <h4 className="font-bold text-xs line-clamp-2 group-hover:text-blue-400">{v.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="pt-6 border-t border-white/10">
            <h3 className="font-bold text-lg mb-6">{videoComments.length} Comments</h3>
            <div className="flex gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0 overflow-hidden">
                {currentUser ? <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-white/5"><i className="fa-solid fa-user text-white/20"></i></div>}
              </div>
              <form onSubmit={handleCommentSubmit} className="flex-1 flex flex-col gap-2">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={currentUser ? "Add a comment..." : "Sign in to comment"} 
                  disabled={!currentUser}
                  className="bg-transparent border-b border-white/20 pb-1 focus:outline-none focus:border-white transition-colors"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setCommentText('')} className="px-3 py-1.5 rounded-full hover:bg-white/10 text-sm font-bold">Cancel</button>
                  <button type="submit" disabled={!commentText.trim() || !currentUser} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${commentText.trim() && currentUser ? 'bg-blue-500 text-black' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}>Comment</button>
                </div>
              </form>
            </div>

            <div className="space-y-6">
              {videoComments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0 border border-white/5">
                    <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold">@{comment.userName.toLowerCase().replace(/\s/g, '')}</span>
                      <span className="text-xs text-white/40">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-white/90">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Suggestions */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm mb-2 text-white/40 uppercase tracking-[0.2em] px-1">Up Next</h3>
        {relatedVideos.map(v => (
          <div key={v.id} className="flex gap-3 cursor-pointer group" onClick={() => onVideoClick(v)}>
            <div className="w-40 aspect-video rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative">
              <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-all" alt={v.title} />
              <div className="absolute bottom-1 right-1 bg-black/80 text-[9px] px-1 rounded font-bold">12:45</div>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-bold text-sm line-clamp-2 leading-tight group-hover:text-blue-400">{v.title}</h4>
              <p className="text-white/40 text-[11px] hover:text-white">{v.authorName}</p>
              <p className="text-white/40 text-[11px]">{v.views.toLocaleString()} views</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoPlayer;
