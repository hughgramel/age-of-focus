'use client';

import { useState, useEffect } from 'react';
import { FocusTimer } from '@/components/FocusTimer';
import { useAuth } from '@/contexts/AuthContext';
import { FocusSessionService } from '@/services/focusSessionService';
import { FocusSession } from '@/types/focusSession';

export default function FocusPage() {
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [timerConfig, setTimerConfig] = useState({
    focusDuration: 25,
    rewardInterval: 5,
    rewardAmount: 5
  });
  const [apAwarded, setApAwarded] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<FocusSession[]>([]);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    completedSessions: 0,
    avgSessionLength: 0
  });
  const [loading, setLoading] = useState(true);

  // Handle session completion
  const handleSessionComplete = () => {
    setApAwarded(prev => prev + 2); // Award 2 AP per completed session
    
    // Reload session data when a new session is completed
    if (user) {
      loadSessionData();
    }
  };

  // Load session history and stats
  const loadSessionData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get recent sessions
      const sessions = await FocusSessionService.getUserSessions(user.uid, 5);
      setSessionHistory(sessions);
      
      // Get session stats
      const stats = await FocusSessionService.getSessionStats(user.uid);
      setSessionStats(stats);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading session data:', err);
      setLoading(false);
    }
  };

  // Load session data on mount
  useEffect(() => {
    if (user) {
      loadSessionData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Handle settings change
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTimerConfig(prev => ({
      ...prev,
      [name]: parseInt(value, 10)
    }));
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#FFD700]">Focus Timer</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
        >
          <span>⚙️</span> Settings
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Timer Settings</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="focusDuration" className="block text-sm font-medium text-gray-300">
                Focus Duration (minutes)
              </label>
              <input
                type="number"
                id="focusDuration"
                name="focusDuration"
                min="1"
                max="60"
                value={timerConfig.focusDuration}
                onChange={handleConfigChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="rewardInterval" className="block text-sm font-medium text-gray-300">
                Reward Interval (minutes)
              </label>
              <input
                type="number"
                id="rewardInterval"
                name="rewardInterval"
                min="1"
                max="30"
                value={timerConfig.rewardInterval}
                onChange={handleConfigChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="rewardAmount" className="block text-sm font-medium text-gray-300">
                Break Reward (minutes)
              </label>
              <input
                type="number"
                id="rewardAmount"
                name="rewardAmount"
                min="1"
                max="15"
                value={timerConfig.rewardAmount}
                onChange={handleConfigChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left column: Timer */}
        <div>
          <FocusTimer
            initialFocusDuration={timerConfig.focusDuration}
            initialRewardInterval={timerConfig.rewardInterval}
            initialRewardAmount={timerConfig.rewardAmount}
            onSessionComplete={handleSessionComplete}
          />
        </div>
        
        {/* Right column: Stats and Session History */}
        <div className="space-y-8">
          {/* Stats Panel */}
          <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Your Focus Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-gray-400 text-sm">Total Sessions</div>
                <div className="text-2xl font-bold">{sessionStats.totalSessions}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-gray-400 text-sm">Total Focus Time</div>
                <div className="text-2xl font-bold">{Math.round(sessionStats.totalMinutes)} min</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-gray-400 text-sm">Completion Rate</div>
                <div className="text-2xl font-bold">
                  {sessionStats.totalSessions > 0 
                    ? Math.round((sessionStats.completedSessions / sessionStats.totalSessions) * 100) 
                    : 0}%
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-gray-400 text-sm">Avg. Session</div>
                <div className="text-2xl font-bold">{Math.round(sessionStats.avgSessionLength)} min</div>
              </div>
            </div>
          </div>
          
          {/* Session History */}
          <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Recent Sessions</h2>
            {loading ? (
              <div className="text-center py-4">Loading sessions...</div>
            ) : sessionHistory.length > 0 ? (
              <div className="space-y-3">
                {sessionHistory.map(session => (
                  <div key={session.id} className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">
                        {formatDate(session.timestamp)}
                      </div>
                      <div className="flex items-center">
                        <span className="text-[#FFD700] mr-1">⚡</span>
                        <span>{session.actionPointsAwarded}</span>
                      </div>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-400">
                      <span>Completed: {session.wasCompleted ? 'Yes' : 'No'}</span>
                      <span>Time: {Math.round(session.elapsedFocus)} min</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                No sessions yet. Start focusing to see your history!
              </div>
            )}
          </div>
          
          {/* Action Points display */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Action Points</h2>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-[#FFD700]">{apAwarded}</span>
                <span className="ml-2 text-yellow-500">⚡</span>
              </div>
            </div>
            <p className="mt-2 text-gray-300 text-sm">
              Complete focus sessions to earn Action Points (AP). You'll receive 2 AP for each completed session.
            </p>
            
            {apAwarded > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Available Actions:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setApAwarded(prev => Math.max(0, prev - 1))}
                    disabled={apAwarded < 1}
                    className="flex items-center justify-center gap-2 p-3 bg-blue-800 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <span>🏭</span> Build Factory (1 AP)
                  </button>
                  <button
                    onClick={() => setApAwarded(prev => Math.max(0, prev - 2))}
                    disabled={apAwarded < 2}
                    className="flex items-center justify-center gap-2 p-3 bg-red-800 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <span>⚔️</span> Train Army (2 AP)
                  </button>
                  <button
                    onClick={() => setApAwarded(prev => Math.max(0, prev - 2))}
                    disabled={apAwarded < 2}
                    className="flex items-center justify-center gap-2 p-3 bg-purple-800 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <span>🔬</span> Research (2 AP)
                  </button>
                  <button
                    onClick={() => setApAwarded(prev => Math.max(0, prev - 3))}
                    disabled={apAwarded < 3}
                    className="flex items-center justify-center gap-2 p-3 bg-green-800 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <span>🏰</span> Expand Territory (3 AP)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 