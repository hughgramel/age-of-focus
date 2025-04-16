import { useState } from 'react';
import { testFirebaseConnection } from '@/lib/firebase';

export default function FirebaseTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setStatus('testing');
    setError(null);
    try {
      const result = await testFirebaseConnection();
      setStatus(result ? 'success' : 'error');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Firebase Connection Test</h2>
      
      <button
        onClick={runTest}
        disabled={status === 'testing'}
        className={`px-4 py-2 rounded-md ${
          status === 'testing'
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white font-medium`}
      >
        {status === 'testing' ? 'Testing...' : 'Test Connection'}
      </button>

      {status === 'success' && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          ✅ Firebase connection successful! Check the console for details.
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          ❌ Connection failed: {error || 'Check the console for details'}
        </div>
      )}
    </div>
  );
} 