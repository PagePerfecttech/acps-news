'use client';

import { useState } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSave } from 'react-icons/fi';

// Mock categories for demonstration
const initialCategories = [
  { id: '1', name: 'సినిమా', slug: 'cinema', count: 12 },
  { id: '2', name: 'రాజకీయం', slug: 'politics', count: 8 },
  { id: '3', name: 'క్రీడలు', slug: 'sports', count: 15 },
  { id: '4', name: 'వ్యాపారం', slug: 'business', count: 6 },
  { id: '5', name: 'టెక్నాలజీ', slug: 'technology', count: 9 },
  { id: '6', name: 'ఆరోగ్యం', slug: 'health', count: 7 },
  { id: '7', name: 'విద్య', slug: 'education', count: 4 },
  { id: '8', name: 'రాష్ట్రీయం', slug: 'state', count: 11 },
  { id: '9', name: 'జాతీయం', slug: 'national', count: 10 },
  { id: '10', name: 'అంతర్జాతీయం', slug: 'international', count: 5 },
];

export default function CategoryManagement() {
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '' });
  const [editingCategory, setEditingCategory] = useState<{ id: string, name: string, slug: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    if (newCategory.name.trim() === '' || newCategory.slug.trim() === '') {
      alert('Category name and slug are required');
      return;
    }

    const newId = (Math.max(...categories.map(c => parseInt(c.id))) + 1).toString();
    
    setCategories([
      ...categories,
      {
        id: newId,
        name: newCategory.name,
        slug: newCategory.slug,
        count: 0
      }
    ]);
    
    setNewCategory({ name: '', slug: '' });
  };

  const handleEditCategory = (category: typeof categories[0]) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      slug: category.slug
    });
  };

  const handleSaveEdit = () => {
    if (!editingCategory) return;
    
    if (editingCategory.name.trim() === '' || editingCategory.slug.trim() === '') {
      alert('Category name and slug are required');
      return;
    }

    setCategories(categories.map(category =>
      category.id === editingCategory.id
        ? { ...category, name: editingCategory.name, slug: editingCategory.slug }
        : category
    ));
    
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    // In a real app, you would check if there are articles using this category
    const categoryToDelete = categories.find(c => c.id === id);
    if (categoryToDelete && categoryToDelete.count > 0) {
      const confirmDelete = window.confirm(
        `This category has ${categoryToDelete.count} articles. Are you sure you want to delete it?`
      );
      if (!confirmDelete) return;
    }
    
    setCategories(categories.filter(category => category.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
      </div>
      
      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Categories
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name or slug..."
              className="w-full p-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Add New Category */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-medium mb-3 text-gray-800">Add New Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              id="categoryName"
              placeholder="Enter category name"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newCategory.name}
              onChange={(e) => {
                const name = e.target.value;
                setNewCategory({
                  name,
                  slug: generateSlug(name)
                });
              }}
            />
          </div>
          <div>
            <label htmlFor="categorySlug" className="block text-sm font-medium text-gray-700 mb-1">
              Category Slug
            </label>
            <input
              type="text"
              id="categorySlug"
              placeholder="Enter category slug"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newCategory.slug}
              onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddCategory}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md flex items-center"
            >
              <FiPlus className="mr-2" /> Add Category
            </button>
          </div>
        </div>
      </div>
      
      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Articles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingCategory && editingCategory.id === category.id ? (
                      <input
                        type="text"
                        className="w-full p-1 border border-gray-300 rounded-md"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingCategory && editingCategory.id === category.id ? (
                      <input
                        type="text"
                        className="w-full p-1 border border-gray-300 rounded-md"
                        value={editingCategory.slug}
                        onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                      />
                    ) : (
                      <div className="text-sm text-gray-500">{category.slug}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{category.count}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingCategory && editingCategory.id === category.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FiSave size={18} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No categories found. Try adjusting your search or add a new category.
          </div>
        )}
      </div>
    </div>
  );
}
