'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskCreate } from '@/types/task';
import { TaskService } from '@/services/taskService';
import { FOCUS_ACTIONS } from '@/data/actions';
import { format } from 'date-fns';

interface TaskModalProps {
  userId: string;
  onClose: () => void;
  onTaskComplete?: (task: Task) => void;
}

export default function TaskModal({ userId, onClose, onTaskComplete }: TaskModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [newTask, setNewTask] = useState<TaskCreate>({
    title: '',
    description: '',
    actionType: 'invest',
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
      const task = await TaskService.createTask(userId, {
        ...newTask,
        description: '', // We're not using description anymore
      });
      console.log('Created task:', task);
      setTasks([task, ...tasks]);
      setNewTask({
        title: '',
        description: '',
        actionType: 'invest',
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      await TaskService.completeTask(task.id, task);
      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: true, actionCompleted: true } : t));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-60" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl [font-family:var(--font-mplus-rounded)]" style={{ boxShadow: '0 4px 0 rgba(229,229,229,255)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl">📋</span>
            Tasks
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleCreateTask} className="mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter your task here..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-lg"
                required
              />
              <select
                value={newTask.actionType}
                onChange={(e) => setNewTask({ ...newTask, actionType: e.target.value as any })}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white text-lg"
                style={{ width: '240px' }}
              >
                {FOCUS_ACTIONS.map(action => (
                  <option key={action.id} value={action.id}>
                    {action.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-[#67b9e7] text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-200 text-lg w-full flex items-center justify-center gap-2 cursor-pointer hover:transform hover:-translate-y-0.5 active:translate-y-0"
              style={{ boxShadow: '0 4px 0 #4792ba' }}
            >
              <span className="text-2xl text-white">➕</span>
              Add Task
            </button>
          </div>
        </form>

        <div className="border-t border-gray-200">
          <div className="flex gap-4 -mb-px">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 font-semibold text-lg border-b-2 transition-colors ${
                activeTab === 'active'
                  ? 'border-[#67b9e7] text-[#67b9e7]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Active Tasks ({activeTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 font-semibold text-lg border-b-2 transition-colors ${
                activeTab === 'completed'
                  ? 'border-[#67b9e7] text-[#67b9e7]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Completed Tasks ({completedTasks.length})
            </button>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 pt-6">
            {isLoading ? (
              <div className="text-center py-4 text-gray-800">Loading tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-4 text-gray-800">
                {activeTab === 'active' ? 'No active tasks' : 'No completed tasks'}
              </div>
            ) : (
              filteredTasks.map(task => {
                console.log('Rendering task:', task);
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border ${
                      task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                    }`}
                    style={{ boxShadow: '0 2px 0 rgba(229,229,229,255)' }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                          {task.title}
                        </h3>
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-800">
                          {(() => {
                            const actionIcon = (() => {
                              switch (task.actionType) {
                                case 'invest': return '💰';
                                case 'develop': return '🏭';
                                case 'improve_army': return '⚔️';
                                case 'population_growth': return '👥';
                                default: return '🎯';
                              }
                            })();
                            return (
                              <span className="flex items-center gap-1">
                                <span className="text-base">{actionIcon}</span>
                                <span>{FOCUS_ACTIONS.find(a => a.id === task.actionType)?.name}</span>
                              </span>
                            );
                          })()}
                          <span>•</span>
                          <span>🕒 {format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!task.completed && (
                          <button
                            onClick={() => handleCompleteTask(task)}
                            className="px-3 py-2 rounded-lg text-white hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 text-base [font-family:var(--font-mplus-rounded)]"
                            style={{ 
                              backgroundColor: '#6ec53e',
                              boxShadow: '0 3px 0 rgba(89,167,0,255)',
                              transform: 'translateY(-1px)'
                            }}
                          >
                            <span className="text-lg">✓</span>
                            <span>Complete</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="w-10 h-10 rounded-lg text-white hover:opacity-90 transition-all duration-200 flex items-center justify-center text-xl ml-2 [font-family:var(--font-mplus-rounded)] font-bold"
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