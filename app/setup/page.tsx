'use client';

import { useState, useEffect } from 'react';
import { FiDatabase, FiCheck, FiRefreshCw, FiUpload, FiServer } from 'react-icons/fi';
import { checkSupabaseTables, initializeSupabaseData, getSupabaseProjectInfo } from '../lib/setupSupabase';
import { isSupabaseConfigured, checkConnection } from '../lib/supabase';
import Link from 'next/link';

export default function SetupPage() {
  const [loading, setLoading] = useState(true);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [tablesExist, setTablesExist] = useState(false);
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [initializingData, setInitializingData] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);
  const [projectInfo, setProjectInfo] = useState({
    projectName: 'Loading...',
    region: 'Loading...',
    status: 'Loading...'
  });
  const [connectionStatus, setConnectionStatus] = useState({
    status: 'disconnected',
    message: 'Checking connection...',
    timestamp: 0 // Initialize with 0 to avoid hydration mismatch
  });

  // Update timestamp on client-side only
  useEffect(() => {
    setConnectionStatus(prev => ({
      ...prev,
      timestamp: Date.now()
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const checkSetup = async () => {
      setLoading(true);

      // Check Supabase configuration
      const configured = await isSupabaseConfigured();
      setSupabaseConfigured(configured);

      // Get connection status
      const status = await checkConnection();
      setConnectionStatus(status);

      // Get project info
      const info = await getSupabaseProjectInfo();
      setProjectInfo(info);

      if (configured) {
        // Check if tables exist
        const { exists, missingTables: missing } = await checkSupabaseTables();
        setTablesExist(exists);
        setMissingTables(missing);
      }

      setLoading(false);
    };

    checkSetup();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInitializeData = async () => {
    setInitializingData(true);

    try {
      const success = await initializeSupabaseData();

      if (success) {
        setInitializationComplete(true);

        // Recheck tables
        const { exists, missingTables: missing } = await checkSupabaseTables();
        setTablesExist(exists);
        setMissingTables(missing);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setInitializingData(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);

    // Check Supabase configuration
    const configured = await isSupabaseConfigured();
    setSupabaseConfigured(configured);

    // Get connection status
    const status = await checkConnection();
    setConnectionStatus(status);

    // Get project info
    const info = await getSupabaseProjectInfo();
    setProjectInfo(info);

    if (configured) {
      // Check if tables exist
      const { exists, missingTables: missing } = await checkSupabaseTables();
      setTablesExist(exists);
      setMissingTables(missing);
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Supabase Setup</h1>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center disabled:bg-blue-300"
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Supabase Configuration</h3>
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${supabaseConfigured ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>{supabaseConfigured ? 'Configured' : 'Not Configured'}</span>
              </div>
              {!supabaseConfigured && (
                <p className="text-sm text-red-600 mt-2">
                  Please check your .env.local file for correct Supabase credentials.
                </p>
              )}
            </div>

            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Connection Status</h3>
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                  connectionStatus.status === 'connected' ? 'bg-green-500' :
                  connectionStatus.status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></span>
                <span>{connectionStatus.message}</span>
              </div>
              {connectionStatus.timestamp > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Last checked: {new Date(connectionStatus.timestamp).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Project Information</h2>
          <div className="border rounded-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Project Name</h3>
                <p className="font-medium">{projectInfo.projectName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Region</h3>
                <p className="font-medium">{projectInfo.region}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="font-medium">{projectInfo.status}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Database Tables</h2>
          <div className="border rounded-md p-4">
            <div className="flex items-center mb-4">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${tablesExist ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>{tablesExist ? 'All required tables exist' : 'Missing tables'}</span>
            </div>

            {!tablesExist && missingTables.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Missing Tables:</h3>
                <ul className="list-disc pl-5 text-sm">
                  {missingTables.map((table) => (
                    <li key={table}>{table}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col space-y-2">
              <p className="text-sm text-gray-600">
                {tablesExist
                  ? 'Your database is properly set up with all required tables.'
                  : 'Your database is missing some required tables. You need to create them.'}
              </p>

              {!tablesExist && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">To create the missing tables:</p>
                  <ol className="list-decimal pl-5 text-sm space-y-2">
                    <li>Go to your Supabase project dashboard</li>
                    <li>Navigate to the SQL Editor</li>
                    <li>Copy the SQL from the <code className="bg-gray-100 px-1 py-0.5 rounded">supabase-schema.sql</code> file</li>
                    <li>Run the SQL to create all required tables and sample data</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Data Initialization</h2>
          <div className="border rounded-md p-4">
            <p className="text-sm text-gray-600 mb-4">
              You can initialize your Supabase database with data from your local storage.
              This is useful if you&apos;ve been working with the app offline and want to move your data to Supabase.
            </p>

            <button
              onClick={handleInitializeData}
              disabled={initializingData || !supabaseConfigured || initializationComplete}
              className={`flex items-center px-4 py-2 rounded-md ${
                initializationComplete
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } disabled:bg-gray-300 disabled:text-gray-500`}
            >
              {initializingData ? (
                <>
                  <FiRefreshCw className="animate-spin mr-2" />
                  Initializing...
                </>
              ) : initializationComplete ? (
                <>
                  <FiCheck className="mr-2" />
                  Initialization Complete
                </>
              ) : (
                <>
                  <FiUpload className="mr-2" />
                  Initialize with Local Data
                </>
              )}
            </button>

            {!supabaseConfigured && (
              <p className="text-sm text-red-600 mt-2">
                You need to configure Supabase first before initializing data.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-8">
          <Link
            href="/debug"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md flex items-center hover:bg-gray-300"
          >
            <FiDatabase className="mr-2" />
            Debug Tools
          </Link>

          <Link
            href="/"
            className="bg-yellow-500 text-black px-4 py-2 rounded-md flex items-center hover:bg-yellow-600"
          >
            <FiServer className="mr-2" />
            Go to Application
          </Link>
        </div>
      </div>
    </div>
  );
}
