'use client';

import { useState } from 'react';
import { executeSqlWithResult, tableExists, createTableIfNotExists } from '../../lib/dbUtils';

export default function DatabaseUtilsPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tableToCheck, setTableToCheck] = useState('');
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [newTableName, setNewTableName] = useState('');
  const [newTableColumns, setNewTableColumns] = useState('id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');

  const handleExecuteQuery = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Only allow SELECT queries for safety
      if (!query.trim().toLowerCase().startsWith('select')) {
        throw new Error('Only SELECT queries are allowed for safety reasons');
      }
      
      const data = await executeSqlWithResult(query);
      setResult(data);
    } catch (err: unknown) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckTable = async () => {
    if (!tableToCheck.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const exists = await tableExists(tableToCheck);
      setTableExists(exists);
    } catch (err: unknown) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTable = async () => {
    if (!newTableName.trim() || !newTableColumns.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await createTableIfNotExists(newTableName, newTableColumns);
      setResult(`Table ${newTableName} created or already exists`);
    } catch (err: unknown) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Utilities</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Execute SQL Query</h2>
        <p className="text-gray-600 mb-4">
          For safety reasons, only SELECT queries are allowed.
        </p>
        <div className="mb-4">
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a SELECT query..."
          />
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={handleExecuteQuery}
          disabled={isLoading}
        >
          {isLoading ? 'Executing...' : 'Execute Query'}
        </button>
        
        {result && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Check If Table Exists</h2>
        <div className="flex space-x-4 mb-4">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-md"
            value={tableToCheck}
            onChange={(e) => setTableToCheck(e.target.value)}
            placeholder="Enter table name..."
          />
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            onClick={handleCheckTable}
            disabled={isLoading}
          >
            {isLoading ? 'Checking...' : 'Check Table'}
          </button>
        </div>
        
        {tableExists !== null && (
          <div className={`p-3 rounded-md ${tableExists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Table <strong>{tableToCheck}</strong> {tableExists ? 'exists' : 'does not exist'}.
          </div>
        )}
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Create Table If Not Exists</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Table Name
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            placeholder="Enter table name..."
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Column Definitions
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            value={newTableColumns}
            onChange={(e) => setNewTableColumns(e.target.value)}
            placeholder="id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()"
          />
        </div>
        <button
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md"
          onClick={handleCreateTable}
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Table'}
        </button>
      </div>
    </div>
  );
}
