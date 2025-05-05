'use client';

import { useState } from 'react';
import { FiCheck, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { Comment, NewsArticle } from '../../types';

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
      },
      {
        id: '102',
        news_id: '1',
        content: 'రజినీకాంత్ - బాలయ్య కాంబినేషన్ చూడాలని ఉంది.',
        author_ip: '192.168.1.2',
        created_at: '2023-05-15T12:15:00Z',
        approved: false
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
      },
      {
        id: '203',
        news_id: '2',
        content: 'ఈ వరదలకు కారణం అడవుల నరికివేత.',
        author_ip: '192.168.1.4',
        created_at: '2023-05-14T18:00:00Z',
        approved: false
      }
    ],
    tags: ['వరదలు', 'ఆంధ్రప్రదేశ్', 'ప్రకృతి విపత్తు'],
    published: true
  },
];

// Get all comments from articles with article title
const getAllComments = (): (Comment & { article_title: string })[] => {
  const allComments: (Comment & { article_title: string })[] = [];
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

export default function CommentsManagement() {
  const [comments, setComments] = useState<(Comment & { article_title: string })[]>(getAllComments());
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter comments based on search term and status
  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.article_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'approved' && comment.approved) || 
                         (statusFilter === 'pending' && !comment.approved);
    
    return matchesSearch && matchesStatus;
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleApprove = (commentId: string) => {
    // In a real app, this would update the database
    console.log(`Approving comment with ID: ${commentId}`);
    
    // Update local state for demo
    setComments(comments.map(comment =>
      comment.id === commentId ? { ...comment, approved: true } : comment
    ));
  };
  
  const handleDelete = (commentId: string) => {
    // In a real app, this would delete from the database
    console.log(`Deleting comment with ID: ${commentId}`);
    
    // Update local state for demo
    setComments(comments.filter(comment => comment.id !== commentId));
  };
  
  const pendingCount = comments.filter(comment => !comment.approved).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Comments Management</h1>
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md flex items-center">
          <FiAlertCircle className="mr-2" />
          <span>{pendingCount} comments pending approval</span>
        </div>
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
              placeholder="Search in comments or article titles..."
              className="w-full p-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-1/4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Comments</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Comments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
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
              {filteredComments.map((comment) => (
                <tr key={comment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{comment.content}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 truncate max-w-xs">
                      {comment.article_title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comment.author_ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(comment.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {!comment.approved && (
                        <button
                          onClick={() => handleApprove(comment.id)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <FiCheck size={18} className="mr-1" />
                          <span>Approve</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredComments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No comments found. Try adjusting your search or filters.
          </div>
        )}
      </div>
    </div>
  );
}
