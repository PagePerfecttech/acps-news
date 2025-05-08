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
  rss_feed_id?: string;
  rss_item_guid?: string;
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
  password?: string; // Optional in the interface but required for new users
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

export interface RssFeed {
  id: string;
  name: string;
  url: string;
  category_id: string;
  user_id: string;
  active: boolean;
  last_fetched: string | null;
  fetch_frequency: number;
  created_at: string;
  updated_at: string;
}

export interface RssFeedItem {
  id: string;
  feed_id: string;
  guid: string;
  title: string;
  link: string | null;
  pub_date: string | null;
  news_article_id: string | null;
  imported: boolean;
  created_at: string;
}
