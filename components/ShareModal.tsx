
import React, { useState } from 'react';

interface ShareModalProps {
  onClose: () => void;
  title?: string;
  url?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose, title = "NexusVideo", url = window.location.href }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check this out on NexusVideo: ${title}`,
          url: url,
        });
      } catch (err) {
        console.warn("Error sharing:", err);
      }
    }
  };

  const socialLinks = [
    { name: 'WhatsApp', icon: 'fa-whatsapp', color: 'bg-[#25D366]', link: `https://wa.me/?text=Check out this on NexusVideo: ${url}` },
    { name: 'Twitter', icon: 'fa-x-twitter', color: 'bg-[#000000]', link: `https://twitter.com/intent/tweet?text=Check out this on NexusVideo&url=${url}` },
    { name: 'Facebook', icon: 'fa-facebook-f', color: 'bg-[#1877F2]', link: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
    { name: 'Email', icon: 'fa-envelope', color: 'bg-[#EA4335]', link: `mailto:?subject=NexusVideo Content&body=Check this out: ${url}` },
  ];

  const hasNativeShare = typeof navigator.share === 'function';

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        className="bg-[#1a1a1a] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-black tracking-tight">Share {title === "NexusVideo" ? "Platform" : "Content"}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Social Icons */}
          <div className="grid grid-cols-4 gap-4">
            {socialLinks.map((social) => (
              <a 
                key={social.name}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-12 h-12 ${social.color} rounded-2xl flex items-center justify-center text-xl text-white shadow-lg transition-transform group-hover:scale-110 group-hover:-translate-y-1`}>
                  <i className={`fa-brands ${social.icon}`}></i>
                </div>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{social.name}</span>
              </a>
            ))}
          </div>

          {/* Shareable Link Container */}
          <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Copy Link</label>
              {hasNativeShare && (
                <button 
                  onClick={handleNativeShare}
                  className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest"
                >
                  <i className="fa-solid fa-up-right-from-square mr-1"></i>
                  Native Share
                </button>
              )}
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-purple-600/20 rounded-2xl blur group-hover:blur-md transition-all opacity-50"></div>
              <div className="relative flex items-center bg-[#121212] border border-white/10 rounded-2xl p-1 overflow-hidden">
                <input 
                  type="text" 
                  readOnly 
                  value={url}
                  className="bg-transparent flex-1 px-4 py-3 text-sm font-medium text-white/80 focus:outline-none truncate"
                />
                <button 
                  onClick={handleCopy}
                  className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${copied ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-white/90'}`}
                >
                  {copied ? (
                    <span className="flex items-center gap-2"><i className="fa-solid fa-check"></i> Copied</span>
                  ) : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-center text-white/20 font-bold uppercase tracking-[0.1em]">
            Spread the word and build the Nexus community.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
