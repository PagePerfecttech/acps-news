'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiArrowLeft, FiUpload, FiRefreshCw } from 'react-icons/fi';
import Link from 'next/link';
import { addUser } from '../../../lib/userService';
import { User } from '../../../types';

export default function AddUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'contributor',
    profile_pic: '',
    bio: ''
  });

  const [previewImage, setPreviewImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server or cloud storage
      // For demo purposes, we&apos;ll just create a local URL
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);

      // In a real app, you would upload the file to a server and get the URL
      setFormData(prev => ({
        ...prev,
        profile_pic: imageUrl, // In a real app, this would be the URL from your server
      }));

      console.log('File selected:', file.name, 'size:', (file.size / 1024).toFixed(2) + 'KB');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const newUser = await addUser(formData);

      if (newUser) {
        setMessage({ type: 'success', text: 'User added successfully!' });

        // Redirect to users list after 2 seconds
        setTimeout(() => {
          router.push('/admin/users');
        }, 2000);
      } else {
        throw new Error('Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setMessage({ type: 'error', text: 'Failed to add user. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New User</h1>
        <Link
          href="/admin/users"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md flex items-center text-sm transition-colors"
        >
          <FiArrowLeft className="mr-1" />
          Back to Users
        </Link>
      </div>

      {/* Message display */}
      {message.text && (
        <div
          className={`p-4 mb-6 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
            required
          />
        </div>

        {/* Role */}
        <div className="mb-4">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
            required
          >
            <option value="admin">Admin</option>
            <option value="contributor">Contributor</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Profile Picture */}
        <div className="mb-4">
          <label htmlFor="profile_pic" className="block text-sm font-medium text-gray-700 mb-1">
            Profile Picture
          </label>
          <div className="flex flex-col space-y-2">
            <div className="flex">
              <input
                type="text"
                id="profile_pic"
                name="profile_pic"
                value={formData.profile_pic}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                placeholder="Enter image URL"
              />
              <label
                htmlFor="image_upload"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-r-md cursor-pointer flex items-center"
              >
                <FiUpload />
              </label>
              <input
                type="file"
                id="image_upload"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Image Preview */}
            {(previewImage || formData.profile_pic) && (
              <div className="mt-2 border rounded-md p-2 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Profile Picture Preview:</p>
                <div className="relative h-20 w-20">
                  <img
                    src={previewImage || formData.profile_pic}
                    alt="Profile Preview"
                    className="h-full w-full object-cover rounded-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
            placeholder="Brief description about the user"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <FiRefreshCw className="animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Add User
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
