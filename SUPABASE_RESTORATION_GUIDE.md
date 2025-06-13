# 🔄 Supabase Restoration Guide - News Article Storage

## 🎯 **Hybrid Solution: Supabase + Cloudflare R2**

I've set up a **hybrid approach** that gives you the best of both worlds:
- **Supabase**: For storing news articles, categories, and structured data
- **Cloudflare R2**: For storing images, videos, and media files

## ✅ **What I've Updated**

### **1. Restored Supabase Packages**
- ✅ Added `@supabase/supabase-js` back to package.json
- ✅ Added `@supabase/ssr` for server-side rendering
- ✅ Updated Supabase client to be real (not mock)

### **2. Updated API Routes**
- ✅ `app/api/admin/news/route.ts` - Now saves to Supabase
- ✅ Real database operations for CREATE and READ
- ✅ Proper error handling and logging

### **3. Environment Configuration**
- ✅ Updated `.env.example` with Supabase variables
- ✅ Supports both Supabase and R2 configurations

## 🔧 **Setup Instructions**

### **Step 1: Install Dependencies**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### **Step 2: Set Up Environment Variables**
Create/update your `.env.local` file:

```env
# Supabase Configuration (Database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudflare R2 Configuration (Media Storage)
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=your_r2_bucket_name
NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket.your-domain.com

# ImgBB Configuration (Emergency Fallback)
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

### **Step 3: Set Up Supabase Database**

#### **Create Tables in Supabase:**

**1. Categories Table:**
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**2. News Articles Table:**
```sql
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  video_url TEXT,
  video_type TEXT,
  author TEXT DEFAULT 'Admin',
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**3. Insert Sample Categories:**
```sql
INSERT INTO categories (name, slug) VALUES
('General', 'general'),
('Politics', 'politics'),
('Sports', 'sports'),
('Technology', 'technology'),
('Entertainment', 'entertainment');
```

### **Step 4: Configure Row Level Security (Optional)**
```sql
-- Enable RLS
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON news_articles FOR SELECT USING (published = true);
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);

-- Allow admin write access (you'll need to set up authentication)
CREATE POLICY "Allow admin write access" ON news_articles FOR ALL USING (true);
CREATE POLICY "Allow admin write access" ON categories FOR ALL USING (true);
```

## 🚀 **How It Works Now**

### **News Article Creation Flow:**
1. **User uploads image** → Goes to **Cloudflare R2**
2. **User fills form** → Article data goes to **Supabase**
3. **Image URL from R2** → Stored in Supabase article record
4. **Result**: Article stored in database, media in R2

### **Benefits:**
- ✅ **Structured Data**: Articles, categories in Supabase
- ✅ **Media Storage**: Images, videos in R2 (cost-effective)
- ✅ **Real Database**: Proper queries, relationships, search
- ✅ **Scalable**: Best of both platforms

## 🧪 **Testing the Setup**

### **1. Test Database Connection:**
```bash
# In your project directory
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.from('categories').select('*').then(console.log);
"
```

### **2. Test Article Creation:**
1. Go to Admin Panel → Add News
2. Fill out form with title and content
3. Upload an image (goes to R2)
4. Submit form (article goes to Supabase)
5. Check Supabase dashboard for new record

## 🔍 **Troubleshooting**

### **If Articles Still Don't Save:**
1. **Check Environment Variables**: Make sure Supabase URL and keys are correct
2. **Check Database Tables**: Ensure tables exist in Supabase
3. **Check Console Logs**: Look for error messages in browser/server logs
4. **Check Supabase Dashboard**: Verify data is being inserted

### **Common Issues:**
- **"relation does not exist"**: Tables not created
- **"permission denied"**: RLS policies too restrictive
- **"invalid input syntax"**: Data type mismatch

## 📊 **Current Architecture**

```
Frontend (Next.js)
    ↓
Admin API (/api/admin/news)
    ↓
┌─────────────────┬─────────────────┐
│   Supabase      │  Cloudflare R2  │
│   (Database)    │  (Media Files)  │
│                 │                 │
│ • Articles      │ • Images        │
│ • Categories    │ • Videos        │
│ • Metadata      │ • Documents     │
└─────────────────┴─────────────────┘
```

## 🎉 **Expected Result**

After setup, when you create a news article:
- ✅ Article data saves to Supabase database
- ✅ Images upload to Cloudflare R2
- ✅ Article references R2 image URLs
- ✅ You can query/search articles in Supabase
- ✅ Media is served from R2 CDN

**Your news articles will now be properly stored in Supabase!** 🚀
