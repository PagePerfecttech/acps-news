'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiEdit, FiTrash2, FiPlus, FiImage, FiFileText, FiDollarSign, FiMessageSquare, FiThumbsUp } from 'react-icons/fi';
import { NewsArticle, Ad, Comment } from '../types';

// Mock data for demonstration - using our enhanced types
const mockArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'జైలర్ 2లో బాలయ్య.. ఇక దిదుడి బిడేల్!',
    content: 'రజినీకాంత్-నెల్సన్ కాంబోలో వచ్చిన బ్లాక్ బస్టర్ చిత్రం జైలర్. ఈ సినిమాకు సీక్వెల్ ప్రకటించిన విషయం తెలిసిందే. ఈ సీక్వెల్‌లో నందమూరి బాలకృష్ణ తన కెరియర్‌లో మొదటిసారి తమిళంలో నటించబోతున్నారని వార్తలొచ్చాయి. గతంలో కూడా ఈ వార్తలు వచ్చినా, ఇప్పుడు మరింత బలంగా వినిపిస్తున్నాయి. జైలర్ 2లో బాలయ్య కీలక పాత్రలో కనిపించే అవకాశం ఉందని, దీనికి సంబంధించిన చర్చలు జరుగుతున్నాయని సమాచారం.',
    summary: 'రజినీకాంత్-నెల్సన్ కాంబోలో వచ్చిన బ్లాక్ బస్టర్ చిత్రం జైలర్ సీక్వెల్‌లో నందమూరి బాలకృష్ణ కీలక పాత్రలో నటించనున్నారు.',
    category: 'సినిమా',
    image_url: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=1470&auto=format&fit=crop',
    created_at: '2023-05-15T10:30:00Z',
    updated_at: '2023-05-15T10:30:00Z',
    author: 'రాజేష్ కుమార్',
    likes: 24,
    comments: [
      {
        id: '101',
        news_id: '1',
        content: 'బాలయ్య మాస్ అభిమానులకు ఇది గొప్ప వార్త!',
        author_ip: '192.168.1.1',
        created_at: '2023-05-15T11:30:00Z',
        approved: true
      }
    ],
    tags: ['సినిమా', 'బాలయ్య', 'రజినీకాంత్', 'జైలర్'],
    published: true
  },
  {
    id: '2',
    title: 'ఏపీలో వరదలు: పలు ప్రాంతాల్లో తీవ్ర నష్టం',
    content: 'ఆంధ్రప్రదేశ్‌లో భారీ వర్షాలకు పలు ప్రాంతాలు వరద ముంపునకు గురయ్యాయి. గోదావరి, కృష్ణా నదులు ప్రమాదకర స్థాయిని దాటడంతో పలు గ్రామాలు నీట మునిగాయి. ప్రభుత్వం సహాయక చర్యలు చేపట్టినప్పటికీ, వరద బాధితులు తీవ్ర ఇబ్బందులు ఎదుర్కొంటున్నారు. వరద ప్రభావిత ప్రాంతాల్లో సహాయక శిబిరాలు ఏర్పాటు చేసి, ఆహారం, మంచినీరు, వైద్య సదుపాయాలు కల్పిస్తున్నారు అధికారులు.',
    summary: 'ఆంధ్రప్రదేశ్‌లో భారీ వర్షాలకు పలు ప్రాంతాలు వరద ముంపునకు గురయ్యాయి. ప్రభుత్వం సహాయక చర్యలు చేపట్టింది.',
    category: 'రాష్ట్రీయం',
    image_url: 'https://images.unsplash.com/photo-1523772721666-22ad3c3b6f90?q=80&w=1470&auto=format&fit=crop',
    created_at: '2023-05-14T15:45:00Z',
    updated_at: '2023-05-14T15:45:00Z',
    author: 'సురేష్ రెడ్డి',
    likes: 18,
    comments: [
      {
        id: '201',
        news_id: '2',
        content: 'ప్రభుత్వం త్వరగా సహాయం చేయాలి',
        author_ip: '192.168.1.2',
        created_at: '2023-05-14T16:30:00Z',
        approved: true
      },
      {
        id: '202',
        news_id: '2',
        content: 'బాధితులకు మా సానుభూతి',
        author_ip: '192.168.1.3',
        created_at: '2023-05-14T17:15:00Z',
        approved: true
      }
    ],
    tags: ['వరదలు', 'ఆంధ్రప్రదేశ్', 'ప్రకృతి విపత్తు'],
    published: true
  },
];

const mockAds: Ad[] = [
  {
    id: '1',
    title: 'ప్రీమియం సబ్‌స్క్రిప్షన్ - అన్లిమిటెడ్ యాక్సెస్ పొందండి',
    description: 'ఇప్పుడే సబ్‌స్క్రైబ్ చేసుకొని యాడ్-ఫ్రీ రీడింగ్, ఎక్స్‌క్లూజివ్ కంటెంట్ మరియు మరిన్ని ఆనందించండి!',
    image_url: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=1470&auto=format&fit=crop',
    link_url: '/subscribe',
    frequency: 3, // Show after every 3 articles
    active: true,
    created_at: '2023-05-01T00:00:00Z',
    updated_at: '2023-05-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'నూతన స్మార్ట్‌ఫోన్ లాంచ్',
    description: 'అత్యాధునిక ఫీచర్లతో కొత్త స్మార్ట్‌ఫోన్ మార్కెట్లోకి',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    video_type: 'youtube',
    link_url: '/smartphone',
    frequency: 5,
    active: true,
    created_at: '2023-05-02T00:00:00Z',
    updated_at: '2023-05-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'ఆన్‌లైన్ షాపింగ్ ఆఫర్స్',
    text_content: 'ఇప్పుడే కొనుగోలు చేసి 50% వరకు పొదుపు చేయండి!',
    image_url: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1470&auto=format&fit=crop',
    link_url: '/shopping',
    frequency: 4,
    active: true,
    created_at: '2023-05-03T00:00:00Z',
    updated_at: '2023-05-03T00:00:00Z',
  }
];

