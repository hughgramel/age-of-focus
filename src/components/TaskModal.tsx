'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Task, TaskCreate, TaskUpdate } from '@/types/task';
import { Tag } from '@/types/tag';
import { TaskService } from '@/services/taskService';
import { TagService } from '@/services/tagService';
import { FOCUS_ACTIONS, executeActions } from '@/data/actions';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { ActionUpdate } from '@/services/actionService';
import { playerNationResourceTotals } from './GameView';
import CustomDropdown from './CustomDropdown';
import TagSelector from './TagSelector';
import MiniTagSelector from './MiniTagSelector';
import ColorPalettePicker from './ColorPalettePicker';

interface TaskModalProps {
  userId: string;
  onClose: () => void;
  onTaskComplete?: (task: Task) => void;
  executeActionUpdate: (action: Omit<ActionUpdate, 'target'>) => void;
  playerNationResourceTotals: playerNationResourceTotals;
}

const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#78716c', '#a1a1aa'
];
// const DEFAULT_TAG_COLOR = '#d1d5db'; // Keep for reference or other direct creations if any

// Helper function for Cmd+A/Ctrl+A text selection
const handleInputSelectAll = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'a') {
    event.currentTarget.select();
    // Do not call event.preventDefault() as we want the selection to happen.
    // Do not call event.stopPropagation() unless it is found to be necessary
    // to prevent an erroneous parent handler from interfering after selection.
  }
};

