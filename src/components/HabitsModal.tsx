'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Habit, HabitCreate } from '@/types/habit';
import { HabitsService } from '@/services/habitsService';
import { FOCUS_ACTIONS, FocusAction, ActionType } from '@/data/actions';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, formatISO, startOfToday, subDays, isFuture } from 'date-fns';
import { ActionUpdate, ResourceUpdate, NationResourceUpdate } from '@/services/actionService';
import { playerNationResourceTotals } from './GameView';
import CustomDropdown from './CustomDropdown';

interface HabitsModalProps {
  userId: string;
  onClose: () => void;
  executeActionUpdate: (action: Omit<ActionUpdate, 'target'>) => void;
  playerNationResourceTotals: playerNationResourceTotals;
}

// Helper to get the dates for the current week (Sun-Sat)
const getWeekDates = () => {
  const today = startOfToday();
  const start = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
  const end = endOfWeek(today, { weekStartsOn: 0 }); // Saturday
  return eachDayOfInterval({ start, end });
};

// Calculate streak ending today within the last 7 days
const calculateStreak = (completedDates: Set<string>): number => {
  let streak = 0;
  const todayStr = formatISO(startOfToday(), { representation: 'date' });

  if (!completedDates.has(todayStr)) {
      return 0; // Must be completed today to have a streak ending today
  }

  for (let i = 0; i < 7; i++) {
    const dateToCheck = subDays(startOfToday(), i);
    const dateStr = formatISO(dateToCheck, { representation: 'date' });
    if (completedDates.has(dateStr)) {
      streak++;
    } else {
      break; // Streak broken
    }
  }
  return streak;
};

// Calculate bonus multiplier (1.0x to 1.7x)
const calculateBonusMultiplier = (streak: number): number => {
  return 1.0 + Math.min(streak, 7) * 0.1;
};

