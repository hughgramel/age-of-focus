'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

  // Refactored Action Execution Logic with corrected bonus application
  const executeHabitActionWithBonus = (habit: Habit, date: Date, currentCompletions: Set<string>) => {
      const actionDef = FOCUS_ACTIONS.find(a => a.id === habit.actionType);
      if (actionDef) {
          const isTodayCompletion = isSameDay(date, todayObj);
          const streak = calculateStreak(currentCompletions);
          const bonusMultiplier = isTodayCompletion ? calculateBonusMultiplier(streak) : 1.0; // Apply bonus only if completed today

          if (isTodayCompletion && bonusMultiplier > 1.0) {
              console.log(`Habit ${habit.id} completed today - Streak: ${streak}, Bonus: ${bonusMultiplier.toFixed(1)}x`);
          }

          // Create a boosted version of player resources for calculation if bonus applies
          const boostedTotals: playerNationResourceTotals = bonusMultiplier > 1.0 ? {
              playerGold: Math.floor(playerNationResourceTotals.playerGold * bonusMultiplier),
              playerIndustry: Math.floor(playerNationResourceTotals.playerIndustry * bonusMultiplier),
              playerPopulation: Math.floor(playerNationResourceTotals.playerPopulation * bonusMultiplier),
              playerArmy: playerNationResourceTotals.playerArmy // Typically army gain isn't % based on current army
          } : playerNationResourceTotals; // Use original totals if no bonus

          // --- This wrapper simply passes the action to the original prop --- 
          // The bonus effect is now handled by passing boostedTotals to actionDef.execute
          const passthroughExecuteWrapper = (action: Omit<ActionUpdate, 'target'>) => {
              console.log(`Executing habit action (Bonus incorporated via boosted totals):`, action);
              executeActionUpdate(action); // Call the original prop function from GameView
          };

          // Call the action's execute method with the passthrough wrapper and potentially boosted totals
          actionDef.execute(passthroughExecuteWrapper, boostedTotals);
      }
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
    const actionDef = FOCUS_ACTIONS.find(a => a.id === habit.actionType);

    // --- Calculate and Store *ACTUAL* resources gained/lost (using boosted totals if applicable) --- //
    let actualResourcesChanged: Record<string, number> = {};
    if (actionDef) {
        // Correctly create the set for streak calculation based on whether we are completing or uncompleting
        const completionsForStreakCalc = new Set(habitCompletions);
        if (isCurrentlyCompleted) {
            completionsForStreakCalc.delete(dateKey);
        } else {
            completionsForStreakCalc.add(dateKey);
        }
        const streak = calculateStreak(completionsForStreakCalc);
        const bonusMultiplier = (isToday && !isCurrentlyCompleted) ? calculateBonusMultiplier(streak) : 1.0; // Bonus only when completing today

        const totalsForCalculation: playerNationResourceTotals = bonusMultiplier > 1.0 ? {
            playerGold: Math.floor(playerNationResourceTotals.playerGold * bonusMultiplier),
            playerIndustry: Math.floor(playerNationResourceTotals.playerIndustry * bonusMultiplier),
            playerPopulation: Math.floor(playerNationResourceTotals.playerPopulation * bonusMultiplier),
            playerArmy: playerNationResourceTotals.playerArmy
        } : playerNationResourceTotals;

        const captureResources = (actionUpdate: Omit<ActionUpdate, 'target'>) => {
            actionUpdate.updates.forEach((update: ResourceUpdate | NationResourceUpdate) => {
                actualResourcesChanged[update.resource] = (actualResourcesChanged[update.resource] || 0) + update.amount;
            });
        };
        actionDef.execute(captureResources, totalsForCalculation);
    }
     console.log(`[Toggle ${dateKey}] ${isCurrentlyCompleted ? 'Reversal' : 'Completion'} Calculated Actual Resources:`, actualResourcesChanged);


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

        // Use the actual calculated reversal amounts, fallback to stored if needed
        const resourcesToReverse = Object.keys(actualResourcesChanged).length > 0 ? actualResourcesChanged : storedResources;

        if (resourcesToReverse) {
          console.log("Reversing resources:", resourcesToReverse);
          const reversalUpdates: (ResourceUpdate | NationResourceUpdate)[] = Object.entries(resourcesToReverse)
            .map(([resource, amount]) => ({
              resource: resource as any, // Cast needed here
              amount: -amount // Negate the amount
            }))
            .filter(update => update.amount !== 0);

          if (reversalUpdates.length > 0) {
             // Split updates and execute reversal actions
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
        // Store the actual calculated resources
        const completionRecord = await HabitsService.completeHabit(userId, habit.id, date, actualResourcesChanged);

        if (completionRecord) {
          console.log(`Completed habit ${habit.id} for ${dateKey}, stored gains:`, actualResourcesChanged);
          // Trigger the *actual* action execution (which uses executeActionUpdate via wrapper)
          if (actionDef) {
            executeHabitActionWithBonus(habit, date, updatedCompletionsSet);
          }
        } else {
          console.log("Habit completion failed (maybe already done?), reverting UI.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-60" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg p-6 w-full max-w-4xl [font-family:var(--font-mplus-rounded)]" style={{ boxShadow: '0 4px 0 rgba(229,229,229,255)' }}>
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

        {/* Habit Table */}
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="text-center py-10 text-gray-800">Loading habits...</div>
          ) : habits.length === 0 ? (
            <div className="text-center py-10 text-gray-800">No habits created yet. Add one above!</div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-2 text-sm font-semibold text-gray-600 w-1/3">Habit</th>
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
              <tbody>
                {habits.map(habit => {
                  const habitCompletions = completions.get(habit.id) || new Set();
                  // Calculate streak based directly on habitCompletions
                  const streak = calculateStreak(habitCompletions);
                  const bonusMultiplier = calculateBonusMultiplier(streak);
                  const bonusText = bonusMultiplier > 1.0 ? `+${((bonusMultiplier - 1.0) * 100).toFixed(0)}%` : '-';

                  // Add more logging inside the loop
                  // console.log(`Rendering Habit: ${habit.title} (${habit.id}), Completions:`, habitCompletions);

                  return (
                    <tr key={habit.id} className="border-b border-gray-100 hover:bg-gray-50">
                      {/* Habit Title */}
                      <td className="py-3 px-2 text-base text-gray-800 font-medium align-middle">
                        {habit.title}
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
                      {/* Weekly Completion Cells - Updated for toggling */}
                      {weekDates.map(date => {
                        const dateKey = formatISO(date, { representation: 'date' });
                        const isCompleted = habitCompletions.has(dateKey);
                        const canToggle = !isFuture(date);
                        const isToday = isSameDay(date, todayObj);

                        return (
                          <td key={dateKey} className="py-2 px-1 text-center align-middle">
                            {canToggle ? (
                              <button
                                onClick={() => handleToggleCompletion(habit, date)}
                                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mx-auto transition-colors text-lg font-bold ${isCompleted
                                    ? 'bg-green-500 border-green-600 text-white hover:bg-green-600'
                                    : 'bg-gray-100 border-gray-300 text-gray-400 hover:border-green-500 hover:bg-green-100 hover:text-green-600'
                                  } ${isToday && !isCompleted ? 'border-blue-500' : (isToday ? 'border-green-700' : '')}`}
                                title={isCompleted ? `Mark as incomplete for ${format(date, 'MMM d')}` : `Mark as complete for ${format(date, 'MMM d')}`}
                              >
                                {isCompleted ? '✓' : ''}
                              </button>
                            ) : (
                              // Future date - non-interactive
                              <div className="w-7 h-7 rounded-full flex items-center justify-center mx-auto bg-gray-200 opacity-50">
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
        </div>
      </div>
    </div>
  );
} 