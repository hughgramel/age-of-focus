import React from 'react';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface NationalPathModalProps {
  onClose: () => void;
}

interface PathMilestone {
  id: number;
  title: string;
  description: string;
  icon: string;
  locked: boolean;
  current: boolean;
  completed: boolean;
}

const NATIONAL_MILESTONES: PathMilestone[] = [
  {
    id: 1,
    title: 'Industrial Foundation',
    description: 'Establish your first factories',
    icon: '🏭',
    locked: false,
    current: true,
    completed: false,
  },
  {
    id: 2,
    title: 'Military Might',
    description: 'Build your first army',
    icon: '⚔️',
    locked: true,
    current: false,
    completed: false,
  },
  {
    id: 3,
    title: 'Economic Power',
    description: 'Reach 1000 gold income',
    icon: '💰',
    locked: true,
    current: false,
    completed: false,
  },
  {
    id: 4,
    title: 'Great Power',
    description: 'Become a dominant nation',
    icon: '👑',
    locked: true,
    current: false,
    completed: false,
  },
];

const PathButton = ({ milestone }: { milestone: PathMilestone }) => {
  return (
    <div className="relative flex items-center justify-center w-full" style={{ marginTop: milestone.id === 1 ? 0 : 40 }}>
      {/* Left side content */}
      <div className={`flex-1 text-right pr-8 ${milestone.locked ? 'opacity-50' : ''}`}>
        <h3 className="font-bold text-lg text-gray-800">{milestone.title}</h3>
        <p className="text-sm text-gray-600">{milestone.description}</p>
      </div>

      {/* Center button */}
      <div className="relative flex-shrink-0">
        {milestone.current ? (
          <div className="relative h-[102px] w-[102px]">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 animate-bounce rounded-xl border-2 bg-white px-3 py-2.5 font-bold uppercase tracking-wide text-[#67b9e7] whitespace-nowrap">
              Current
              <div className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 transform border-x-8 border-t-8 border-x-transparent border-t-white" />
            </div>
            <CircularProgressbarWithChildren
              value={5}
              styles={{
                root: {
                  backgroundColor: 'white',
                  borderRadius: '50%',
                },
                path: {
                  stroke: '#4ade80',
                  strokeLinecap: 'round',
                  transition: 'stroke-dashoffset 0.5s ease 0s',
                },
                trail: {
                  stroke: '#e5e7eb',
                  strokeLinecap: 'round',
                },
                background: {
                  fill: '#ffffff'
                }
              }}
            >
              <div className="h-[70px] w-[70px] rounded-full bg-white flex items-center justify-center">
                <span className="text-4xl">{milestone.icon}</span>
              </div>
            </CircularProgressbarWithChildren>
          </div>
        ) : (
          <div className="h-[70px] w-[70px] rounded-full bg-white flex items-center justify-center border-4 border-[#e5e7eb]">
            <span className={`text-4xl ${
              milestone.locked 
                ? 'opacity-30'
                : milestone.completed
                  ? ''
                  : ''
            }`}>{milestone.icon}</span>
          </div>
        )}
      </div>

      {/* Right side - empty div for centering */}
      <div className="flex-1 pl-8" />
    </div>
  );
};

export default function NationalPathModal({ onClose }: NationalPathModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-60" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto [font-family:var(--font-mplus-rounded)]" style={{ boxShadow: '0 4px 0 rgba(229,229,229,255)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl">🌟</span>
            National Path
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-700 mb-8 text-center">
            Follow your nation's path to greatness through these milestones:
          </p>
          
          <div className="relative">
            {/* Vertical line connecting the buttons */}
            <div className="absolute left-1/2 top-[35px] bottom-[35px] w-0.5 bg-[#67b9e7]/30 -translate-x-1/2" />
            
            {/* Path buttons */}
            <div className="relative flex flex-col items-stretch">
              {NATIONAL_MILESTONES.map((milestone) => (
                <PathButton key={milestone.id} milestone={milestone} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 