export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  image_url?: string;
  video_url?: string;
  video_type?: 'youtube' | 'uploaded';
  created_at: string;
  updated_at: string;
  author: string;
  likes: number;
  comments: Comment[];
  tags?: string[];
  published: boolean;
}

export interface Comment {
  id: string;
  news_id: string;
  content: string;
  author_ip: string;
  created_at: string;
  approved: boolean;
}

export interface Like {
  id: string;
  news_id: string;
  ip_address: string;
  created_at: string;
}

export interface Ad {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  video_type?: 'youtube' | 'uploaded';
  text_content?: string;
  link_url: string;
  frequency: number; // How often the ad should appear (e.g., every X articles)
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'contributor';
  profile_pic?: string;
  bio?: string;
  created_at: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}
