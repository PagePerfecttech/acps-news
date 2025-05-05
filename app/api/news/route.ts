import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// GET /api/news - Get all news articles
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('news_articles')
      .select(`
        *,
        categories(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (category) {
      // Join with categories and filter by category slug
      query = query.eq('categories.slug', category);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('news_articles')
      .select('*', { count: 'exact' });

    if (countError) {
      throw countError;
    }

    return NextResponse.json({
      data,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count! / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news articles' },
      { status: 500 }
    );
  }
}

// POST /api/news - Create a new news article
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content || !body.category_id) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    // Insert the news article
    const { data, error } = await supabase
      .from('news_articles')
      .insert([
        {
          title: body.title,
          content: body.content,
          summary: body.summary,
          category_id: body.category_id,
          image_url: body.image_url,
          video_url: body.video_url,
          video_type: body.video_type,
          author: body.author,
          published: body.published
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    // If there are tags, insert them
    if (body.tags && body.tags.length > 0 && data && data[0]) {
      const newsId = data[0].id;
      
      // Process each tag
      for (const tagName of body.tags) {
        // Check if tag exists
        const { data: existingTag, error: tagError } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .single();

        if (tagError && tagError.code !== 'PGRST116') { // PGRST116 is "not found"
          throw tagError;
        }

        let tagId;
        
        if (!existingTag) {
          // Create new tag
          const { data: newTag, error: createTagError } = await supabase
            .from('tags')
            .insert([{ name: tagName }])
            .select();

          if (createTagError) {
            throw createTagError;
          }
          
          tagId = newTag![0].id;
        } else {
          tagId = existingTag.id;
        }

        // Create relationship between news and tag
        const { error: relationError } = await supabase
          .from('news_tags')
          .insert([{ news_id: newsId, tag_id: tagId }]);

        if (relationError) {
          throw relationError;
        }
      }
    }

    return NextResponse.json({ data: data![0] });
  } catch (error) {
    console.error('Error creating news article:', error);
    return NextResponse.json(
      { error: 'Failed to create news article' },
      { status: 500 }
    );
  }
}
