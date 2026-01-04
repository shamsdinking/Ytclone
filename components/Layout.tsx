
import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: any;
  onLogout: () => void;
  onLogin: () => void;
  canGoBack?: boolean;
  onBack?: () => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onShareClick?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout, 
  onLogin,
  canGoBack,
  onBack,
  onSearch,
  searchQuery = '',
  onShareClick
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(localSearch);
    setActiveTab('home');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0f0f0f]">
      {/* Header with Enhanced Glassmorphism */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/20">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {canGoBack && (
              <button 
                onClick={onBack}
                className="p-2 mr-2 hover:bg-white/10 rounded-full transition-all duration-300 text-white animate-in slide-in-from-left-2 fade-in"
                aria-label="Go Back"
              >
                <i className="fa-solid fa-arrow-left text-lg"></i>
              </button>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:block"
              aria-label="Toggle Sidebar"
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>
          </div>
          
          <div 
            className="flex items-center gap-1.5 cursor-pointer group"
            onClick={() => {
              if (onSearch) onSearch('');
              setLocalSearch('');
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <i className="fa-brands fa-youtube text-red-600 text-3xl group-hover:scale-110 transition-transform"></i>
            <span className="text-xl font-black tracking-tighter">NexusVideo</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl px-8 hidden md:block">
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <div className="relative w-full">
               <input 
                type="text" 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search Nexus..." 
                className="w-full bg-[#121212] border border-white/10 rounded-l-full px-5 py-2.5 focus:outline-none focus:border-red-600/50 transition-all text-sm font-medium"
              />
              {localSearch && (
                <button 
                  type="button"
                  onClick={() => {setLocalSearch(''); if(onSearch) onSearch('');}}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              )}
            </div>
            <button type="submit" className="bg-white/5 border-y border-r border-white/10 rounded-r-full px-6 py-2.5 hover:bg-white/10 transition-colors">
              <i className="fa-solid fa-magnifying-glass text-white/60"></i>
            </button>
            <button type="button" className="ml-4 p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all group">
              <i className="fa-solid fa-microphone text-white/40 group-hover:text-red-500"></i>
            </button>
          </form>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onShareClick}
            className="p-2.5 hover:bg-white/10 rounded-full transition-all text-white/60 hover:text-white"
            title="Share Platform"
          >
            <i className="fa-solid fa-share-nodes text-lg"></i>
          </button>
          
          {user ? (
            <>
              <button 
                onClick={() => setActiveTab('studio')}
                className="hidden sm:flex items-center gap-2 bg-red-600 hover:bg-red-700 px-5 py-2 rounded-full font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95"
              >
                <i className="fa-solid fa-plus"></i>
                Create
              </button>
              <div className="flex items-center gap-4">
                <div 
                  className="w-9 h-9 rounded-full overflow-hidden cursor-pointer ring-2 ring-transparent hover:ring-red-600 transition-all" 
                  onClick={onLogout} 
                  title="Logout"
                >
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
            </>
          ) : (
            <button 
              onClick={onLogin}
              className="flex items-center gap-2 border border-white/20 text-blue-400 px-4 py-1.5 rounded-full hover:bg-blue-400/10 transition-all font-bold"
            >
              <i className="fa-regular fa-circle-user text-lg"></i>
              Sign in
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav 
          className={`bg-[#0f0f0f] overflow-y-auto hidden sm:block p-3 transition-all duration-300 ease-in-out border-r border-white/5 ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
          <div className="space-y-1">
            <SidebarItem icon="fa-house" label="Home" active={activeTab === 'home' && !canGoBack} onClick={() => { if (onBack) onBack(); setActiveTab('home'); }} isCollapsed={isCollapsed} />
            <SidebarItem icon="fa-bolt" label="Shorts" active={activeTab === 'shorts'} onClick={() => setActiveTab('shorts')} isCollapsed={isCollapsed} color="text-yellow-500" />
            <div className={`my-3 border-t border-white/10 transition-all ${isCollapsed ? 'mx-2' : 'mx-0'}`} />
            <SidebarItem icon="fa-user-gear" label="Studio" active={activeTab === 'studio'} onClick={() => setActiveTab('studio')} isCollapsed={isCollapsed} />
            <SidebarItem icon="fa-clock-rotate-left" label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} isCollapsed={isCollapsed} />
            {/* Fix: Use 'activeTab' instead of undefined 'activeSubTab' */}
            {user?.role === 'admin' && (
              <SidebarItem icon="fa-user-shield" label="Admin HQ" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} isCollapsed={isCollapsed} color="text-red-500" />
            )}
          </div>

          {!isCollapsed && (
            <div className="mt-10 px-4">
               <div className="bg-gradient-to-tr from-red-600/10 to-purple-600/10 border border-white/5 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Nexus Pro</p>
                  <p className="text-xs font-bold leading-tight mb-3">Upgrade for 4K streaming and no ads.</p>
                  <button className="w-full bg-white text-black text-[10px] font-black uppercase tracking-widest py-2 rounded-lg hover:scale-105 transition-transform">Learn More</button>
               </div>
            </div>
          )}
        </nav>

        {/* Content */}
        <main className={`flex-1 overflow-y-auto bg-[#0f0f0f] ${activeTab === 'shorts' ? 'no-scrollbar' : ''}`}>
          {children}
        </main>
      </div>

      {/* Mobile Nav */}
      <footer className="sm:hidden grid grid-cols-5 bg-[#0f0f0f]/90 backdrop-blur-md border-t border-white/5 p-2 pb-safe">
         <MobileNavItem icon="fa-house" label="Home" active={activeTab === 'home' && !canGoBack} onClick={() => { if (onBack) onBack(); setActiveTab('home'); }} />
         <MobileNavItem icon="fa-bolt" label="Shorts" active={activeTab === 'shorts'} onClick={() => setActiveTab('shorts')} />
         <MobileNavItem icon="fa-plus-circle" label="Create" active={activeTab === 'studio'} onClick={() => setActiveTab('studio')} />
         <MobileNavItem icon="fa-clock-rotate-left" label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
         <MobileNavItem icon="fa-user" label="Profile" active={false} onClick={() => {}} />
      </footer>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick, isCollapsed, color }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center rounded-xl transition-all ${isCollapsed ? 'justify-center p-3.5' : 'gap-4 px-4 py-3'} ${active ? 'bg-white/10 font-bold text-white shadow-sm' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
  >
    <i className={`fa-solid ${icon} text-lg w-6 text-center ${active ? (color || 'text-red-600') : ''}`}></i>
    {!isCollapsed && <span className="text-sm tracking-tight">{label}</span>}
  </button>
);

const MobileNavItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 py-1">
    <i className={`fa-solid ${icon} ${active ? 'text-white' : 'text-white/40'} text-lg transition-colors`}></i>
    <span className={`text-[9px] uppercase font-black tracking-widest ${active ? 'text-white' : 'text-white/40'}`}>{label}</span>
  </button>
);

export default Layout;
