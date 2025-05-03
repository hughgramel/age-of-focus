'use client';

import React from 'react';
import TaskListButton from './TaskListButton';
import FocusNowButton from './FocusNowButton';
import HabitsButton from './HabitsButton';

interface ButtonGroupProps {
  fadeIn: boolean;
  hasActiveSession: boolean;
  onTaskListClick: () => void;
  onFocusClick: () => void;
  onHabitsClick: () => void;
  focusTimeRemaining: number;
}

export default function ButtonGroup({
  fadeIn,
  hasActiveSession,
  onTaskListClick,
  onFocusClick,
  onHabitsClick,
  focusTimeRemaining
}: ButtonGroupProps) {
  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center items-center gap-6">
      <div className="flex-1 flex justify-end">
        <TaskListButton fadeIn={fadeIn} onClick={onTaskListClick} />
      </div>
      <div className="flex-shrink-0">
        <FocusNowButton 
          fadeIn={fadeIn} 
          hasActiveSession={hasActiveSession} 
          onClick={onFocusClick} 
          focusTimeRemaining={focusTimeRemaining}
        />
      </div>
      <div className="flex-1">
        <HabitsButton fadeIn={fadeIn} onClick={onHabitsClick} />
      </div>
    </div>
  );
} 