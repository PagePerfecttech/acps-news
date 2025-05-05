'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiEdit, FiTrash2, FiPlus, FiEye, FiThumbsUp, FiMessageSquare } from 'react-icons/fi';
import { NewsArticle } from '../../types';

// Mock data for demonstration
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

export default function NewsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Get unique categories from articles
  const categories = Array.from(new Set(mockArticles.map(article => article.category)));
  
  // Filter articles based on search term and category
  const filteredArticles = mockArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };
  
  const handleDelete = (id: string) => {
    // In a real app, this would delete from the database
    console.log(`Deleting article with ID: ${id}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">News Management</h1>
        <Link 
          href="/admin/news/add"
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" /> Add New Article
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by title or content..."
              className="w-full p-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-1/4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{article.title}</div>
                    <div className="text-xs text-gray-500">{article.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(article.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/news/edit/${article.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEdit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 size={18} />
                      </button>
                      <Link
                        href={`/news/${article.id}`}
                        target="_blank"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <FiEye size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredArticles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No articles found. Try adjusting your search or filters.
          </div>
        )}
      </div>
    </div>
  );
}
