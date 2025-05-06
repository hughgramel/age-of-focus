'use client';

import React from 'react';
import TaskListButton from './TaskListButton';
import FocusNowButton from './FocusNowButton';
import HabitsButton from './HabitsButton';
import ConquestButton from './ConquestButton';
import MissionsButton from './MissionsButton';

interface ButtonGroupProps {
  fadeIn: boolean;
  hasActiveSession: boolean;
  onTaskListClick: () => void;
  onFocusClick: () => void;
  onHabitsClick: () => void;
  onConquestClick: () => void;
  onMissionsClick: () => void;
  focusTimeRemaining: number;
}

export default function ButtonGroup({
  fadeIn,
  hasActiveSession,
  onTaskListClick,
  onFocusClick,
  onHabitsClick,
  onConquestClick,
  onMissionsClick,
  focusTimeRemaining
}: ButtonGroupProps) {
  return (
    <div className="fixed bottom-4 sm:bottom-8 left-0 right-0 flex justify-center items-center gap-2 sm:gap-4 px-2 sm:px-0">
      <div className="flex-shrink-0">
        <TaskListButton fadeIn={fadeIn} onClick={onTaskListClick} />
      </div>
      <div className="flex-shrink-0">
        <HabitsButton fadeIn={fadeIn} onClick={onHabitsClick} />
      </div>
      <div className="flex-shrink-0">
        <FocusNowButton 
          fadeIn={fadeIn} 
          hasActiveSession={hasActiveSession} 
          onClick={onFocusClick} 
          focusTimeRemaining={focusTimeRemaining}
        />
      </div>
      <div className="flex-shrink-0">
        <MissionsButton fadeIn={fadeIn} onClick={onMissionsClick} />
      </div>
      <div className="flex-shrink-0">
        <ConquestButton fadeIn={fadeIn} onClick={onConquestClick} />
      </div>
    </div>
  );
} 