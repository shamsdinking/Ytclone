
import { useState, useEffect } from 'react';
import { User, Video, Comment, SystemLog, Report, SystemNotification } from '../types';

const INITIAL_USERS: User[] = [
  {
    id: 'admin_1',
    name: 'Shams',
    email: 'shams@gmail.com',
    password: '1234567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shams',
    followers: 1200000,
    joinedAt: new Date('2023-01-01').toISOString(),
    role: 'admin',
    isBlocked: false,
    monetized: true,
    isVerified: true,
    warningCount: 0,
    subscriptions: [],
    likedVideos: [],
    watchHistory: [],
    storageUsed: 450
  }
];

const STARTER_VIDEOS: Video[] = [
  {
    id: 'start_1',
    title: 'Nexus: The Future of AI Architecture',
    description: 'Exploring the nexus of human design and machine intelligence.',
    tags: ['AI', 'Tech', 'Nexus', 'Future'],
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2000&auto=format&fit=crop',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    authorId: 'admin_1',
    authorName: 'Shams',
    views: 12500,
    likes: 890,
    createdAt: new Date().toISOString(),
    type: 'video',
    viewHistory: []
  },
  {
    id: 'start_2',
    title: 'Cyberpunk Tokyo Reel',
    description: 'A neon journey through the future. #Neon #Cyberpunk',
    tags: ['Cyberpunk', 'Neon', 'Cinematic', 'Tokyo'],
    thumbnail: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?q=80&w=2000&auto=format&fit=crop',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    authorId: 'admin_1',
    authorName: 'Shams',
    views: 54000,
    likes: 4200,
    createdAt: new Date().toISOString(),
    type: 'reel',
    viewHistory: []
  }
];

export const useStore = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nexus_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('nexus_all_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [videos, setVideos] = useState<Video[]>(() => {
    const saved = localStorage.getItem('nexus_videos');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.length > 0 ? parsed : STARTER_VIDEOS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('nexus_comments');
    return saved ? JSON.parse(saved) : [];
  });

  const [logs, setLogs] = useState<SystemLog[]>(() => {
    const saved = localStorage.getItem('nexus_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem('nexus_reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('nexus_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'home' | 'shorts' | 'studio' | 'admin' | 'channel' | 'history'>('home');
  const [viewingChannelId, setViewingChannelId] = useState<string | null>(null);
  
  // Like Cooldown State
  const [lastLikeTimestamp, setLastLikeTimestamp] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem('nexus_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('nexus_all_users', JSON.stringify(users));
    localStorage.setItem('nexus_videos', JSON.stringify(videos));
    localStorage.setItem('nexus_comments', JSON.stringify(comments));
    localStorage.setItem('nexus_logs', JSON.stringify(logs));
    localStorage.setItem('nexus_reports', JSON.stringify(reports));
    localStorage.setItem('nexus_notifications', JSON.stringify(notifications));
  }, [users, videos, comments, logs, reports, notifications]);

  const addLog = (action: string, target: string, type: SystemLog['type'] = 'info') => {
    const newLog: SystemLog = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      target,
      timestamp: new Date().toISOString(),
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100));
  };

  const login = (email: string, pass: string) => {
    const foundUser = users.find(u => u.email === email && u.password === pass);
    if (foundUser) {
      if (foundUser.isBlocked) return { success: false, message: "Your account has been restricted." };
      setUser(foundUser);
      addLog('User Login', foundUser.email, 'success');
      return { success: true };
    }
    return { success: false, message: "Invalid credentials." };
  };

  const toggleLike = (videoId: string) => {
    if (!user) return;
    
    const now = Date.now();
    const cooldown = 10000; // 10s cooldown
    if (now - lastLikeTimestamp < cooldown) {
      const wait = Math.ceil((cooldown - (now - lastLikeTimestamp)) / 1000);
      alert(`Rate limited! Please wait ${wait}s before liking again.`);
      return;
    }

    const likedVideos = [...(user.likedVideos || [])];
    const index = likedVideos.indexOf(videoId);
    let delta = 0;

    if (index > -1) {
      likedVideos.splice(index, 1);
      delta = -1;
    } else {
      likedVideos.push(videoId);
      delta = 1;
    }

    setLastLikeTimestamp(now);
    setUser({ ...user, likedVideos });
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, likes: v.likes + delta } : v));
  };

  return {
    user, users, videos, comments, logs, reports, notifications, activeTab, viewingChannelId,
    setActiveTab, login, logout: () => setUser(null),
    addVideo: (v: Video) => setVideos(prev => [v, ...prev]),
    deleteVideo: (id: string) => setVideos(prev => prev.filter(v => v.id !== id)),
    toggleLike,
    incrementView: (id: string) => setVideos(prev => prev.map(v => v.id === id ? {...v, views: v.views + 1} : v)),
    addToHistory: (id: string) => {
      if(!user) return;
      const history = [id, ...(user.watchHistory || []).filter(vid => vid !== id)].slice(0, 50);
      setUser({...user, watchHistory: history});
    },
    openChannel: (id: string) => { setViewingChannelId(id); setActiveTab('channel'); },
    clearHistory: () => user && setUser({...user, watchHistory: []}),
    addComment: (videoId: string, text: string) => {
      if (!user) return;
      const c: Comment = { id: Math.random().toString(36).substr(2,9), videoId, userId: user.id, userName: user.name, userAvatar: user.avatar, text, createdAt: new Date().toISOString() };
      setComments(prev => [c, ...prev]);
    },
    toggleSubscribe: (authorId: string) => {
      if (!user || user.id === authorId) return;
      const subs = [...(user.subscriptions || [])];
      const idx = subs.indexOf(authorId);
      const delta = idx > -1 ? -1 : 1;
      if (idx > -1) subs.splice(idx, 1); else subs.push(authorId);
      setUser({ ...user, subscriptions: subs });
      setUsers(prev => prev.map(u => u.id === authorId ? { ...u, followers: u.followers + delta } : u));
    }
  };
};
