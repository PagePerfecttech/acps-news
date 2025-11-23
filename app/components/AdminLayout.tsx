'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiHome, FiFileText, FiImage, FiMessageSquare, FiLogOut, FiMenu, FiX, FiTag, FiSettings, FiUsers, FiRss, FiDatabase } from 'react-icons/fi';
import { useSettings } from '../contexts/SettingsContext';

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
    const checkAuth = async () => {
      try {
        // Check Supabase session first
        const { supabase } = await import('../lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // User is authenticated with Supabase
          setIsAuthenticated(true);
          localStorage.setItem('acpsnews_auth', 'true');
          localStorage.setItem('acpsnews_admin_name', session.user.email || 'Admin');
        } else {
          // Fallback to localStorage check for compatibility
          const auth = localStorage.getItem('acpsnews_auth');
          setIsAuthenticated(auth === 'true');

          // If not authenticated and not on login page, redirect to login
          if (!auth && pathname !== '/admin/login') {
            router.push('/admin/login');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Fallback to localStorage
        const auth = localStorage.getItem('acpsnews_auth');
        setIsAuthenticated(auth === 'true');

        if (!auth && pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { supabase } = await import('../lib/supabase');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage and redirect
      localStorage.removeItem('acpsnews_auth');
      localStorage.removeItem('acpsnews_admin_name');
      localStorage.removeItem('acpsnews_user_id');
      router.push('/admin/login');
    }
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
          className="bg-primary text-black p-2 rounded-md shadow-md"
          style={{ backgroundColor: settings.primary_color }}
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-primary text-black overflow-y-auto`}
        style={{ backgroundColor: settings.primary_color }}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">ACPS News Admin</h1>
          <nav className="space-y-4">
            <Link
              href="/admin"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: pathname === '/admin' ? `${settings.primary_color}40` : 'transparent' }}
              onClick={() => setSidebarOpen(false)}
            >
              <FiHome size={20} />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/news"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: pathname?.startsWith('/admin/news') ? `${settings.primary_color}40` : 'transparent' }}
              onClick={() => setSidebarOpen(false)}
            >
              <FiFileText size={20} />
              <span>News Management</span>
            </Link>
            <Link
              href="/admin/rss"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: pathname?.startsWith('/admin/rss') ? `${settings.primary_color}40` : 'transparent' }}
              onClick={() => setSidebarOpen(false)}
            >
              <FiRss size={20} />
              <span>RSS Feeds</span>
            </Link>
            <Link
              href="/admin/ads"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: pathname?.startsWith('/admin/ads') ? `${settings.primary_color}40` : 'transparent' }}
              onClick={() => setSidebarOpen(false)}
            >
              <FiImage size={20} />
              <span>Ad Management</span>
            </Link>
            <Link
              href="/admin/comments"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: pathname?.startsWith('/admin/comments') ? `${settings.primary_color}40` : 'transparent' }}
              onClick={() => setSidebarOpen(false)}
            >
              <FiMessageSquare size={20} />
              <span>Comments</span>
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: pathname?.startsWith('/admin/categories') ? `${settings.primary_color}40` : 'transparent' }}
              onClick={() => setSidebarOpen(false)}
            >
              <FiTag size={20} />
              <span>Categories</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: pathname?.startsWith('/admin/users') ? `${settings.primary_color}40` : 'transparent' }}
              onClick={() => setSidebarOpen(false)}
            >
              <FiUsers size={20} />
              <span>User Management</span>
            </Link>
            <Link
              href="/admin/storage"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: pathname?.startsWith('/admin/storage') ? `${settings.primary_color}40` : 'transparent' }}
              onClick={() => setSidebarOpen(false)}
            >
              <FiDatabase size={20} />
              <span>Storage</span>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: pathname?.startsWith('/admin/settings') ? `${settings.primary_color}40` : 'transparent' }}
              onClick={() => setSidebarOpen(false)}
            >
              <FiSettings size={20} />
              <span>Site Settings</span>
            </Link>
            <div className="pt-6 mt-6 border-t" style={{ borderColor: `${settings.primary_color}80` }}>
              <button
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-opacity-80 transition-colors w-full text-left"
                style={{ backgroundColor: 'transparent' }}
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