export default function HabitsModal({ userId, onClose, executeActionUpdate, playerNationResourceTotals }: HabitsModalProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  // Map<habitId, Set<YYYY-MM-DD completion dates>>
  const [completions, setCompletions] = useState<Map<string, Set<string>>>(new Map());
  const [newHabit, setNewHabit] = useState<HabitCreate>(() => {
    const lastActionType = localStorage.getItem('lastHabitActionType') || FOCUS_ACTIONS[0]?.id || 'invest'; // Default to first action
    return {
      title: '',
      actionType: lastActionType,
    };
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isHabitListScrollable, setIsHabitListScrollable] = useState(false);

  // Refs for scroll detection
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  const weekDates = useMemo(() => getWeekDates(), []); // Dates for the current week (Sun-Sat)
  const todayObj = useMemo(() => startOfToday(), []); // Use object for comparisons
  const todayStr = useMemo(() => formatISO(todayObj, { representation: 'date' }), [todayObj]);

  const loadHabitsAndCompletions = useCallback(async () => {
    setIsLoading(true);
    try {
      const userHabits = await HabitsService.getHabits(userId);
      setHabits(userHabits);
      console.log('Loaded habits:', userHabits);

      if (userHabits.length > 0) {
        const habitIds = userHabits.map(h => h.id);
        const weekStartDate = startOfWeek(startOfToday(), { weekStartsOn: 0 });
        const weeklyCompletions = await HabitsService.getCompletionsForHabitsForWeek(userId, habitIds, weekStartDate);
        setCompletions(weeklyCompletions);
        console.log('Loaded weekly completions:', weeklyCompletions);
      } else {
        setCompletions(new Map());
        console.log('No habits found, resetting completions.');
      }
    } catch (error) {
      console.error('Error loading habits or completions:', error);
      // Explicitly reset state on error
      setHabits([]);
      setCompletions(new Map());
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // Only load if userId is available
    if (userId) {
      console.log(`HabitsModal useEffect: Loading habits for userId: ${userId}`);
      loadHabitsAndCompletions();
    } else {
      console.log("HabitsModal useEffect: No userId yet, skipping load.");
      // Reset state if userId becomes null/undefined after initial load
      setHabits([]);
      setCompletions(new Map());
      setIsLoading(false); // Set loading to false if no userId
    }
  }, [userId, loadHabitsAndCompletions]); // Add userId as a direct dependency

  // Effect to check scrollability
  useEffect(() => {
    const checkScrollability = () => {
      const container = scrollContainerRef.current;
      const tableBody = tableBodyRef.current;

      if (container && tableBody) {
        // Change check to >= to trigger when content height equals or exceeds container height
        const scrollable = tableBody.scrollHeight >= container.clientHeight;
        setIsHabitListScrollable(scrollable);
        console.log('Checking scrollability:', { scrollHeight: tableBody.scrollHeight, clientHeight: container.clientHeight, scrollable });
      } else {
        setIsHabitListScrollable(false);
      }
    };

    // Increase timeout for DOM updates
    const timer = setTimeout(checkScrollability, 250); 

    return () => clearTimeout(timer); // Cleanup timer

  }, [habits, isLoading]); // Dependencies

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.title.trim()) return;

    try {
      console.log('Creating habit with data:', newHabit);
      localStorage.setItem('lastHabitActionType', newHabit.actionType);
      const habit = await HabitsService.createHabit(userId, newHabit);
      console.log('Created habit:', habit);
      setHabits(prev => [...prev, habit]); // Add to bottom
      setCompletions(prev => new Map(prev).set(habit.id, new Set())); // Add entry for completions
      setNewHabit(prev => ({
        title: '',
        actionType: prev.actionType, // Keep action type
      }));
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  // Refactored Action Execution Logic: Executes action and returns the processed updates.
  const executeHabitActionWithBonus = (habit: Habit, date: Date, currentCompletions: Set<string>): (ResourceUpdate | NationResourceUpdate)[] | null => {
      const actionDef = FOCUS_ACTIONS.find(a => a.id === habit.actionType);
      if (!actionDef) return null;

      const isTodayCompletion = isSameDay(date, todayObj);
      const streak = calculateStreak(currentCompletions);
      const bonusMultiplier = isTodayCompletion ? calculateBonusMultiplier(streak) : 1.0;

      if (isTodayCompletion && bonusMultiplier > 1.0) {
          console.log(`Habit ${habit.id} completed today - Streak: ${streak}, Bonus: ${bonusMultiplier.toFixed(1)}x`);
      }

      const boostedTotals: playerNationResourceTotals = bonusMultiplier > 1.0 ? {
          playerGold: Math.floor(playerNationResourceTotals.playerGold * bonusMultiplier),
          playerIndustry: Math.floor(playerNationResourceTotals.playerIndustry * bonusMultiplier),
          playerPopulation: Math.floor(playerNationResourceTotals.playerPopulation * bonusMultiplier),
          playerArmy: playerNationResourceTotals.playerArmy
      } : playerNationResourceTotals;

      let processedUpdates: (ResourceUpdate | NationResourceUpdate)[] = [];

      // Wrapper captures the action details *before* executing the state update
      const captureAndExecuteWrapper = (action: Omit<ActionUpdate, 'target'>) => {
          processedUpdates = [...action.updates]; // Capture the exact updates
          console.log(`Executing habit action (Bonus incorporated via boosted totals):`, action);
          executeActionUpdate(action); // Call the original prop function from GameView
      };

      // Call the action's execute method
      actionDef.execute(captureAndExecuteWrapper, boostedTotals);

      return processedUpdates; // Return the updates that were processed
  };

  // Refactored handler for toggling completion status
  const handleToggleCompletion = async (habit: Habit, date: Date) => {
    if (isFuture(date)) {
      console.log("Cannot toggle completion for a future date.");
      return;
    }

    const dateKey = formatISO(date, { representation: 'date' });
    const habitCompletions = completions.get(habit.id) || new Set();
    const isCurrentlyCompleted = habitCompletions.has(dateKey);
    const isToday = isSameDay(date, todayObj);
    // No need to find actionDef here, it's handled later

    // --- Optimistic UI Update --- //
    const updatedCompletionsSet = new Set(habitCompletions);
    if (isCurrentlyCompleted) {
      updatedCompletionsSet.delete(dateKey);
    } else {
      updatedCompletionsSet.add(dateKey);
    }
    const newCompletionsMap = new Map(completions).set(habit.id, updatedCompletionsSet);
    setCompletions(newCompletionsMap); // Update UI immediately

    // --- Backend Update & Action Execution --- //
    try {
      if (isCurrentlyCompleted) {
        // --- UN-COMPLETING --- //
        const storedResources = await HabitsService.uncompleteHabit(userId, habit.id, date);
        console.log(`Uncompleted habit ${habit.id} for ${dateKey}`);

        if (storedResources) {
          console.log("Reversing stored resources:", storedResources);
          const reversalUpdates: (ResourceUpdate | NationResourceUpdate)[] = Object.entries(storedResources)
            .map(([resource, amount]) => ({
              resource: resource as any,
              amount: -amount
            }))
            .filter(update => update.amount !== 0);

          if (reversalUpdates.length > 0) {
             // Split and execute reversal actions
             const provinceResourceKeys: Array<ResourceUpdate['resource']> = ['goldIncome', 'industry', 'army', 'population'];
             const nationResourceKeys: Array<NationResourceUpdate['resource']> = ['gold', 'researchPoints'];
             const provinceReversalUpdates = reversalUpdates.filter(u => provinceResourceKeys.includes(u.resource as any));
             const nationReversalUpdates = reversalUpdates.filter(u => nationResourceKeys.includes(u.resource as any));

             if (provinceReversalUpdates.length > 0) {
                executeActionUpdate({ type: 'resources', updates: provinceReversalUpdates as ResourceUpdate[] });
             }
             if (nationReversalUpdates.length > 0) {
                 executeActionUpdate({ type: 'resources', updates: nationReversalUpdates as NationResourceUpdate[] });
             }
          }
        }

      } else {
        // --- COMPLETING --- //
        let actualResourcesChanged: Record<string, number> = {};
        let processedUpdatesForStorage: (ResourceUpdate | NationResourceUpdate)[] = [];

        // Execute the action *first* if completing for today
        if (isToday) {
            const updatesResult = executeHabitActionWithBonus(habit, date, updatedCompletionsSet);
            if (updatesResult) {
                processedUpdatesForStorage = updatesResult;
                // Convert the updates array to the Record format for storage & popup
                updatesResult.forEach(update => {
                     actualResourcesChanged[update.resource] = (actualResourcesChanged[update.resource] || 0) + update.amount;
                });
            }
        }
        // If completing for a past day, actualResourcesChanged remains empty, action isn't triggered.

        // Store the completion record with the *actual* calculated resource changes (or empty if past day)
        const completionRecord = await HabitsService.completeHabit(userId, habit.id, date, actualResourcesChanged);

        if (completionRecord) {
          console.log(`Completed habit ${habit.id} for ${dateKey}, stored gains:`, actualResourcesChanged);

          // --- Show Popup Notification (using actualResourcesChanged) --- //
          if (isToday && Object.keys(actualResourcesChanged).length > 0) {
              const popup = document.createElement('div');
              popup.className = 'fixed bottom-6 right-6 z-[100] bg-white p-6 rounded-lg border border-gray-200 text-gray-800 [font-family:var(--font-mplus-rounded)] shadow-lg min-w-[320px]';
              popup.style.boxShadow = '0 4px 0 rgba(229,229,229,255)';
              popup.style.transform = 'translateY(-2px)';
              let content = `<h4 class="font-bold text-xl mb-3 text-green-600">🗓️ Habit Completed!</h4>`;
              content += `<ul class="text-base space-y-1.5">`;
              for (const [resource, amount] of Object.entries(actualResourcesChanged)) {
                if (amount !== 0) {
                  const sign = amount > 0 ? '+' : '';
                  const icon = getActionIcon(resource as ActionType);
                  content += `<li class="flex items-center gap-2">${icon} <span class="font-medium">${sign}${amount.toLocaleString()}</span> ${resource.charAt(0).toUpperCase() + resource.slice(1)}</li>`;
                }
              }
              content += `</ul>`;
              popup.innerHTML = content;
              document.body.appendChild(popup);
              setTimeout(() => popup.remove(), 4000);
          }
           // --- End Popup --- //

        } else {
          console.log("Habit completion storage failed (maybe already done?), reverting UI.");
          setCompletions(prev => new Map(prev).set(habit.id, new Set(habitCompletions))); // Revert UI
        }
      }
    } catch (error) { // Catch errors from both complete/uncomplete
      console.error(`Error toggling habit completion for ${dateKey}:`, error);
      setCompletions(prev => new Map(prev).set(habit.id, new Set(habitCompletions))); // Revert UI on error
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await HabitsService.deleteHabit(habitId);
      setHabits(habits.filter(h => h.id !== habitId));
      setCompletions(prev => {
        const newMap = new Map(prev);
        newMap.delete(habitId);
        return newMap;
      });
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const handleActionChange = async (habitId: string, newActionType: string) => {
    try {
      await HabitsService.updateHabit(habitId, { actionType: newActionType });
      setHabits(habits.map(h => h.id === habitId ? { ...h, actionType: newActionType } : h));
      console.log(`Updated action type for habit ${habitId} to ${newActionType}`);
    } catch (error) {
      console.error('Error updating habit action type:', error);
    }
  };

  // Helper to get icon for action type
  const getActionIcon = (actionType: ActionType): string => {
    switch (actionType) {
      case 'invest': return '💰';
      case 'develop': return '🏭';
      case 'improve_army': return '⚔️';
      case 'population_growth': return '👥';
      default: return '🎯';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out opacity-100"
    >
      {/* Transparent Backdrop for closing */}
      <div 
        className="absolute inset-0 z-0"
        onClick={onClose}
      ></div>

      {/* Make modal content relative and higher z-index - Add scale transition */}
      <div 
        className="relative z-10 bg-white rounded-lg p-6 w-full max-w-4xl [font-family:var(--font-mplus-rounded)] transition-transform duration-300 ease-in-out transform scale-100"
        style={{ boxShadow: '0 4px 0 rgba(229,229,229,255)' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl">🗓️</span>
            Weekly Habits
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Habit Creation Form */}
        <form onSubmit={handleCreateHabit} className="mb-6 border-b border-gray-200 pb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="habitTitle" className="block text-sm font-medium text-gray-700 mb-1">New Habit Title</label>
              <input
                id="habitTitle"
                type="text"
                placeholder="Enter habit name..."
                value={newHabit.title}
                onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 text-base"
                required
              />
            </div>
            <div className="w-full sm:w-[240px]">
              <label htmlFor="habitActionDropdown" className="block text-sm font-medium text-gray-700 mb-1">Associated Action</label>
              <CustomDropdown
                options={FOCUS_ACTIONS.filter(a => a.id !== 'auto').map(action => ({
                  value: action.id,
                  label: action.name,
                  icon: getActionIcon(action.id) // Use helper function for icon
                }))}
                value={newHabit.actionType}
                onChange={(value) => setNewHabit({ ...newHabit, actionType: value as ActionType })}
                className="w-full"
              />
            </div>
            <button
              type="submit"
              className="bg-[#67b9e7] text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-200 text-base w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer hover:transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
              style={{ boxShadow: '0 4px 0 #4792ba' }}
            >
              <span className="text-xl text-white">➕</span>
              Add Habit
            </button>
          </div>
        </form>

        {/* Habit Table Container - Add ref */}
        <div ref={scrollContainerRef} className="max-h-[40vh] overflow-y-auto pr-2 relative"> { /* Added relative positioning */ }
          {isLoading ? (
            <div className="text-center py-10 text-gray-800">Loading habits...</div>
          ) : habits.length === 0 ? (
            <div className="text-center py-10 text-gray-800">No habits created yet. Add one above!</div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-2 text-sm font-semibold text-gray-600 w-1/3">Habit</th>
                  <th className="py-3 px-1 text-center text-sm font-semibold text-gray-600 w-[50px]">Streak</th>
                  <th className="py-3 px-2 text-sm font-semibold text-gray-600 w-[200px]">Action</th>
                  {weekDates.map(date => (
                    <th key={formatISO(date)} className="py-3 px-1 text-center text-sm font-semibold text-gray-600 w-[40px]">
                      {format(date, 'E')}<br/>{format(date, 'd')}
                    </th>
                  ))}
                  <th className="py-3 px-2 text-center text-sm font-semibold text-gray-600 w-[60px]">Bonus</th>
                  <th className="py-3 px-1 text-center text-sm font-semibold text-gray-600 w-[40px]">Del</th>
                </tr>
              </thead>
              {/* Add ref to tbody */}
              <tbody ref={tableBodyRef}>
                {habits.map(habit => {
                  const habitCompletions = completions.get(habit.id) || new Set();
                  const streak = calculateStreak(habitCompletions);
                  const bonusMultiplier = calculateBonusMultiplier(streak);
                  const bonusText = bonusMultiplier > 1.0 ? `+${((bonusMultiplier - 1.0) * 100).toFixed(0)}%` : '-';
                  const isCompletedToday = habitCompletions.has(todayStr);

                  // Determine emoji style
                  const showGrayscale = streak === 0 && !isCompletedToday;

                  return (
                    <tr key={habit.id} className="border-b border-gray-100 hover:bg-gray-50">
                      {/* Habit Title */}
                      <td className="py-3 px-2 text-base text-gray-800 font-medium align-middle">
                        {habit.title}
                      </td>
                      {/* Streak Indicator Cell */}
                      <td className="py-3 px-1 text-center align-middle">
                        <span
                            className={`inline-block text-lg ${showGrayscale ? 'grayscale' : ''}`}
                            style={{ filter: showGrayscale ? 'grayscale(100%)' : 'none' }}
                            title={`Current Streak: ${streak}`}>
                                🔥
                        </span>
                        <span className="ml-1 text-sm font-semibold text-gray-700">{streak}</span>
                      </td>
                      {/* Action Dropdown */}
                      <td className="py-2 px-1 align-middle">
                        <CustomDropdown
                          options={FOCUS_ACTIONS.filter(a => a.id !== 'auto').map(action => ({
                            value: action.id,
                            label: action.name,
                            icon: getActionIcon(action.id) // Use helper function
                          }))}
                          value={habit.actionType}
                          onChange={(value) => handleActionChange(habit.id, value as ActionType)}
                          className="w-full text-sm"
                        />
                      </td>
                      {/* Weekly Completion Cells - Updated for toggling ONLY today */}
                      {weekDates.map(date => {
                        const dateKey = formatISO(date, { representation: 'date' });
                        const isCompleted = habitCompletions.has(dateKey);
                        const isToday = isSameDay(date, todayObj);
                        const isPast = !isToday && !isFuture(date);

                        return (
                          <td key={dateKey} className="py-2 px-1 text-center align-middle">
                            {isToday ? (
                              // Render the button ONLY for today
                              <button
                                onClick={() => handleToggleCompletion(habit, date)}
                                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mx-auto transition-colors text-lg font-bold ${isCompleted
                                    ? 'bg-green-500 border-green-600 text-white hover:bg-green-600'
                                    : 'bg-gray-100 border-blue-500 text-gray-400 hover:border-green-500 hover:bg-green-100 hover:text-green-600' // Add blue border when today & incomplete
                                  }`}
                                title={isCompleted ? `Mark as incomplete for today` : `Mark as complete for today`}
                              >
                                {isCompleted ? '✓' : ''}
                              </button>
                            ) : (
                              // Render static indicator for past or future days
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto ${isCompleted ? 'bg-green-500 text-white' : (isPast ? 'bg-gray-200' : 'bg-gray-200 opacity-50')}`}>
                                {isCompleted && <span className="text-lg font-bold">✓</span>}
                                {/* Optionally display something different for past empty vs future empty */}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      {/* Bonus Percentage */}
                      <td className={`py-3 px-2 text-center align-middle text-sm font-semibold ${bonusMultiplier > 1.0 ? 'text-green-600' : 'text-gray-500'}`}>
                        {bonusText}
                      </td>
                      {/* Delete Button */}
                      <td className="py-2 px-1 text-center align-middle">
                        <button
                          onClick={() => handleDeleteHabit(habit.id)}
                          className="w-7 h-7 rounded-full text-red-500 hover:bg-red-100 flex items-center justify-center mx-auto transition-colors font-bold text-lg"
                          title="Delete habit"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Scroll Down Indicator */}
          {isHabitListScrollable && (
              // Use relative/absolute positioning for finer control
              <div className="sticky bottom-0 left-0 right-0 h-8 pointer-events-none bg-gradient-to-t from-white via-white/90 to-white/0 relative"> { /* Add relative, set height, remove padding */ }
                  {/* Position span absolutely at the bottom center */}
                  <span className="absolute bottom-0 top-3 left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-600">
                      Scroll down for more habits ↓
                  </span>
              </div>
          )}
        </div>
      </div>
    </div>
  );
} 