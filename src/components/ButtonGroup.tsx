'use client';

import React from 'react';
import TaskListButton from './TaskListButton';
import FocusNowButton from './FocusNowButton';
import NationalPathButton from './NationalPathButton';

interface ButtonGroupProps {
  fadeIn: boolean;
  isModalOpen: boolean;
  hasActiveSession: boolean;
  onTaskListClick: () => void;
  onFocusClick: () => void;
  onNationalPathClick: () => void;
}

export default function ButtonGroup({
  fadeIn,
  isModalOpen,
  hasActiveSession,
  onTaskListClick,
  onFocusClick,
  onNationalPathClick
}: ButtonGroupProps) {
  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center items-center gap-6">
      <div className="flex-1 flex justify-end">
        <TaskListButton fadeIn={fadeIn} onClick={onTaskListClick} />
      </div>
      <div className="flex-shrink-0">
        <FocusNowButton 
          fadeIn={fadeIn} 
          isModalOpen={isModalOpen} 
          hasActiveSession={hasActiveSession} 
          onClick={onFocusClick} 
        />
      </div>
      <div className="flex-1">
        <NationalPathButton fadeIn={fadeIn} onClick={onNationalPathClick} />
      </div>
    </div>
  );
} 