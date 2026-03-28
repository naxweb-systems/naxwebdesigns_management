import { useState, useEffect } from 'react';
import { Key, AlertCircle } from 'lucide-react';

export default function Auth({ onAuthenticate }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if already authenticated in session
    const stored = sessionStorage.getItem('authenticated');
    if (stored === 'true') {
      setIsAuthenticated(true);
      onAuthenticate();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get passcode from environment variable
      const correctPasscode = import.meta.env.VITE_APP_PASSCODE;
      
      if (!correctPasscode) {
        setError('Passcode not configured. Please contact administrator.');
        setLoading(false);
        return;
      }
      
      if (passcode === correctPasscode) {
        sessionStorage.setItem('authenticated', 'true');
        setIsAuthenticated(true);
        onAuthenticate();
      } else {
        setError('Invalid passcode. Please try again.');
      }
    } catch (err) {
      setError('Failed to authenticate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
              <Key className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-blue-900 mb-2">
              Authentication Required
            </h1>
            <p className="text-gray-600">
              Enter your passcode to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter passcode"
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !passcode}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Verifying...
                </>
              ) : (
                <>
                  <Key size={18} />
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Protected by secure authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
