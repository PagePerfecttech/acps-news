# ACPS News 📰

ACPS News is a modern news application that displays articles in a card format with a vertical swipe navigation system. Built to provide an intuitive and engaging way to consume news content with a focus on educational and community news.

> **🎉 Latest Update**: All systems fully operational! Complete ads management, enhanced share functionality, and 100% Supabase integration.

## ✨ Features

### 🎯 Core Features
- **Vertical Swipe Navigation** - Smooth swipe up/down to navigate between articles
- **Multi-language Content Support** - Support for multiple languages including English and regional languages
- **Clean, Minimalist UI** - White background with black text for optimal readability
- **Read More Functionality** - Expandable content for longer articles
- **Engagement Metrics** - Display likes, comments, and views
- **Background Logo Management** - Customizable background branding with opacity control

### 🛠️ Admin Features
- **Complete Admin Panel** - Full content management system with Supabase integration
- **Ads Management** - Create, edit, delete advertisements with frequency control
- **News Management** - Full CRUD operations for news articles
- **Category Management** - Organize news by categories (Education, Sports, Community, etc.)
- **Media Upload** - Cloudflare R2 integration for images and videos
- **Share Functionality** - Complete page screenshot sharing on social media
- **Real-time Preview** - See changes instantly
- **Background Logo Upload** - Upload and manage background logos with opacity control

### 🔧 Technical Features
- **Supabase Integration** - Complete database integration with real-time updates
- **Cloudflare R2 Storage** - Cost-effective S3-compatible media storage
- **Enhanced Screenshot Sharing** - High-quality page screenshots for social media
- **API-First Architecture** - RESTful APIs for all operations
- **Responsive Design** - Works perfectly on all devices
- **SEO Optimized** - Meta tags and structured data
- **Performance Optimized** - Fast loading and smooth animations
- **Real-time Diagnostics** - Comprehensive health monitoring tools

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Navigation**: Swiper.js for smooth vertical scrolling
- **Database**: Supabase (PostgreSQL) with real-time features
- **Storage**: Cloudflare R2 (S3-compatible) for media storage
- **Screenshots**: html2canvas for page capture and sharing
- **Deployment**: Vercel-ready configuration

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account (for database)
- Cloudflare R2 account (for media storage)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/acps-news.git
cd acps-news
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file with the following variables:
```
# Neon Database Configuration
DATABASE_URL=your_neon_connection_string

# Cloudflare R2 Configuration (Media Storage)
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=your_r2_bucket_name
NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket.your-domain.com
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## 🔧 Database Setup

Run the following scripts to set up your database:

```bash
# Test and setup ads table
node test-ads-setup.js

# Run comprehensive health check
node test-project-health.js
```

Or manually run the SQL script in your Supabase dashboard:
- Execute `scripts/create-ads-table.sql` in Supabase SQL Editor

## 🆕 Latest Updates & Fixes

### ✅ Ads Management System (Fully Working)
- **Complete Supabase Integration**: All CRUD operations working
- **Admin Panel**: Create, edit, delete ads with real-time updates
- **Telugu Sample Data**: Pre-loaded with Telugu advertisements
- **Frequency Control**: Configure ad display frequency

### ✅ Enhanced Share Functionality
- **Page Screenshots**: Captures complete page content for sharing
- **High Quality**: 1.5x scale for crisp, clear images
- **Social Media Ready**: Optimized for WhatsApp, Facebook, Twitter
- **Fallback Handling**: Branded fallback image with Vizag News branding

### ✅ Complete Branding Update
- **Vizag News Branding**: Updated from FlipNews to Vizag News
- **Telugu Integration**: విజయవాడ వార్తలు - Latest Telugu News
- **Consistent URLs**: All links point to vizag-news.vercel.app
- **Proper Fallback Images**: Branded SVG with Telugu text

### ✅ Infrastructure Improvements
- **Environment Variables**: Fixed server configuration issues
- **R2 Upload**: Cloudflare R2 integration working perfectly
- **API Endpoints**: All admin APIs functional
- **Health Monitoring**: Comprehensive diagnostic tools

### 🧪 Testing Tools
- `test-project-health.js`: Complete system health check
- `test-ads-setup.js`: Ads system verification
- `test-server-r2.js`: R2 upload testing

## 🎨 Background Logo Management

One of the unique features of Vizag News is the ability to manage background logos directly from the admin panel:

### How to Use:
1. **Access Admin Panel**: Go to `/admin/login`
2. **Navigate to Settings**: Click "Site Settings" in the sidebar
3. **Upload Background Logo**:
   - Scroll to "Background Logo (Content Area)" section
   - Click upload button or enter URL
   - Adjust opacity with slider (5%-50%)
   - See live preview with sample text
4. **Save Changes**: Click "Save Settings" - changes apply immediately

### Features:
- ✅ **Real-time Preview** - See exactly how the logo will look
- ✅ **Opacity Control** - Fine-tune visibility from 5% to 50%
- ✅ **Multiple Formats** - Support for SVG, PNG, JPG
- ✅ **Responsive** - Automatically scales on all devices
- ✅ **Database Storage** - Settings saved to Supabase

## 🗄️ Database Setup

The application uses Supabase for data storage. Run the provided SQL schema in your Supabase dashboard to set up all required tables.

## Admin Panel

Access the admin panel at [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Default login credentials:
- Email: admin@acpsnews.com
- Password: admin123

## 🚀 Deployment

This project is configured for easy deployment on Vercel:

1. **Push to GitHub** (this repository)
2. **Connect to Vercel** - Import your GitHub repository
3. **Set Environment Variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy** - Automatic deployments on every push

## 📱 Screenshots

- **Main Feed**: Vertical swipe navigation with news articles
- **Admin Panel**: Complete content management system
- **Background Logo**: Customizable branding with opacity control
- **Settings**: Real-time preview and configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the educational community
- Special thanks to the open-source community
- Powered by Supabase and Vercel
