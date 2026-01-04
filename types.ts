
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  followers: number;
  joinedAt: string;
  role: 'admin' | 'user';
  isBlocked: boolean;
  monetized: boolean;
  isVerified?: boolean;
  isSuspended?: boolean;
  warningCount?: number;
  subscriptions?: string[];
  likedVideos?: string[];
  watchHistory?: string[];
  storageUsed?: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail: string;
  videoUrl: string;
  authorId: string;
  authorName: string;
  views: number;
  likes: number;
  createdAt: string;
  type: 'video' | 'reel';
  viewHistory: { timestamp: string; count: number }[];
  size?: number;
}

export interface Report {
  id: string;
  type: 'video' | 'user';
  targetId: string;
  targetName: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  userId: string; // 'global' for all users
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface SystemLog {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'info' | 'warning' | 'danger' | 'success';
}

export interface AppState {
  currentUser: User | null;
  videos: Video[];
  isStudio: boolean;
}
