// Define types for the application

// News Article
export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category?: string;
  category_id?: string;
  author: string;
  image_url?: string;
  video_url?: string;
  video_type?: 'youtube' | 'uploaded';
  tags: string[];
  likes: number;
  views: number;
  published: boolean;
  comments: Comment[];
  created_at: string;
  updated_at: string;
}

// Comment
export interface Comment {
  id: string;
  news_id: string;
  user_id?: string;
  author?: string;
  content: string;
  created_at: string;
}

// Ad
export interface Ad {
  id: string;
  title: string;
  description?: string;
  text_content?: string;
  image_url?: string;
  video_url?: string;
  video_type?: 'youtube' | 'uploaded';
  link_url?: string;
  frequency?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Category
export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

// User
export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'sub-admin';
  created_at: string;
  updated_at: string;
}

// Settings
export interface Settings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
  autoplay: boolean;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
