# Vizag News 📰

Vizag News is a modern Telugu news application that displays articles in a card format with a vertical swipe navigation system. Built specifically for Telugu-speaking audiences, it provides an intuitive and engaging way to consume news content.

## ✨ Features

### 🎯 Core Features
- **Vertical Swipe Navigation** - Smooth swipe up/down to navigate between articles
- **Telugu Content Support** - Full support for Telugu language content
- **Clean, Minimalist UI** - White background with black text for optimal readability
- **Read More Functionality** - Expandable content for longer articles
- **Engagement Metrics** - Display likes, comments, and views
- **Background Logo Management** - Customizable background branding with opacity control

### 🛠️ Admin Features
- **Complete Admin Panel** - Full content management system
- **Background Logo Upload** - Upload and manage background logos from admin panel
- **Opacity Control** - Adjust background logo opacity (5%-50%)
- **Category Management** - Organize news by categories (సినిమా, రాజకీయం, క్రీడలు, etc.)
- **Ad Management** - Control ad frequency and placement
- **Media Upload** - Support for images and videos
- **Real-time Preview** - See changes instantly

### 🔧 Technical Features
- **Supabase Integration** - PostgreSQL database with real-time capabilities
- **Responsive Design** - Works perfectly on all devices
- **SEO Optimized** - Meta tags and structured data
- **Performance Optimized** - Fast loading and smooth animations

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Navigation**: Swiper.js for smooth vertical scrolling
- **Database**: Supabase (PostgreSQL with real-time capabilities)
- **Storage**: Cloudinary for media storage and transformations
- **Deployment**: Vercel-ready configuration

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn
- Supabase account (for database)
- Cloudinary account (for media storage)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/vizag-news.git
cd vizag-news
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
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

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
- Email: admin@vizagnews.com
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

- **Main Feed**: Vertical swipe navigation with Telugu news
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

- Built with ❤️ for the Telugu community
- Special thanks to the open-source community
- Powered by Supabase and Vercel
