# FlipNews - News Card Swiper Application

## Project Overview

FlipNews is a modern news application that displays news articles in a card format with a swipe-based interface. Users can swipe up for the next news article and swipe down for the previous one. The application features a clean, minimalist UI focused on content consumption.

## Key Features

- **Card-Based News Interface**: Full-screen news cards with swipe navigation
- **Media Support**: Display images and videos in news cards
- **Read More Functionality**: Expandable content with popup for longer articles
- **Admin Panel**: Manage news, categories, ads, and application settings
- **RSS Feed Integration**: Automatically import news from RSS feeds
- **User Management**: Create and manage user accounts with different permissions
- **Share Functionality**: Share news cards with customizable screenshot format
- **Responsive Design**: Works on mobile and desktop devices
- **Real-time Statistics**: Track engagement metrics for news articles

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- Git
- A Supabase account (for database and authentication)

## Environment Setup

1. Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Replace `your_supabase_url` and `your_supabase_anon_key` with your actual Supabase project credentials.

## Database Setup

1. Create a new Supabase project
2. Set up the following tables in your Supabase database:

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### News Table
```sql
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  video_type TEXT,
  category_id UUID REFERENCES categories(id),
  author_id UUID REFERENCES users(id),
  published BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Ads Table
```sql
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  link_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Settings Table
```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT DEFAULT 'FlipNews',
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#8B5CF6',
  share_link TEXT DEFAULT 'https://flipnews.vercel.app',
  ad_frequency INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### RSS Feeds Table
```sql
CREATE TABLE rss_feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  active BOOLEAN DEFAULT true,
  last_fetched TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/PagePerfecttech/FlipNEWS.git
cd FlipNews
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Building for Production

1. Build the application:
```bash
npm run build
# or
yarn build
```

2. Start the production server:
```bash
npm start
# or
yarn start
```

## Deployment to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure the environment variables in Vercel:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Deploy the application

## Project Structure

```
FlipNews/
├── app/                  # Next.js app directory
│   ├── admin/            # Admin panel pages
│   ├── api/              # API routes
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and services
│   ├── utils/            # Helper utilities
│   ├── layout.tsx        # Root layout component
│   └── page.tsx          # Home page component
├── public/               # Static assets
├── styles/               # Global styles
├── .env.local            # Environment variables (create this file)
├── next.config.js        # Next.js configuration
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

## Usage Guide

### User Interface

- **News Cards**: Swipe up for next news, swipe down for previous news
- **Read More**: Click the "Read More" button to view the full article
- **Share**: Use the share button to share the news article
- **Like**: Like news articles to show appreciation
- **Comment**: Comment on news articles to engage with the content

### Admin Panel

Access the admin panel at `/admin` with an admin account.

- **Dashboard**: View statistics and analytics
- **News**: Create, edit, and delete news articles
- **Categories**: Manage news categories
- **Users**: Manage user accounts
- **Ads**: Create and manage advertisements
- **RSS Feeds**: Configure RSS feed sources
- **Settings**: Customize application settings

## Troubleshooting

### Common Issues

1. **Image uploads not working**:
   - Check Supabase storage bucket permissions
   - Ensure the correct storage bucket is configured

2. **RSS feeds not displaying**:
   - Verify the RSS feed URL is valid and accessible
   - Check the category mapping in the RSS feed configuration

3. **App name not updating**:
   - Clear browser cache after changing settings
   - Ensure the settings are properly saved in the database

4. **Share functionality issues**:
   - Check if the browser supports the Web Share API
   - Ensure the screenshot utility has proper permissions

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.
