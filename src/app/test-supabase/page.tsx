'use client';

import { useEffect, useState } from 'react';

import { supabase, isSupabaseConfigured, isAdminClientAvailable } from '@/lib';

export default function TestSupabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean;
    supabaseAnonKey: boolean;
    serviceRoleKey: boolean;
    adminClientAvailable: boolean;
  }>({
    supabaseUrl: false,
    supabaseAnonKey: false,
    serviceRoleKey: false,
    adminClientAvailable: false,
  });

  useEffect(() => {
    // Check environment variables on client side
    setEnvStatus({
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      serviceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      adminClientAvailable: isAdminClientAvailable(),
    });
  }, []);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Check if environment variables are configured
        if (!isSupabaseConfigured()) {
          throw new Error('Supabase environment variables are not configured');
        }

        // Test basic connection by checking auth status
        // This is the most reliable way to test if Supabase is accessible
        const { error } = await supabase.auth.getSession();

        if (error) {
          throw new Error(`Connection failed: ${error.message}`);
        }

        setConnectionStatus('success');
        setTimestamp('Connection successful - Supabase client working');
      } catch (error) {
        setConnectionStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Supabase Connection Test</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Connection Status</h2>

          <div className="space-y-4">
            {/* Environment Variables Check */}
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  envStatus.supabaseUrl && envStatus.supabaseAnonKey ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-medium">
                Environment Variables:{' '}
                {envStatus.supabaseUrl && envStatus.supabaseAnonKey ? 'Configured' : 'Missing'}
              </span>
            </div>

            {/* Admin Client Check */}
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  envStatus.adminClientAvailable ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              <span className="text-sm font-medium">
                Admin Client:{' '}
                {envStatus.adminClientAvailable ? 'Available' : 'Not Available (Client-side)'}
              </span>
            </div>

            {/* Connection Status */}
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'loading'
                    ? 'bg-yellow-500'
                    : connectionStatus === 'success'
                      ? 'bg-green-500'
                      : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-medium">
                Database Connection:{' '}
                {connectionStatus === 'loading'
                  ? 'Testing...'
                  : connectionStatus === 'success'
                    ? 'Connected'
                    : 'Failed'}
              </span>
            </div>

            {/* Success Details */}
            {connectionStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800 text-sm">✅ Supabase connection successful!</p>
                {timestamp && (
                  <p className="text-green-700 text-xs mt-2">Server timestamp: {timestamp}</p>
                )}
              </div>
            )}

            {/* Error Details */}
            {connectionStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm">❌ Connection failed: {errorMessage}</p>
                <div className="mt-3 text-xs text-red-700">
                  <p>Please check:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Your .env.local file has the correct Supabase URL and keys</li>
                    <li>Your Supabase project is running and accessible</li>
                    <li>Your database is not paused (if using Supabase free tier)</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Loading State */}
            {connectionStatus === 'loading' && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-blue-800 text-sm">🔄 Testing Supabase connection...</p>
              </div>
            )}
          </div>

          {/* Environment Variables Display (for debugging) */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Environment Variables</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">NEXT_PUBLIC_SUPABASE_URL:</span>
                <span className="font-mono text-gray-800">
                  {envStatus.supabaseUrl ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <span className="font-mono text-gray-800">
                  {envStatus.supabaseAnonKey ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SUPABASE_SERVICE_ROLE_KEY:</span>
                <span className="font-mono text-gray-800">
                  {envStatus.serviceRoleKey ? '✅ Set (Server-only)' : '❌ Missing'}
                </span>
              </div>
            </div>

            {/* Server-side Environment Check */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-md font-medium text-gray-700 mb-2">Server-side Check</h4>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/test-env');
                    const data = await response.json();
                    console.log('Server environment variables:', data);
                    alert(
                      `Server check complete! Check console for details.\n\nService Role Key: ${data.variables.serviceRoleKey}\nLength: ${data.variables.serviceRoleKeyLength}`,
                    );
                  } catch (error) {
                    console.error('Error checking server environment:', error);
                    alert('Error checking server environment. See console for details.');
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Check Server Environment Variables
              </button>
              <p className="text-xs text-gray-500 mt-2">
                This will check what the server can see (including SUPABASE_SERVICE_ROLE_KEY)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
