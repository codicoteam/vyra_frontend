export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  username: string;
}

export interface Attachment {
  name: string;
  size: string;
  type: string;
  url: string;
}

export interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: Author;
  isAnonymous: boolean;
  readingTime: number; // in minutes
  publishedDate: string;
  likes: number;
  bookmarks: number;
  isResearch?: boolean;
  hasAttachments?: boolean;
  attachments?: Attachment[];
  doi?: string;
  urgency?: 'high' | 'medium' | 'low';
  goalProgress?: number; // for campaign-style posts
  isCampaign?: boolean;
  allowComments?: boolean;
  commentCount?: number;
}

export interface UserProfileData {
  id: string;
  username: string;
  name: string;
  email?: string;
  avatar: string;
  bannerImage: string;
  bio: string;
  role?: 'USER' | 'AUTHOR' | 'EDITOR' | 'ADMIN';
  followersCount: number;
  followingCount: number;
  storiesCount: number;
  website?: string;
  location?: string;
  twitter?: string;
  isVerified?: boolean;
  isBanned?: boolean;
  banReason?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  count: number;
  iconName: string;
  colorClass: string;
}

export interface NotificationItem {
  id: string;
  type: 'story' | 'like' | 'follow' | 'digest' | 'system';
  title: string;
  text: string;
  date: string;
  isRead: boolean;
  sender?: {
    name: string;
    avatar: string;
    username: string;
  };
}

export interface CommentItem {
  id: string;
  postId: string;
  userId: string;
  parentId?: string | null;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
  };
  replies?: CommentItem[];
}

export interface AdminStats {
  totalUsers: number;
  publishedStories: number;
  anonymousStories: number;
  pendingReviews: number;
}
