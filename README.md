# FlipNews

FlipNews is a modern news application that displays articles in a card format with a vertical swipe navigation system. Users can swipe up or down to navigate between news articles and ads.

## Features

- Vertical swipe navigation for news articles
- Clean, minimalist UI with white background and black text
- Read More functionality for longer articles
- Engagement metrics display (likes, comments, views)
- Admin panel for content management
- Category management
- Ad management with frequency control
- Media upload capabilities
- Supabase database integration

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Swiper.js
- Supabase (PostgreSQL database, authentication, storage)

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn
- Supabase account (for database)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/flipnews.git
cd flipnews
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
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Database Setup

See the `DEPLOYMENT.md` file for detailed instructions on setting up the Supabase database.

## Admin Panel

Access the admin panel at [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Default login credentials:
- Email: admin@flipnews.com
- Password: admin123

## Deployment

This project is configured for easy deployment on Vercel with a Supabase database.

For detailed deployment instructions, see the `DEPLOYMENT.md` file.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
