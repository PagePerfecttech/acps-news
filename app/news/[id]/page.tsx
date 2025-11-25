'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiClock, FiTag, FiUser, FiShare2, FiArrowLeft } from 'react-icons/fi';
import { NewsArticle, Comment } from '../../types';
import { getNewsArticleById } from '../../lib/dataService';
import ArticleNotFound from '../../components/ArticleNotFound';
import { useSettings } from '../../contexts/SettingsContext';

// Mock data for demonstration
const mockArticles: Record<string, NewsArticle> = {
  '1': {
    id: '1',
    title: 'Global Tech Summit Announces Breakthrough in AI Research',
    content: `The annual Global Tech Summit has revealed a significant breakthrough in artificial intelligence research. Scientists have developed a new algorithm that can process natural language with unprecedented accuracy, potentially revolutionizing how machines understand human communication.

This development could have far-reaching implications for industries ranging from customer service to healthcare. The research team, led by Dr. Emily Chen, demonstrated the algorithm's capabilities by having it analyze complex medical texts and provide accurate summaries and insights that matched those of experienced medical professionals.

"What makes this breakthrough particularly exciting is that the algorithm requires significantly less training data than previous models," explained Dr. Chen. "This means it can be implemented more widely and at lower cost, making advanced AI capabilities accessible to smaller organizations and developing regions."

Industry experts at the summit noted that the technology could be particularly transformative for global communication, potentially reducing language barriers by providing more nuanced and contextually accurate translations than current systems.

The research has been published in a peer-reviewed journal and the team plans to release an open-source version of the algorithm within the next six months, allowing developers worldwide to build upon their work.`,
    summary: 'Scientists announce major AI breakthrough at Global Tech Summit with potential to transform multiple industries.',
    category: 'Technology',
    image_url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1470&auto=format&fit=crop',
    created_at: '2023-05-15T10:30:00Z',
    updated_at: '2023-05-15T10:30:00Z',
    author: 'Jane Smith',
    tags: ['AI', 'Technology', 'Research'],
    likes: 120,
    views: 1500,
    published: true,
    comments: []
  },
  '2': {
    id: '2',
    title: 'New Climate Policy Receives Bipartisan Support',
    content: `In a rare show of unity, lawmakers from both major political parties have come together to support a comprehensive climate policy. The legislation aims to reduce carbon emissions by 50% by 2030 through a combination of renewable energy incentives, carbon pricing, and investments in green infrastructure.

Environmental groups have praised the move as a significant step forward in addressing climate change. The bill includes provisions for supporting communities that currently depend on fossil fuel industries, ensuring a just transition to a greener economy.

"This represents a turning point in how we approach climate policy," said Senator Maria Rodriguez, one of the bill's sponsors. "By bringing together diverse stakeholders and addressing both environmental and economic concerns, we've created a framework that can make meaningful progress while supporting American workers and businesses."

Key elements of the legislation include tax credits for renewable energy projects, funding for research into carbon capture technologies, and grants for communities to improve climate resilience. The bill also establishes a carbon pricing mechanism that will gradually increase over time, providing market incentives for businesses to reduce emissions.

Business leaders have expressed cautious optimism about the approach, noting that the predictable regulatory framework will allow for better long-term planning. "Companies need certainty to make major investments," said James Wilson, CEO of a major manufacturing firm. "This legislation provides that certainty while also creating new opportunities in the green economy."

The bill is expected to come to a vote next month, with passage looking increasingly likely given the broad coalition of support it has garnered.`,
    summary: 'Lawmakers unite across party lines to back ambitious climate legislation targeting 50% emissions reduction by 2030.',
    category: 'Politics',
    image_url: 'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?q=80&w=1470&auto=format&fit=crop',
    created_at: '2023-05-14T15:45:00Z',
    updated_at: '2023-05-14T15:45:00Z',
    author: 'Michael Johnson',
    tags: ['Climate', 'Politics', 'Environment'],
    likes: 95,
    views: 1200,
    published: true,
    comments: []
  },
};

export default function NewsDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ likes: 0, comments: 0, views: 0 });
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    fetchArticle();
    recordView();
  }, [id]);



  const fetchArticle = async () => {
    setLoading(true);
    try {
      console.log('Fetching article:', id);
      const fetchedArticle = await getNewsArticleById(id);

      if (fetchedArticle) {
        console.log('Article found');
        setArticle(fetchedArticle);
        setStats({
          likes: fetchedArticle.likes || 0,
          comments: fetchedArticle.comments?.length || 0,
          views: fetchedArticle.views || 0
        });
      } else {
        // Try mock data as fallback
        const mockArticle = mockArticles[id];
        if (mockArticle) {
          console.log('Article found in mock data');
          setArticle(mockArticle);
          setStats({
            likes: mockArticle.likes || 0,
            comments: mockArticle.comments?.length || 0,
            views: 0
          });
        } else {
          console.log('Article not found');
        }
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  // Record view
  const recordView = async () => {
    try {
      await fetch('/api/news/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: id })
      });
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  // Handle like
  const handleLike = async () => {
    try {
      // Optimistic update
      setStats(prev => ({ ...prev, likes: prev.likes + 1 }));

      const response = await fetch('/api/news/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: id })
      });

      if (!response.ok) {
        // Revert optimistic update if failed
        setStats(prev => ({ ...prev, likes: prev.likes - 1 }));
      }
    } catch (error) {
      console.error('Error liking article:', error);
      // Revert optimistic update if failed
      setStats(prev => ({ ...prev, likes: prev.likes - 1 }));
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/news/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: id,
          content: commentText
        })
      });

      if (response.ok) {
        // Clear form
        setCommentText('');

        // Update comment count
        setStats(prev => ({ ...prev, comments: prev.comments + 1 }));
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col w-full max-w-3xl">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-12"></div>
          <div className="h-96 bg-gray-200 rounded mb-8"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <ArticleNotFound
        articleId={id}
        onRetry={() => {
          setLoading(true);
          // Force clear any cached data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('acpsnews_articles_cache');
            console.log('Cache cleared for retry');
          }
          // Try fetching again from all sources
          fetchArticle();
        }}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <FiArrowLeft className="mr-2" /> Back to News
      </Link>

      <article className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>

        <div className="flex flex-wrap items-center text-gray-600 mb-6 gap-4">
          <div className="flex items-center">
            <FiUser className="mr-1" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center">
            <FiClock className="mr-1" />
            <span>{formatDate(article.created_at)}</span>
          </div>
          <div className="flex items-center">
            <FiTag className="mr-1" />
            <span>{article.category}</span>
          </div>
        </div>

        <div className="relative h-[400px] w-full mb-8 rounded-xl overflow-hidden">
          <Image
            src={article.image_url || ''}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Content area with watermark - using CSS class for consistency */}
        <div className="content-with-logo-bg prose max-w-none relative py-8">
          {article.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-800 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-700">Share this article</h3>
              <div className="flex space-x-4 mt-2">
                <button className="text-blue-600 hover:text-blue-800">
                  <FiShare2 size={20} />
                </button>
              </div>
            </div>
            <div>
              <Link
                href={`/category/${article.category?.toLowerCase() || 'general'}`}
                className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                More in {article.category || 'General'}
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