export default function TaskModal({ userId, onClose, onTaskComplete, executeActionUpdate, playerNationResourceTotals }: TaskModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Map<string, Tag>>(new Map());
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [filterTagId, setFilterTagId] = useState<string>('');
  const [newTask, setNewTask] = useState<Omit<TaskCreate, 'actionType' | 'tagId'> & { actionType: string, tagId: string | null }>(() => {
    const lastActionType = localStorage.getItem('lastTaskActionType') || FOCUS_ACTIONS[0]?.id || 'invest';
    const lastTagId = localStorage.getItem('lastTaskTagId') || null;
    return {
      title: '',
      description: '',
      actionType: lastActionType,
      tagId: lastTagId
    };
  });
  const [isLoading, setIsLoading] = useState(true);
  const [editingTagColor, setEditingTagColor] = useState<{ tag: Tag; anchorEl: HTMLButtonElement | null } | null>(null);

  const activeTags = useMemo(() => Array.from(tags.values()).filter(tag => !tag.isDeleted /* && !tag.isArchived if such a field exists */), [tags]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [userTasks, userTags] = await Promise.all([
        TaskService.getUserTasks(userId),
        TagService.getUserTags(userId, true)
      ]);
      setTasks(userTasks);
      setTags(new Map(userTags.map(tag => [tag.id, tag])));
    } catch (error) {
      console.error('Error loading tasks or tags:', error);
      setTasks([]);
      setTags(new Map());
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    loadData();
  }, [userId, loadData]);

  const handleTagCreate = async (name: string): Promise<Tag | null> => {
    try {
      // Determine color for the new tag
      const newColorIndex = activeTags.length % COLOR_PALETTE.length;
      const newTagColor = COLOR_PALETTE[newColorIndex];

      const newTag = await TagService.createTag(userId, { name, color: newTagColor });
      setTags(prev => new Map(prev).set(newTag.id, newTag));
      return newTag;
    } catch (error) {
      console.error("Error creating tag:", error);
      return null;
    }
  };

  const handleTagColorSelect = async (tagId: string, newColor: string) => {
    try {
      await TagService.updateTagColor(tagId, newColor);
      setTags(prev => {
        const newMap = new Map(prev);
        const tag = newMap.get(tagId);
        if (tag) {
          newMap.set(tagId, { ...tag, color: newColor });
        }
        return newMap;
      });
      setEditingTagColor(null);
    } catch (error) {
      console.error("Error updating tag color:", error);
    }
  };
  
  const handleTaskTagUpdate = async (taskId: string, newTagId: string | null) => {
      try {
          await TaskService.updateTaskTag(taskId, newTagId);
          setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, tagId: newTagId } : t));
      } catch (error) {
          console.error("Error updating task tag:", error);
      }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    try {
      localStorage.setItem('lastTaskActionType', newTask.actionType);
      if (newTask.tagId) {
          localStorage.setItem('lastTaskTagId', newTask.tagId);
      } else {
          localStorage.removeItem('lastTaskTagId');
      }

      const taskToCreate: TaskCreate = {
          title: newTask.title,
          actionType: newTask.actionType,
          tagId: newTask.tagId
      }
      const task = await TaskService.createTask(userId, taskToCreate);
      setTasks([task, ...tasks]);
      setNewTask(prev => ({
        title: '',
        description: '',
        actionType: prev.actionType,
        tagId: prev.tagId
      })); 
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      await TaskService.completeTask(task.id, task);
      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: true, actionCompleted: true } : t));
      
      const action = FOCUS_ACTIONS.find(a => a.id === task.actionType);
      if (action) {
        action.execute(executeActionUpdate, playerNationResourceTotals);
      }

      if (onTaskComplete) {
        onTaskComplete(task);
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleUncompleteTask = async (task: Task) => {
    try {
      await TaskService.updateTask(task.id, { completed: false, actionCompleted: false });
      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: false, actionCompleted: false } : t));
    } catch (error) {
      console.error('Error uncompleting task:', error);
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

  const handleTagArchive = async (tagId: string) => {
    try {
      // Call TagService to delete the tag from Firebase
      await TagService.deleteTag(tagId);
      console.log(`Tag ${tagId} deleted successfully from backend.`);

      // Update local state to remove the tag without a full reload
      setTags(prevTags => {
        const newTags = new Map(prevTags);
        newTags.delete(tagId);
        return newTags;
      });

      // If the deleted tag was selected for the new task, clear it
      if (newTask.tagId === tagId) {
        setNewTask(prevNewTask => ({ ...prevNewTask, tagId: null }));
      }

      // Tasks that had this tagId will now show "+ Add Tag" in MiniTagSelector
      // because their tagId will no longer be found in activeTags.
      // No need to iterate and update tasks' tagId locally unless specifically required
      // for other logic, as the display will handle it.

    } catch (error) {
      console.error(`Error deleting tag ${tagId}:`, error);
      // Optionally, show an error message to the user
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeTab === 'active' ? !task.completed : task.completed;
    const matchesTag = filterTagId === '' || task.tagId === filterTagId;
    return matchesTab && matchesTag;
  });

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const tagFilterOptions = useMemo(() => {
    const uniqueTagIdsInTasks = new Set<string>();
    tasks.forEach(task => {
      if (task.tagId) uniqueTagIdsInTasks.add(task.tagId);
    });
    const optionsFromTags = Array.from(uniqueTagIdsInTasks).map(tagId => {
      const tag = tags.get(tagId);
      return { value: tagId, label: tag ? tag.name : 'Unknown Tag', icon: '🏷️' }; 
    });
    return [{ value: '', label: 'All Tags', icon: '🏷️' }, ...optionsFromTags];
  }, [tasks, tags]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out opacity-100">
      <div className="absolute inset-0 z-0" onClick={onClose}></div>
      <div 
        className="relative z-10 bg-white rounded-lg p-5 sm:p-7 w-full max-w-md sm:max-w-4xl [font-family:var(--font-mplus-rounded)] transition-transform duration-300 ease-in-out transform scale-100 mx-6 sm:mx-auto border-2 border-gray-300"
        style={{ boxShadow: '0 3px 0px #d1d5db' }}
      >
        <div className="flex justify-between items-center mb-3 sm:mb-7">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl sm:text-4xl">📋</span>
            Tasks
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleCreateTask} className="pb-3 sm:pb-4">
          <div className="flex flex-row gap-2.5 sm:gap-5 items-end w-full">
            <div className="flex-1 min-w-[165px]">
              <label htmlFor="taskTitle" className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5">New Task</label>
              <input
                id="taskTitle"
                type="text"
                placeholder="Enter task..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                onKeyDown={handleInputSelectAll}
                className="w-full px-3.5 py-2.5 sm:px-5 sm:py-3.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 text-sm sm:text-base"
                required
              />
            </div>

            <div className="w-[132px] sm:w-[198px] flex-shrink-0">
              <label htmlFor="taskTagSelector" className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5">Tag</label>
              <TagSelector
                 userId={userId}
                 availableTags={activeTags}
                 selectedTagId={newTask.tagId}
                 onTagSelect={(tagId) => setNewTask({...newTask, tagId: tagId})}
                 onTagCreate={handleTagCreate}
                 onColorChangeRequest={(tag) => { }}
                 onTagArchiveRequest={handleTagArchive}
                 className="w-full text-sm sm:text-base"
              />
            </div>

            <div className="w-[132px] sm:w-[198px] flex-shrink-0">
              <label htmlFor="taskActionDropdown" className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5">Action Reward</label>
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
                className="w-full text-sm sm:text-base"
              />
            </div>

            <div className="flex-shrink-0 relative" style={{ top: '0px'}}>
              <button
                type="submit"
                className="bg-[#67b9e7] text-white py-2.5 px-3.5 sm:py-3.5 sm:px-5 rounded-lg font-semibold hover:opacity-90 transition-all duration-150 text-sm sm:text-base w-auto flex items-center justify-center gap-1.5 sm:gap-2.5 cursor-pointer border-2 border-[#4792ba] hover:bg-[#5aa8d6] active:bg-[#4792ba] hover:translate-y-[-1px] active:translate-y-[0.5px] active:shadow-[0_1px_0px_#4792ba] whitespace-nowrap"
                style={{ boxShadow: '0 3px 0px #4792ba' }}
              >
                <span className="text-xl sm:text-2xl text-white">➕</span>
                <span className="hidden sm:inline">Add Task</span>
              </button>
            </div>
          </div>
        </form>

        <div className="">
          <div className="flex justify-between items-center -mb-px">
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-2 py-2 sm:px-3 font-semibold text-xs sm:text-sm border-b-2 transition-colors ${activeTab === 'active' ? 'border-[#67b9e7] text-[#67b9e7]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Active ({activeTasks.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-2 py-2 sm:px-3 font-semibold text-xs sm:text-sm border-b-2 transition-colors ${activeTab === 'completed' ? 'border-[#67b9e7] text-[#67b9e7]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Completed ({completedTasks.length})
              </button>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Filter Tag:</span>
              <CustomDropdown
                options={tagFilterOptions}
                value={filterTagId}
                onChange={(value) => setFilterTagId(value as string)}
                className="w-[120px] sm:w-[150px] text-xs"
              />
            </div>
          </div>
          
          <div className="space-y-4 max-h-[38vh] overflow-y-auto pr-2 pt-2 sm:pt-3">
            {isLoading ? (
              <div className="text-center py-4 text-gray-800 text-sm sm:text-base">Loading...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-4 text-gray-800 text-sm sm:text-base">
                {activeTab === 'active' ? 'No active tasks' : 'No completed tasks'}
              </div>
            ) : (
              filteredTasks.map(task => {
                const tag = task.tagId ? tags.get(task.tagId) : null;

                return (
                  <div
                    key={task.id}
                    className={`p-2 sm:p-3 rounded-lg border ${task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}
                    style={{ boxShadow: '0 2px 0 rgba(229,229,229,255)' }}
                  >
                    <div className="flex flex-row justify-between items-center">
                      <div className="flex-1 mr-2">
                        <h3 className={`text-sm sm:text-base font-semibold ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'} leading-tight mb-1`}>
                          {task.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0 text-xs text-gray-500">
                          {(() => {
                              const getActionEffect = () => {
                              switch (task.actionType) {
                                case 'invest': { const goldGain = 1000 + Math.floor(playerNationResourceTotals.playerGold * 0.15); return `+${goldGain.toLocaleString()} 💰`; }
                                case 'develop': { const industryGain = 200 + Math.floor(playerNationResourceTotals.playerIndustry * 0.1); return `+${industryGain.toLocaleString()} 🏭`; }
                                case 'improve_army': { const armyGain = Math.floor(playerNationResourceTotals.playerPopulation * 0.0006); return `+${armyGain.toLocaleString()} ⚔️`; }
                                case 'population_growth': { const popGain = Math.floor(playerNationResourceTotals.playerPopulation * 0.0010); return `+${popGain.toLocaleString()} 👥`; }
                                default: return '';
                              }
                            };
                            return (
                              <span className="text-xs sm:text-sm font-medium text-gray-600">
                                {getActionEffect()}
                              </span>
                            );
                          })()}
                          
                          {!task.completed && (
                              <>
                                <span>•</span>
                                <MiniTagSelector
                                  availableTags={activeTags}
                                  selectedTagId={task.tagId ?? null}
                                  onTagSelect={(newTagId) => handleTaskTagUpdate(task.id, newTagId)}
                                  onTriggerColorEditor={(tagToEdit, anchorEl) => {
                                    setEditingTagColor({ tag: tagToEdit, anchorEl: anchorEl as HTMLButtonElement });
                                  }}
                                  dropdownWidth="w-40"
                                />
                              </>
                          )}
                          {(task.completed && task.tagId && tags.has(task.tagId)) && (
                            <>
                                <span>•</span>
                                <span 
                                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs"
                                  style={{ backgroundColor: tags.get(task.tagId)!.color + '20', color: tags.get(task.tagId)!.color }}
                                >
                                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tags.get(task.tagId)!.color }}></span>
                                  {tags.get(task.tagId)!.name}
                                </span>
                             </>
                          )}

                          <span>•</span>
                          <span>🕒 {format(task.createdAt instanceof Timestamp ? task.createdAt.toDate() : task.createdAt, 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {!task.completed && (
                          <button
                            onClick={() => handleCompleteTask(task)}
                            className="px-2 py-1 sm:px-2 sm:py-1.5 rounded-lg text-white hover:opacity-90 transition-all duration-150 flex items-center justify-center gap-1 text-xs sm:text-sm font-semibold cursor-pointer border-2 border-[#59a700] bg-[#6ec53e] hover:bg-[#60b33a] active:bg-[#539e30] hover:translate-y-[-1px] active:translate-y-[0.5px] active:shadow-[0_1px_0px_#59a700]"
                            style={{ boxShadow: '0 3px 0px #59a700' }}
                          >
                            <span className="text-sm sm:text-base">✓</span>
                            <span className="hidden sm:inline">Complete</span>
                          </button>
                        )}
                        {task.completed && (
                          <button
                            onClick={() => handleUncompleteTask(task)}
                            className="px-2 py-1 sm:px-2 sm:py-1.5 rounded-lg text-white hover:opacity-90 transition-all duration-150 flex items-center justify-center gap-1 text-xs sm:text-sm font-semibold cursor-pointer border-2 border-[#059669] bg-[#10b981] hover:bg-[#059669] active:bg-[#047857] hover:translate-y-[-1px] active:translate-y-[0.5px] active:shadow-[0_1px_0px_#059669]"
                            style={{ boxShadow: '0 3px 0px #059669' }}
                            title="Restore to Active"
                          >
                            <span className="text-sm sm:text-base">↩️</span>
                            <span className="hidden sm:inline">Restore</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className={`
                            w-7 h-7 sm:w-8 sm:h-8 
                            rounded-lg text-white font-bold
                            flex items-center justify-center 
                            transition-all duration-150 ease-in-out
                            text-base sm:text-lg 
                            hover:translate-y-[-1px] active:translate-y-[0.5px]
                            border-2
                          `}
                          style={{
                            backgroundColor: '#ef4444', // red-500
                            borderColor: '#b91c1c', // red-700
                            boxShadow: '0 3px 0px #b91c1c', // red-700
                          }}
                          onMouseDown={(e) => {
                            e.currentTarget.style.boxShadow = '0 1px 0px #b91c1c'; // red-700
                          }}
                          onMouseUp={(e) => {
                            e.currentTarget.style.boxShadow = '0 3px 0px #b91c1c'; // red-700
                          }}
                          onMouseLeave={(e) => { 
                            if (e.buttons === 1) { // If mouse button is still pressed while leaving
                                e.currentTarget.style.boxShadow = '0 3px 0px #b91c1c'; // red-700
                            }
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

        {editingTagColor && (
            <ColorPalettePicker
                tagToEdit={editingTagColor.tag}
                onColorSelect={handleTagColorSelect}
                onClose={() => setEditingTagColor(null)}
                triggerElement={editingTagColor.anchorEl}
            />
        )}

      </div>
    </div>
  );
} 