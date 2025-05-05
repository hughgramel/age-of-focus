'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskCreate } from '@/types/task';
import { TaskService } from '@/services/taskService';
import { FOCUS_ACTIONS, executeActions } from '@/data/actions';
import { format } from 'date-fns';
import { ActionUpdate } from '@/services/actionService';
import { playerNationResourceTotals } from './GameView';
import CustomDropdown from './CustomDropdown';

interface TaskModalProps {
  userId: string;
  onClose: () => void;
  onTaskComplete?: (task: Task) => void;
  executeActionUpdate: (action: Omit<ActionUpdate, 'target'>) => void;
  playerNationResourceTotals: playerNationResourceTotals;
}

export default function TaskModal({ userId, onClose, onTaskComplete, executeActionUpdate, playerNationResourceTotals }: TaskModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [newTask, setNewTask] = useState<TaskCreate>(() => {
    // Load the last selected action type from localStorage, default to 'invest' if none found
    const lastActionType = localStorage.getItem('lastTaskActionType') || 'invest';
    return {
      title: '',
      description: '',
      actionType: lastActionType,
    };
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [userId]);

  const loadTasks = async () => {
    try {
      const userTasks = await TaskService.getUserTasks(userId);
      console.log('Loaded tasks:', userTasks);
      setTasks(userTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    try {
      console.log('Creating task with data:', newTask);
      // Save the selected action type to localStorage
      localStorage.setItem('lastTaskActionType', newTask.actionType);
      const task = await TaskService.createTask(userId, {
        ...newTask,
        description: '', // We're not using description anymore
      });
      console.log('Created task:', task);
      setTasks([task, ...tasks]);
      setNewTask(prev => ({
        title: '',
        description: '',
        actionType: prev.actionType, // Keep the same action type for the next task
      }));
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      await TaskService.completeTask(task.id, task);
      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: true, actionCompleted: true } : t));
      
      // Execute the action associated with this task
      const action = FOCUS_ACTIONS.find(a => a.id === task.actionType);
      if (action) {
        console.log("Calling action.execute for task:", action);
        // Directly call the action's execute method, passing the callback
        action.execute(executeActionUpdate, playerNationResourceTotals);
      }

      if (onTaskComplete) {
        onTaskComplete(task);
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await TaskService.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => 
    activeTab === 'active' ? !task.completed : task.completed
  );

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-40 sm:pt-28 md:pt-21 lg:pt-21 xl:pt-21 2xl:pt-21  transition-opacity duration-300 ease-in-out opacity-100"
    >
      {/* Transparent Backdrop for closing */}
      <div 
        className="absolute inset-0 z-0"
        onClick={onClose}
      ></div>

      {/* Modal Content Container - Add scale transition */}
      <div 
        className={`relative z-10 bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg sm:max-w-2xl [font-family:var(--font-mplus-rounded)] transition-transform duration-300 ease-in-out transform scale-100 mx-4 sm:mx-auto`}
        style={{ boxShadow: '0 4px 0 rgba(229,229,229,255)' }}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">📋</span>
            Tasks
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleCreateTask} className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Stack input and dropdown on small screens */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Enter task..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-base sm:text-lg"
                required
              />
              <CustomDropdown
                options={FOCUS_ACTIONS.map(action => ({
                  value: action.id,
                  label: action.id === 'invest' ? 'Economy' : 
                         action.id === 'develop' ? 'Industry' : 
                         action.id === 'improve_army' ? 'Army' : 
                         action.id === 'population_growth' ? 'Pop.' : 
                         action.name,
                  icon: (() => {
                    switch (action.id) {
                      case 'invest': return '💰';
                      case 'develop': return '🏭';
                      case 'improve_army': return '⚔️';
                      case 'population_growth': return '👥';
                      default: return '🎯';
                    }
                  })()
                }))}
                value={newTask.actionType}
                onChange={(value) => setNewTask({ ...newTask, actionType: value as any })}
                className="w-full sm:w-[240px] text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              className="bg-[#67b9e7] text-white py-2 sm:py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-200 text-base sm:text-lg w-full flex items-center justify-center gap-2 cursor-pointer hover:transform hover:-translate-y-0.5 active:translate-y-0"
              style={{ boxShadow: '0 4px 0 #4792ba' }}
            >
              <span className="text-xl sm:text-2xl text-white">➕</span>
              Add Task
            </button>
          </div>
        </form>

        <div className="border-t border-gray-200">
          <div className="flex gap-2 sm:gap-4 -mb-px">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-2 sm:px-4 font-semibold text-base sm:text-lg border-b-2 transition-colors ${
                activeTab === 'active'
                  ? 'border-[#67b9e7] text-[#67b9e7]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Active ({activeTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-2 sm:px-4 font-semibold text-base sm:text-lg border-b-2 transition-colors ${
                activeTab === 'completed'
                  ? 'border-[#67b9e7] text-[#67b9e7]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Completed ({completedTasks.length})
            </button>
          </div>
          
          <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 pt-4 sm:pt-6">
            {isLoading ? (
              <div className="text-center py-4 text-gray-800 text-sm sm:text-base">Loading tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-4 text-gray-800 text-sm sm:text-base">
                {activeTab === 'active' ? 'No active tasks' : 'No completed tasks'}
              </div>
            ) : (
              filteredTasks.map(task => {
                console.log('Rendering task:', task);
                return (
                  <div
                    key={task.id}
                    className={`p-2 sm:p-4 rounded-lg border ${
                      task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                    }`}
                    style={{ boxShadow: '0 2px 0 rgba(229,229,229,255)' }}
                  >
                    <div className="flex flex-row justify-between items-center">
                      <div className="flex-1 mr-2">
                        <h3 className={`text-base sm:text-lg font-semibold ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'} leading-tight`}>
                          {task.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0 text-xs sm:text-sm text-gray-800">
                          {(() => {
                            const getActionEffect = () => {
                              switch (task.actionType) {
                                case 'invest': {
                                  const goldGain = 1000 + Math.floor(playerNationResourceTotals.playerGold * 0.15);
                                  return `+${goldGain.toLocaleString()} 💰`;
                                }
                                case 'develop': {
                                  const industryGain = 200 + Math.floor(playerNationResourceTotals.playerIndustry * 0.1);
                                  return `+${industryGain.toLocaleString()} 🏭`;
                                }
                                case 'improve_army': {
                                  const armyGain = Math.floor(playerNationResourceTotals.playerPopulation * 0.0006);
                                  return `+${armyGain.toLocaleString()} ⚔️`;
                                }
                                case 'population_growth': {
                                  const popGain = Math.floor(playerNationResourceTotals.playerPopulation * 0.0010);
                                  return `+${popGain.toLocaleString()} 👥`;
                                }
                                default:
                                  return '';
                              }
                            };

                            return (
                              <span className="text-sm sm:text-base font-medium">
                                {getActionEffect()}
                              </span>
                            );
                          })()}
                          <span>•</span>
                          <span>🕒 {format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!task.completed && (
                          <button
                            onClick={() => handleCompleteTask(task)}
                            className="px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-white hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-1 text-sm sm:text-base [font-family:var(--font-mplus-rounded)] cursor-pointer hover:transform hover:-translate-y-0.5 active:translate-y-0"
                            style={{ 
                              backgroundColor: '#6ec53e',
                              boxShadow: '0 3px 0 rgba(89,167,0,255)',
                              transform: 'translateY(-1px)'
                            }}
                          >
                            <span className="text-base sm:text-lg">✓</span>
                            <span className="hidden sm:inline">Complete</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-white hover:opacity-90 transition-all duration-200 flex items-center justify-center text-lg sm:text-xl ml-1 sm:ml-2 [font-family:var(--font-mplus-rounded)] font-bold cursor-pointer hover:transform hover:-translate-y-0.5 active:translate-y-0"
                          style={{ 
                            backgroundColor: '#dc2626',
                            boxShadow: '0 3px 0 #991b1b',
                            transform: 'translateY(-1px)'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 