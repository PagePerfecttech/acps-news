'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiHome, FiFileText, FiImage, FiMessageSquare, FiLogOut, FiMenu, FiX, FiTag, FiSettings, FiUsers, FiRss } from 'react-icons/fi';
import { useSettings } from '../contexts/SettingsContext';
import './admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    // Check if user is authenticated
    const auth = localStorage.getItem('flipnews_auth');
    setIsAuthenticated(auth === 'true');
    setIsLoading(false);

    // If not authenticated and not on login page, redirect to login
    if (!auth && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  // Set CSS variables for admin panel colors
  useEffect(() => {
    if (typeof document !== 'undefined' && settings) {
      // Create a lighter version of the primary color for hover effects
      document.documentElement.style.setProperty('--admin-primary-color', settings.primary_color);
      document.documentElement.style.setProperty('--admin-hover-color', `${settings.primary_color}dd`);
    }
  }, [settings]);

  const handleLogout = () => {
    localStorage.removeItem('flipnews_auth');
    router.push('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Show login page directly if not authenticated
  if (!isAuthenticated && pathname !== '/admin/login') {
    return null; // Will redirect in useEffect
  }

  // Don&apos;t show admin layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex admin-panel">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="text-black p-2 rounded-md shadow-md"
          style={{ backgroundColor: settings.primary_color }}
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition duration-200 ease-in-out z-30 w-64 text-black overflow-y-auto`}
        style={{ backgroundColor: settings.primary_color }}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">{settings.site_name || 'FlipNews'} Admin</h1>
          <nav className="space-y-4">
            <Link
              href="/admin"
              className="sidebar-link"
              onClick={() => setSidebarOpen(false)}
            >
              <FiHome size={20} />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/news"
              className="sidebar-link"
              onClick={() => setSidebarOpen(false)}
            >
              <FiFileText size={20} />
              <span>News Management</span>
            </Link>
            <Link
              href="/admin/ads"
              className="sidebar-link"
              onClick={() => setSidebarOpen(false)}
            >
              <FiImage size={20} />
              <span>Ad Management</span>
            </Link>
            <Link
              href="/admin/comments"
              className="sidebar-link"
              onClick={() => setSidebarOpen(false)}
            >
              <FiMessageSquare size={20} />
              <span>Comments</span>
            </Link>
            <Link
              href="/admin/categories"
              className="sidebar-link"
              onClick={() => setSidebarOpen(false)}
            >
              <FiTag size={20} />
              <span>Categories</span>
            </Link>
            <Link
              href="/admin/users"
              className="sidebar-link"
              onClick={() => setSidebarOpen(false)}
            >
              <FiUsers size={20} />
              <span>User Management</span>
            </Link>
            <Link
              href="/admin/rss"
              className="sidebar-link"
              onClick={() => setSidebarOpen(false)}
            >
              <FiRss size={20} />
              <span>RSS Feeds</span>
            </Link>
            <Link
              href="/admin/settings"
              className="sidebar-link"
              onClick={() => setSidebarOpen(false)}
            >
              <FiSettings size={20} />
              <span>Site Settings</span>
            </Link>
            <div className="pt-6 mt-6 border-t sidebar-divider">
              <button
                className="sidebar-link w-full text-left"
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
              >
                <FiLogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content with improved scrolling */}
      <div className="flex-1 md:ml-64 p-6 admin-content">
        <div className="max-w-7xl mx-auto pb-24">
          {children}
        </div>
      </div>
    </div>
  );
}
