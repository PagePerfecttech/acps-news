'use client';

import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSave } from 'react-icons/fi';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../../lib/dataService';
import { getNewsArticles } from '../../lib/dataService';
import { Category } from '../../types';

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '' });
  const [editingCategory, setEditingCategory] = useState<{ id: string, name: string, slug: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [articleCounts, setArticleCounts] = useState<Record<string, number>>({});

  // Load categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Use the async version of getCategories
        const loadedCategories = await getCategories();
        setCategories(loadedCategories);

        // Count articles per category
        const articles = await getNewsArticles();
        const counts: Record<string, number> = {};

        if (Array.isArray(articles)) {
          loadedCategories.forEach(category => {
            counts[category.id] = articles.filter(article => article.category === category.name).length;
          });
        } else {
          console.error('Articles is not an array:', articles);
          // Set all counts to 0 if articles is not an array
          loadedCategories.forEach(category => {
            counts[category.id] = 0;
          });
        }

        setArticleCounts(counts);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps;

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = async () => {
    if (newCategory.name.trim() === '' || newCategory.slug.trim() === '') {
      setMessage({ type: 'error', text: 'Category name and slug are required' });
      return;
    }

    // Check if slug already exists
    if (categories.some(c => c.slug === newCategory.slug)) {
      setMessage({ type: 'error', text: 'A category with this slug already exists' });
      return;
    }

    const newId = (Math.max(...categories.map(c => parseInt(c.id) || 0), 0) + 1).toString();

    const newCategoryObj: Category = {
      id: newId,
      name: newCategory.name,
      slug: newCategory.slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      // Set loading state
      setIsLoading(true);

      // Use the async version of addCategory
      const success = await addCategory(newCategoryObj);

      if (success) {
        // Refresh categories from the database to get the correct ID
        const refreshedCategories = await getCategories();
        setCategories(refreshedCategories);

        // Update article counts
        const newCounts = { ...articleCounts };
        const addedCategory = refreshedCategories.find(c => c.slug === newCategory.slug);
        if (addedCategory) {
          newCounts[addedCategory.id] = 0;
          setArticleCounts(newCounts);
        }

        // Reset form
        setNewCategory({ name: '', slug: '' });
        setMessage({ type: 'success', text: 'Category added successfully!' });

        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        throw new Error('Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setMessage({ type: 'error', text: 'Failed to add category. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = (category: typeof categories[0]) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      slug: category.slug
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCategory) return;

    if (editingCategory.name.trim() === '' || editingCategory.slug.trim() === '') {
      setMessage({ type: 'error', text: 'Category name and slug are required' });
      return;
    }

    // Check if slug already exists (excluding the current category)
    if (categories.some(c => c.slug === editingCategory.slug && c.id !== editingCategory.id)) {
      setMessage({ type: 'error', text: 'A category with this slug already exists' });
      return;
    }

    // Find the original category
    const originalCategory = categories.find(c => c.id === editingCategory.id);

    if (!originalCategory) {
      setMessage({ type: 'error', text: 'Category not found' });
      return;
    }

    // Create the updated category object
    const updatedCategoryObj: Category = {
      ...originalCategory,
      name: editingCategory.name,
      slug: editingCategory.slug,
      updated_at: new Date().toISOString()
    };

    try {
      // Set loading state
      setIsLoading(true);

      // Use the async version of updateCategory
      const success = await updateCategory(updatedCategoryObj);

      if (success) {
        // Refresh categories from the database
        const refreshedCategories = await getCategories();
        setCategories(refreshedCategories);

        setEditingCategory(null);
        setMessage({ type: 'success', text: 'Category updated successfully!' });

        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        throw new Error('Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setMessage({ type: 'error', text: 'Failed to update category. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    // Check if there are articles using this category
    const categoryToDelete = categories.find(c => c.id === id);
    if (!categoryToDelete) return;

    const count = articleCounts[id] || 0;

    if (count > 0) {
      const confirmDelete = window.confirm(
        `This category has ${count} articles. Are you sure you want to delete it?`
      );
      if (!confirmDelete) return;
    } else {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete this category?`
      );
      if (!confirmDelete) return;
    }

    try {
      // Set loading state
      setIsLoading(true);

      // Use the async version of deleteCategory
      const success = await deleteCategory(id);

      if (success) {
        // Refresh categories from the database
        const refreshedCategories = await getCategories();
        setCategories(refreshedCategories);

        setMessage({ type: 'success', text: 'Category deleted successfully!' });

        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setMessage({ type: 'error', text: 'Failed to delete category. Please try again.' });
    } finally {
      setIsLoading(false);
    }
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

      {message.text && (
        <div
          className={`p-4 mb-6 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading categories...</p>
        </div>
      )}

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
                    <div className="text-sm text-gray-500">{articleCounts[category.id] || 0}</div>
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
