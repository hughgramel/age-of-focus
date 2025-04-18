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
        
        // Automatically show the modal if there's an active session
        if (hasActive && !showModal) {
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
  const handleCloseModal = () => {
    setShowModal(false);
    
    // Check for active sessions again after modal is closed
    if (userId) {
      const checkAgain = async () => {
        try {
          const activeSessions = await SessionService.getActiveUserSessions(userId);
          setHasActiveSession(activeSessions && activeSessions.length > 0);
        } catch (error) {
          console.error("Error checking for active sessions:", error);
        }
      };
      checkAgain();
    }
  };

  return (
    <>
      {/* Focus Now button */}
      <button 
        className="fixed bottom-6 right-6 px-6 py-3 bg-[#1F1F1F] text-[#FFD78C] rounded-lg border border-[#FFD78C40] hover:bg-[#2A2A2A] transition-colors duration-200 font-semibold text-lg z-50 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FFD78C40]"
        onClick={() => setShowModal(true)}
      >
        {hasActiveSession ? "Resume Active Session" : "Focus Now"}
      </button>

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