// Get all comments from articles
const getAllComments = (): Comment[] => {
  const allComments: Comment[] = [];
  mockArticles.forEach(article => {
    if (article.comments && article.comments.length > 0) {
      allComments.push(...article.comments.map(comment => ({
        ...comment,
        article_title: article.title
      })));
    }
  });
  return allComments;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'articles' | 'ads' | 'comments'>('articles');
  const [allComments, setAllComments] = useState<(Comment & { article_title?: string })[]>(getAllComments());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleApproveComment = (commentId: string) => {
    // In a real app, this would update the database
    console.log(`Approving comment ${commentId}`);

    // Update local state for demo
    setAllComments(allComments.map(comment =>
      comment.id === commentId ? { ...comment, approved: true } : comment
    ));
  };

  const handleDeleteComment = (commentId: string) => {
    // In a real app, this would update the database
    console.log(`Deleting comment ${commentId}`);

    // Update local state for demo
    setAllComments(allComments.filter(comment => comment.id !== commentId));
  };

  // Stats for dashboard
  const totalArticles = mockArticles.length;
  const totalAds = mockAds.length;
  const activeAds = mockAds.filter(ad => ad.active).length;
  const totalComments = allComments.length;
  const pendingComments = allComments.filter(comment => !comment.approved).length;
  const totalLikes = mockArticles.reduce((sum, article) => sum + article.likes, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">FlipNews Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">News Articles</p>
              <h2 className="text-2xl font-bold">{totalArticles}</h2>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FiFileText className="text-yellow-500" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Ads</p>
              <h2 className="text-2xl font-bold">{activeAds}/{totalAds}</h2>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiImage className="text-green-500" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Comments</p>
              <h2 className="text-2xl font-bold">{totalComments}</h2>
              {pendingComments > 0 && (
                <p className="text-xs text-red-500">{pendingComments} pending</p>
              )}
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FiMessageSquare className="text-purple-500" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Likes</p>
              <h2 className="text-2xl font-bold">{totalLikes}</h2>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FiThumbsUp className="text-red-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'articles'
              ? 'border-b-2 border-yellow-500 text-yellow-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('articles')}
        >
          <FiFileText className="inline mr-2" />
          News Articles
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'ads'
              ? 'border-b-2 border-yellow-500 text-yellow-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('ads')}
        >
          <FiDollarSign className="inline mr-2" />
          Advertisements
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'comments'
              ? 'border-b-2 border-yellow-500 text-yellow-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('comments')}
        >
          <FiMessageSquare className="inline mr-2" />
          Comments
          {pendingComments > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {pendingComments}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-4">
        {activeTab === 'articles' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">News Articles</h2>
              <Link href="/admin/news/add" className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded-md flex items-center text-sm">
                <FiPlus className="mr-1" /> Add New Article
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockArticles.map((article) => (
                    <tr key={article.id}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{article.title}</div>
                        <div className="text-xs text-gray-500">{article.author}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center">
                            <FiThumbsUp className="mr-1 text-blue-500" size={14} />
                            {article.likes}
                          </span>
                          <span className="flex items-center">
                            <FiMessageSquare className="mr-1 text-purple-500" size={14} />
                            {article.comments?.length || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(article.created_at)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            article.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {article.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                        <Link href={`/admin/news/edit/${article.id}`} className="text-blue-600 hover:text-blue-900 mr-2 inline-block">
                          <FiEdit size={16} />
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-900 inline-block"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this article?')) {
                              console.log(`Deleting article with ID: ${article.id}`);
                              // In a real app, this would delete from the database
                            }
                          }}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'ads' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Advertisements</h2>
              <Link href="/admin/ads/add" className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded-md flex items-center text-sm">
                <FiPlus className="mr-1" /> Add New Ad
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockAds.map((ad) => (
                    <tr key={ad.id}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {ad.description || ad.text_content || 'No description'}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {ad.video_url && ad.video_type === 'youtube' && 'YouTube Video'}
                        {ad.video_url && ad.video_type !== 'youtube' && 'Uploaded Video'}
                        {ad.image_url && !ad.video_url && 'Image'}
                        {ad.text_content && !ad.image_url && !ad.video_url && 'Text Only'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        Every {ad.frequency} articles
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ad.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {ad.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(ad.created_at)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                        <Link href={`/admin/ads/edit/${ad.id}`} className="text-blue-600 hover:text-blue-900 mr-2 inline-block">
                          <FiEdit size={16} />
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-900 inline-block"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this ad?')) {
                              console.log(`Deleting ad with ID: ${ad.id}`);
                              // In a real app, this would delete from the database
                            }
                          }}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'comments' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Comments</h2>
              <div>
                <span className="text-sm text-gray-500 mr-2">
                  {pendingComments} pending approval
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comment
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Article
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allComments.map((comment) => (
                    <tr key={comment.id}>
                      <td className="px-4 py-2">
                        <div className="text-sm text-gray-900">{comment.content}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {comment.article_title}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {comment.author_ip}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(comment.created_at)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            comment.approved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {comment.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                        {!comment.approved && (
                          <button
                            className="text-green-600 hover:text-green-900 mr-2"
                            onClick={() => handleApproveComment(comment.id)}
                          >
                            Approve
                          </button>
                        )}
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
