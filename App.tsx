
import React, { useState, useMemo, useEffect } from 'react';
import Layout from './components/Layout';
import VideoCard from './components/VideoCard';
import VideoPlayer from './components/VideoPlayer';
import Dashboard from './components/Studio/Dashboard';
import Uploader from './components/Studio/Uploader';
import AdminPanel from './components/Admin/AdminPanel';
import LoginModal from './components/LoginModal';
import ShareModal from './components/ShareModal';
import ChannelView from './components/ChannelView';
import HistoryView from './components/HistoryView';
import ReelsView from './components/ReelsView';
import { useStore } from './store/useStore';
import { CATEGORIES } from './constants';
import { Video } from './types';

const App: React.FC = () => {
  const { 
    user, users, videos, comments, logs, reports, notifications, activeTab, viewingChannelId, setActiveTab, 
    login, logout, addVideo, deleteVideo, incrementView, addToHistory,
    toggleLike, addComment, toggleSubscribe, openChannel, clearHistory
  } = useStore();
  
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [shareData, setShareData] = useState<{title?: string, url?: string} | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // DEEP LINKING LOGIC
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('v');
    const reelId = params.get('r');

    if (videoId) {
      const found = videos.find(v => v.id === videoId);
      if (found) {
        handleVideoSelect(found);
      }
    } else if (reelId) {
      const found = videos.find(v => v.id === reelId && v.type === 'reel');
      if (found) {
        setActiveTab('shorts');
        // The ReelsView will need to handle scrolling to this specific ID if needed,
        // but for now, switching to the tab starts the feed.
      }
    }
  }, [videos.length]); // Re-run when videos are loaded/hydrated

  // Update Document Title based on current view
  useEffect(() => {
    if (selectedVideo) {
      document.title = `${selectedVideo.title} - NexusVideo`;
    } else if (activeTab === 'shorts') {
      document.title = `Reels - NexusVideo`;
    } else {
      document.title = `NexusVideo - Premium Video Platform`;
    }
  }, [selectedVideo, activeTab]);

  const handleVideoSelect = (video: Video) => {
    incrementView(video.id);
    addToHistory(video.id);
    setSelectedVideo(video);
    setActiveTab('home');
    // Update URL without reloading
    const newUrl = `${window.location.origin}${window.location.pathname}?v=${video.id}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedVideo(null);
    setSearchQuery('');
    // Reset URL
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.pushState({ path: cleanUrl }, '', cleanUrl);
  };

  const handleShareVideo = (video: Video) => {
    const type = video.type === 'reel' ? 'r' : 'v';
    setShareData({ 
      title: video.title, 
      url: `${window.location.origin}${window.location.pathname}?${type}=${video.id}` 
    });
  };

  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || v.title.toLowerCase().includes(selectedCategory.toLowerCase());
      if (activeTab === 'shorts') return v.type === 'reel' && matchesSearch;
      return v.type === 'video' && matchesSearch && matchesCategory;
    });
  }, [videos, searchQuery, selectedCategory, activeTab]);

  return (
    <Layout 
      activeTab={activeTab} setActiveTab={setActiveTab} 
      user={user} onLogout={logout} onLogin={() => setShowLogin(true)}
      canGoBack={!!selectedVideo || !!searchQuery}
      onBack={handleBack}
      onSearch={setSearchQuery} searchQuery={searchQuery}
      onShareClick={() => setShareData({ title: 'NexusVideo', url: window.location.origin })}
    >
      {showLogin && <LoginModal onLogin={login} onRegister={() => ({success: true})} onClose={() => setShowLogin(false)} />}
      {shareData && <ShareModal title={shareData.title} url={shareData.url} onClose={() => setShareData(null)} />}

      {activeTab === 'studio' && user ? (
        <>
          <Dashboard user={user} videos={videos} onUploadClick={() => setIsUploading(true)} />
          {isUploading && <Uploader user={user} onSuccess={(v) => {addVideo(v); setIsUploading(false);}} onCancel={() => setIsUploading(false)} />}
        </>
      ) : activeTab === 'shorts' ? (
        <ReelsView 
          reels={videos.filter(v => v.type === 'reel')} 
          currentUser={user} 
          onLike={toggleLike} 
          onSubscribe={toggleSubscribe} 
          onVisitChannel={openChannel} 
          onShare={handleShareVideo}
        />
      ) : activeTab === 'history' && user ? (
        <HistoryView user={user} videos={videos} onVideoClick={handleVideoSelect} onClearHistory={clearHistory} />
      ) : selectedVideo && activeTab === 'home' ? (
        <VideoPlayer video={selectedVideo} relatedVideos={videos.filter(v => v.id !== selectedVideo.id)} currentUser={user} comments={comments} onVideoClick={handleVideoSelect} onLike={toggleLike} onComment={addComment} onSubscribe={toggleSubscribe} onVisitChannel={openChannel} onShare={handleShareVideo} />
      ) : (
        <div className="p-4 md:p-6 pb-24">
          <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar sticky top-0 bg-[#0f0f0f] z-10 pt-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10'}`}>{cat}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 gap-x-5">
            {filteredVideos.map(video => <VideoCard key={video.id} video={video} onClick={handleVideoSelect} />)}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
