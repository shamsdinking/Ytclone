
import React, { useState, useRef, useEffect } from 'react';
import { generateVideoMetadata, generateThumbnail } from '../../services/geminiService';
import { Video, User } from '../../types';

interface UploaderProps {
  user: User;
  onSuccess: (video: Video) => void;
  onCancel: () => void;
}

const Uploader: React.FC<UploaderProps> = ({ user, onSuccess, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [thumbnailsGenerating, setThumbnailsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<'video' | 'reel'>('video');
  const [thumbnailOptions, setThumbnailOptions] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
  
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    tags: [] as string[]
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear thumbnails when type changes to ensure aspect ratio consistency
  useEffect(() => {
    if (!loading) {
      setThumbnailOptions([]);
      setSelectedThumbnail(null);
    }
  }, [type]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const generateAI = async () => {
    if (!topic) return;
    setAiGenerating(true);
    const result = await generateVideoMetadata(topic, type === 'reel');
    if (result) {
      setMetadata({
        title: result.title,
        description: result.description,
        tags: result.tags || []
      });
      // Automatically trigger first thumbnail batch
      handleGenerateThumbnails(result.title);
    }
    setAiGenerating(false);
  };

  const handleGenerateThumbnails = async (specificTopic?: string) => {
    const query = specificTopic || metadata.title || topic;
    if (!query) return;
    
    setThumbnailsGenerating(true);
    try {
      const targetRatio = type === 'reel' ? '9:16' : '16:9';
      // Generate 3 variations in parallel
      const prompts = [
        `${query} - Action shot, high contrast`,
        `${query} - Minimalist, clean design`,
        `${query} - Dramatic lighting, epic close up`
      ];
      
      const results = await Promise.all(prompts.map(p => generateThumbnail(p, targetRatio)));
      const filteredResults = results.filter((r): r is string => r !== null);
      
      setThumbnailOptions(filteredResults);
      if (filteredResults.length > 0) {
        setSelectedThumbnail(filteredResults[0]);
      }
    } finally {
      setThumbnailsGenerating(false);
    }
  };

  const handleUpload = () => {
    if (!file || !metadata.title) return;
    setLoading(true);
    setUploadProgress(0);

    const duration = 2500;
    const interval = 50;
    const steps = duration / interval;
    const increment = 100 / steps;

    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(timer);
        
        const newVideo: Video = {
          id: Math.random().toString(36).substr(2, 9),
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
          thumbnail: selectedThumbnail || (type === 'reel' ? `https://picsum.photos/seed/${metadata.title}/450/800` : `https://picsum.photos/seed/${metadata.title}/800/450`),
          videoUrl: URL.createObjectURL(file),
          authorId: user.id,
          authorName: user.name,
          views: 0,
          likes: 0,
          createdAt: new Date().toISOString(),
          type: type,
          viewHistory: []
        };
        
        setTimeout(() => {
          onSuccess(newVideo);
          setLoading(false);
        }, 300);
      }
      setUploadProgress(Math.min(100, Math.round(currentProgress)));
    }, interval);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#282828]">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <i className={`fa-solid ${type === 'reel' ? 'fa-bolt text-yellow-500' : 'fa-clapperboard text-red-600'}`}></i>
            Upload {type === 'reel' ? 'Reel' : 'Video'}
          </h2>
          <button 
            disabled={loading}
            onClick={onCancel} 
            className="text-white/60 hover:text-white transition-colors disabled:opacity-30"
          >
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Selector & Thumbnail Options */}
          <div className="space-y-6">
            <div 
              onClick={() => !loading && fileInputRef.current?.click()}
              className={`border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center transition-all group ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-red-600/50 hover:bg-white/5'}`}
            >
              <div className={`w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${type === 'reel' ? 'border-yellow-500/30 border' : ''}`}>
                <i className={`fa-solid ${type === 'reel' ? 'fa-mobile-screen-button text-yellow-500' : 'fa-arrow-up-from-bracket text-white/40'} text-2xl`}></i>
              </div>
              <p className="font-bold text-center text-sm">Select {type === 'reel' ? 'Vertical Video' : 'Video'} to upload</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="video/*"
                disabled={loading}
              />
            </div>

            {file && (
              <div className="bg-white/5 p-3 rounded-xl flex items-center gap-4 border border-white/5">
                <i className={`fa-solid ${type === 'reel' ? 'fa-bolt text-yellow-500' : 'fa-file-video text-red-500'} text-xl`}></i>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-xs truncate">{file.name}</p>
                  <p className="text-[10px] text-white/40">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}

            {/* AI Thumbnail Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-white/60">
                  AI Thumbnail Options ({type === 'reel' ? '9:16 Portrait' : '16:9 Landscape'})
                </label>
                {(metadata.title || topic) && !loading && (
                  <button 
                    onClick={() => handleGenerateThumbnails()}
                    disabled={thumbnailsGenerating}
                    className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-2"
                  >
                    {thumbnailsGenerating ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-rotate"></i>}
                    Regenerate
                  </button>
                )}
              </div>

              {thumbnailsGenerating && thumbnailOptions.length === 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`${type === 'reel' ? 'aspect-[9/16]' : 'aspect-video'} bg-white/5 rounded-lg animate-pulse flex items-center justify-center`}>
                      <i className="fa-solid fa-image text-white/10 text-xl"></i>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {thumbnailOptions.map((url, i) => (
                    <div 
                      key={i}
                      onClick={() => !loading && setSelectedThumbnail(url)}
                      className={`relative ${type === 'reel' ? 'aspect-[9/16]' : 'aspect-video'} rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedThumbnail === url ? 'border-purple-500 ring-4 ring-purple-500/20' : 'border-transparent hover:border-white/20'}`}
                    >
                      <img src={url} className="w-full h-full object-cover" alt={`Option ${i+1}`} />
                      {selectedThumbnail === url && (
                        <div className="absolute top-2 right-2 bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[12px] shadow-lg">
                          <i className="fa-solid fa-check"></i>
                        </div>
                      )}
                    </div>
                  ))}
                  {thumbnailOptions.length === 0 && !thumbnailsGenerating && (
                    <div className={`col-span-3 ${type === 'reel' ? 'aspect-[16/9]' : 'aspect-[3/1]'} bg-white/5 rounded-xl flex flex-col items-center justify-center border border-white/5 border-dashed`}>
                      <p className="text-xs text-white/40 mb-2">Generate a topic first to get AI {type === 'reel' ? 'vertical' : ''} thumbnails</p>
                      <i className="fa-solid fa-wand-magic-sparkles text-white/10 text-2xl"></i>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-white/60 mb-3">Content Type</label>
              <div className="flex gap-4">
                <button 
                  disabled={loading}
                  onClick={() => setType('video')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold text-sm ${type === 'video' ? 'border-red-600 bg-red-600/10 shadow-[0_0_15px_rgba(220,38,38,0.1)]' : 'border-white/5 hover:bg-white/5 opacity-50'} disabled:opacity-50`}
                >
                  <i className="fa-solid fa-clapperboard"></i>
                  Standard Video
                </button>
                <button 
                  disabled={loading}
                  onClick={() => setType('reel')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold text-sm ${type === 'reel' ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-white/5 hover:bg-white/5 opacity-50'} disabled:opacity-50`}
                >
                  <i className="fa-solid fa-bolt-lightning"></i>
                  Nexus Reel
                </button>
              </div>
              <p className="text-[10px] text-white/30 mt-3 italic text-center">
                {type === 'reel' 
                  ? 'Reels are optimized for mobile viewing and recommended in vertical feeds.' 
                  : 'Standard videos support wide-screen cinematic metadata and high-res playback.'}
              </p>
            </div>
          </div>

          {/* AI Metadata Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/60">
                AI {type === 'reel' ? 'Reel' : 'Video'} Strategy Generator
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  disabled={loading}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={`What is this ${type === 'reel' ? 'reel' : 'video'} about?`}
                  className="flex-1 bg-[#121212] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-600 disabled:opacity-50"
                />
                <button 
                  onClick={generateAI}
                  disabled={aiGenerating || !topic || loading}
                  className={`${type === 'reel' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-purple-600 hover:bg-purple-700'} disabled:opacity-50 px-4 rounded-lg font-bold transition-all flex items-center gap-2 text-sm shadow-lg`}
                >
                  {aiGenerating ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                  AI
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white/60 mb-1">Title</label>
                <input 
                  type="text" 
                  disabled={loading}
                  value={metadata.title}
                  onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                  className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-2 focus:outline-none text-sm disabled:opacity-50"
                  placeholder={type === 'reel' ? "Catchy Reel Hook Title" : "Compelling Video Title"}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white/60 mb-1">Description</label>
                <textarea 
                  rows={6}
                  disabled={loading}
                  value={metadata.description}
                  onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                  className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-2 focus:outline-none resize-none text-xs leading-relaxed disabled:opacity-50"
                  placeholder="Tell your audience about your content..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white/60 mb-1">Hashtags & Tags</label>
                <div className="flex flex-wrap gap-2 p-3 bg-[#121212] rounded-lg border border-white/10 min-h-[60px]">
                  {metadata.tags.length > 0 ? (
                    metadata.tags.map((tag, idx) => (
                      <span key={idx} className={`px-2 py-1 rounded text-[10px] border ${type === 'reel' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-white/5 text-white/60 border-white/5'}`}>
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-white/20 italic">Use AI to generate viral tags.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              {loading ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-white/40 uppercase tracking-widest">Processing Content</span>
                    <span className={`${type === 'reel' ? 'text-yellow-500' : 'text-red-500'} font-mono text-base`}>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(220,38,38,0.3)] ${type === 'reel' ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-gradient-to-r from-red-600 to-orange-500'}`}
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-center text-[10px] text-white/20 animate-pulse italic">
                    Finalizing {type === 'reel' ? 'vertical' : ''} encoding and metadata indexing...
                  </p>
                </div>
              ) : (
                <button 
                  onClick={handleUpload}
                  disabled={loading || !file || !metadata.title}
                  className={`w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-3 shadow-xl ${type === 'reel' ? 'bg-yellow-600 hover:bg-yellow-700 text-black' : 'bg-red-600 hover:bg-red-700 text-white'} disabled:opacity-50`}
                >
                  <i className={`fa-solid ${type === 'reel' ? 'fa-bolt' : 'fa-cloud-arrow-up'}`}></i>
                  Publish {type === 'reel' ? 'Nexus Reel' : 'Video'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Uploader;
