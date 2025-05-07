'use client';

import { useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi';
import { useEnvironment, EnvVarInfo } from '../hooks/useEnvironment';

interface EnvironmentStatusProps {
  showDetails?: boolean;
  className?: string;
}

export default function EnvironmentStatus({ showDetails = false, className = '' }: EnvironmentStatusProps) {
  const config = useEnvironment();
  const [expanded, setExpanded] = useState(false);

  // Get status icon and color
  const getStatusIcon = (status: 'ready' | 'warning' | 'error') => {
    switch (status) {
      case 'ready':
        return <FiCheckCircle className="text-green-500" size={20} />;
      case 'warning':
        return <FiAlertTriangle className="text-yellow-500" size={20} />;
      case 'error':
        return <FiAlertCircle className="text-red-500" size={20} />;
    }
  };

  // Get status color
  const getStatusColor = (status: 'ready' | 'warning' | 'error') => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-800';
    }
  };

  // Get environment variable status icon
  const getEnvVarStatusIcon = (status: EnvVarInfo['status']) => {
    switch (status) {
      case 'valid':
        return <FiCheckCircle className="text-green-500" size={16} />;
      case 'invalid':
        return <FiAlertCircle className="text-red-500" size={16} />;
      case 'missing':
        return <FiAlertTriangle className="text-yellow-500" size={16} />;
      default:
        return <FiAlertCircle className="text-gray-500" size={16} />;
    }
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`rounded-md shadow-sm ${className}`}>
      <div
        className={`p-3 rounded-md border-l-4 ${getStatusColor(
          config.status
        )} cursor-pointer flex items-center justify-between`}
        onClick={toggleExpanded}
      >
        <div className="flex items-center">
          {getStatusIcon(config.status)}
          <span className="ml-2 font-medium">
            {config.status === 'ready'
              ? 'Environment Ready'
              : config.status === 'warning'
              ? 'Environment Warning'
              : 'Environment Error'}
          </span>
        </div>
        <div>
          {expanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </div>
      </div>

      {expanded && (
        <div className="mt-2 p-4 bg-white rounded-md shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-3">Environment Variables</h3>

          <div className="mb-4">
            <h4 className="font-medium mb-2 flex items-center">
              <span>Supabase Configuration</span>
              <span
                className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  config.supabase.status === 'configured'
                    ? 'bg-green-100 text-green-800'
                    : config.supabase.status === 'partially-configured'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {config.supabase.status}
              </span>
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  {getEnvVarStatusIcon(config.supabase.url.status)}
                  <span className="ml-2 font-mono text-sm">
                    {config.supabase.url.name}
                  </span>
                  {config.supabase.url.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {config.supabase.url.value
                    ? config.supabase.url.value
                    : config.supabase.url.message || 'Not set'}
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  {getEnvVarStatusIcon(config.supabase.anonKey.status)}
                  <span className="ml-2 font-mono text-sm">
                    {config.supabase.anonKey.name}
                  </span>
                  {config.supabase.anonKey.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {config.supabase.anonKey.value
                    ? config.supabase.anonKey.value
                    : config.supabase.anonKey.message || 'Not set'}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium mb-2 flex items-center">
              <span>Vercel Configuration</span>
              <span
                className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  config.vercel.status === 'configured'
                    ? 'bg-green-100 text-green-800'
                    : config.vercel.status === 'partially-configured'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {config.vercel.status}
              </span>
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  {getEnvVarStatusIcon(config.vercel.url.status)}
                  <span className="ml-2 font-mono text-sm">
                    {config.vercel.url.name}
                  </span>
                  {config.vercel.url.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {config.vercel.url.value
                    ? config.vercel.url.value
                    : config.vercel.url.message || 'Not set'}
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  {getEnvVarStatusIcon(config.vercel.environment.status)}
                  <span className="ml-2 font-mono text-sm">
                    {config.vercel.environment.name}
                  </span>
                  {config.vercel.environment.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {config.vercel.environment.value
                    ? config.vercel.environment.value
                    : config.vercel.environment.message || 'Not set'}
                </div>
              </div>
            </div>
          </div>

          {config.missingRequired && (
            <div className="p-3 bg-red-50 text-red-800 rounded-md mb-4">
              <div className="flex items-start">
                <FiAlertCircle className="text-red-500 mt-0.5 mr-2" size={16} />
                <div>
                  <p className="font-medium">Missing Required Variables</p>
                  <p className="text-sm mt-1">
                    Some required environment variables are missing or invalid. The application may not function correctly.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            <a
              href="https://supabase.com/docs/guides/getting-started/local-development"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <span>Supabase Documentation</span>
              <FiExternalLink className="ml-1" size={14} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
