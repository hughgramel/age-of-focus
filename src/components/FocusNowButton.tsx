'use client';

import React, { useState, useEffect } from 'react';
import FocusNowModal from './FocusNowModal';
import { SessionService } from '@/services/sessionService';

interface FocusNowButtonProps {
  userId: string;
}

const FocusNowButton: React.FC<FocusNowButtonProps> = ({ userId }) => {
  const [showModal, setShowModal] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  
  // Check for active sessions when component mounts or userId changes
  useEffect(() => {
    const checkForActiveSessions = async () => {
      try {
        const activeSessions = await SessionService.getActiveUserSessions(userId);
        const hasActive = activeSessions && activeSessions.length > 0;
        setHasActiveSession(hasActive);
        
        // If there's an active session, show the modal with the timer view
        if (hasActive) {
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error checking for active sessions:", error);
      }
    };
    
    if (userId) {
      checkForActiveSessions();
    }
  }, [userId]);
  
  // Also check for active sessions when modal is closed
  const handleCloseModal = async () => {
    setShowModal(false);
    
    // Check for active sessions again after modal is closed
    if (userId) {
      try {
        const activeSessions = await SessionService.getActiveUserSessions(userId);
        const hasActive = activeSessions && activeSessions.length > 0;
        setHasActiveSession(hasActive);
      } catch (error) {
        console.error("Error checking for active sessions:", error);
      }
    }
  };

  return (
    <>
      {/* Center buttons with absolute positioning */}
      <div className="flex flex-col items-center justify-center gap-4" >
        <div className="flex flex-col gap-4 w-full">
          {/* Focus Now button */}
          <button 
            className="w-full px-6 py-3 bg-[#1F1F1F] text-[#FFD78C] rounded-lg border border-[#FFD78C40] hover:bg-[#2A2A2A] transition-colors duration-200 font-semibold text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FFD78C40]"
            onClick={() => setShowModal(true)}
          >
            {hasActiveSession ? "Resume Active Session" : "Focus Now"}
          </button>

          {/* Tutorial button - Positioned right below Focus Now */}
          <button 
            className="w-full px-6 py-3 bg-transparent text-[#FFD78C] rounded-lg border border-[#FFD78C40] hover:bg-[#1F1F1F] transition-colors duration-200 font-semibold text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FFD78C40]"
            onClick={() => window.location.href = '/game?mode=demo'}
          >
            Tutorial
          </button>
        </div>
      </div>

      {/* Focus Now modal */}
      {showModal && (
        <FocusNowModal 
          userId={userId}
          onClose={handleCloseModal}
          hasActiveSession={hasActiveSession}
        />
      )}
    </>
  );
};

export default FocusNowButton; 