'use client';

import React from 'react';
import TaskListButton from './TaskListButton';
import HabitsButton from './HabitsButton';
import ConquestButton from './ConquestButton';
import MissionsButton from './MissionsButton';

interface ButtonGroupProps {
  fadeIn: boolean;
  onTaskListClick: () => void;
  onHabitsClick: () => void;
  onConquestClick: () => void;
  onMissionsClick: () => void;
  orientation?: 'vertical' | 'horizontal';
}

export default function ButtonGroup({
  fadeIn,
  onTaskListClick,
  onHabitsClick,
  onConquestClick,
  onMissionsClick,
  orientation = 'horizontal'
}: ButtonGroupProps) {
  const isVertical = orientation === 'vertical';

  return (
    <div className={`
      ${isVertical 
        ? 'flex flex-col gap-3 w-56' 
        : 'flex justify-center items-center gap-3 sm:gap-6'
      }
    `}>
      <div className={isVertical ? "w-full" : "flex-shrink-0"}>
        <TaskListButton fadeIn={fadeIn} onClick={onTaskListClick} />
      </div>
      <div className={isVertical ? "w-full" : "flex-shrink-0"}>
        <HabitsButton fadeIn={fadeIn} onClick={onHabitsClick} />
      </div>
      <div className={isVertical ? "w-full" : "flex-shrink-0"}>
        <MissionsButton fadeIn={fadeIn} onClick={onMissionsClick} />
      </div>
      <div className={isVertical ? "w-full" : "flex-shrink-0"}>
        <ConquestButton fadeIn={fadeIn} onClick={onConquestClick} />
      </div>
    </div>
  );
} 