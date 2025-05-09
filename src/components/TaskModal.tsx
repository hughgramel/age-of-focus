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
const DEFAULT_TAG_COLOR = '#d1d5db';

export default function TaskModal({ userId, onClose, onTaskComplete, executeActionUpdate, playerNationResourceTotals }: TaskModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Map<string, Tag>>(new Map());
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
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
  const [editingTaskTag, setEditingTaskTag] = useState<{ taskId: string; anchorEl: HTMLButtonElement | null } | null>(null);
  const [editingTagColor, setEditingTagColor] = useState<{ tag: Tag; anchorEl: HTMLButtonElement | null } | null>(null);
  const editTagButtonRef = useRef<HTMLButtonElement>(null);
  const editColorButtonRef = useRef<HTMLButtonElement>(null);

  const activeTags = useMemo(() => Array.from(tags.values()).filter(tag => !tag.isDeleted), [tags]);

  useEffect(() => {
    if (!userId) return;
    
    const loadData = async () => {
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
    };
    loadData();
  }, [userId]);

  const handleTagCreate = async (name: string): Promise<Tag | null> => {
    try {
      const newTag = await TagService.createTag(userId, { name, color: DEFAULT_TAG_COLOR });
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
          setEditingTaskTag(null);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out opacity-100">
      <div className="absolute inset-0 z-0" onClick={onClose}></div>
      <div 
        className="relative z-10 bg-white rounded-lg p-4 sm:p-6 w-full max-w-md sm:max-w-4xl [font-family:var(--font-mplus-rounded)] transition-transform duration-300 ease-in-out transform scale-100 mx-6 sm:mx-auto border-2 border-gray-300"
        style={{ boxShadow: '0 3px 0px #d1d5db' }}
      >
        <div className="flex justify-between items-center mb-2 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">📋</span>
            Tasks
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleCreateTask} className=" pb-2 sm:pb-3">
          <div className="flex flex-row gap-2 sm:gap-4 items-end w-full">
            <div className="flex-1 min-w-[150px]">
              <label htmlFor="taskTitle" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">New Task</label>
              <input
                id="taskTitle"
                type="text"
                placeholder="Enter task..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 text-sm sm:text-base"
                required
              />
            </div>

            <div className="w-[120px] sm:w-[180px] flex-shrink-0">
              <label htmlFor="taskTagSelector" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Tag</label>
              <TagSelector
                 userId={userId}
                 availableTags={activeTags}
                 selectedTagId={newTask.tagId}
                 onTagSelect={(tagId) => setNewTask({...newTask, tagId: tagId})}
                 onTagCreate={handleTagCreate}
                 onColorChangeRequest={(tag) => { }}
                 className="w-full text-sm"
              />
            </div>

            <div className="w-[120px] sm:w-[180px] flex-shrink-0">
              <label htmlFor="taskActionDropdown" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Action Reward</label>
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
                className="w-full text-sm"
              />
            </div>

            <div className="flex-shrink-0 relative" style={{ top: '0px'}}>
              <button
                type="submit"
                className="bg-[#67b9e7] text-white py-2 px-3 sm:py-3 sm:px-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-150 text-sm sm:text-base w-auto flex items-center justify-center gap-1 sm:gap-2 cursor-pointer border-2 border-[#4792ba] hover:bg-[#5aa8d6] active:bg-[#4792ba] hover:translate-y-[-1px] active:translate-y-[0.5px] active:shadow-[0_1px_0px_#4792ba] whitespace-nowrap"
                style={{ boxShadow: '0 3px 0px #4792ba' }}
              >
                <span className="text-lg sm:text-xl text-white">➕</span>
                <span className="hidden sm:inline">Add Task</span>
              </button>
            </div>
          </div>
        </form>

        <div className="">
          <div className="flex gap-2 sm:gap-4 -mb-px">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-2 sm:px-4 font-semibold text-sm sm:text-base border-b-2 transition-colors ${activeTab === 'active' ? 'border-[#67b9e7] text-[#67b9e7]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Active ({activeTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-2 sm:px-4 font-semibold text-sm sm:text-base border-b-2 transition-colors ${activeTab === 'completed' ? 'border-[#67b9e7] text-[#67b9e7]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Completed ({completedTasks.length})
            </button>
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
                          
                          {!task.completed && tag && (
                              <>
                                <span>•</span>
                                <div className="inline-flex items-center gap-1 rounded px-1.5 py-0.5" style={{ backgroundColor: tag.color + '20' }}>
                                  <button 
                                    className="w-2.5 h-2.5 rounded-full cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
                                    style={{ backgroundColor: tag.color }}
                                    onClick={(e) => setEditingTagColor({ tag: tag, anchorEl: e.currentTarget })}
                                    title="Change tag color"
                                  ></button>
                                  <button 
                                    className="text-xs font-medium leading-none"
                                    style={{ color: tag.color }}
                                    onClick={(e) => setEditingTaskTag({ taskId: task.id, anchorEl: e.currentTarget })}
                                    title="Change task tag"
                                  >
                                    {tag.name}
                                  </button>
                                </div>
                              </>
                          )} 
                          {(task.completed && tag) && (
                            <>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }}></span>
                                  {tag.name}
                                </span>
                             </>
                          )}
                          {!task.completed && !tag && (
                              <>
                                <span>•</span>
                                <button 
                                    onClick={(e) => setEditingTaskTag({ taskId: task.id, anchorEl: e.currentTarget })}
                                    className="text-xs text-gray-400 hover:text-blue-600"
                                    title="Add tag"
                                >
                                    + Add Tag
                                </button>
                            </>
                          )}

                          <span>•</span>
                          <span>🕒 {format(task.createdAt instanceof Timestamp ? task.createdAt.toDate() : task.createdAt, 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
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
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full text-red-500 hover:bg-red-100 flex items-center justify-center mx-auto transition-colors font-bold text-base sm:text-lg ml-1 sm:ml-2"
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

        {editingTaskTag && (
            <TagSelector
                userId={userId}
                availableTags={activeTags}
                selectedTagId={tasks.find(t => t.id === editingTaskTag.taskId)?.tagId || null}
                onTagSelect={(newTagId) => {
                    handleTaskTagUpdate(editingTaskTag.taskId, newTagId);
                    setEditingTaskTag(null);
                }}
                onTagCreate={async (name) => {
                    const newTag = await handleTagCreate(name);
                    if (newTag) {
                        handleTaskTagUpdate(editingTaskTag.taskId, newTag.id);
                    }
                    setEditingTaskTag(null);
                    return newTag;
                }}
                onColorChangeRequest={() => { /* TODO */ }}
                anchorEl={editingTaskTag.anchorEl}
                onClose={() => setEditingTaskTag(null)}
            />
        )}
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