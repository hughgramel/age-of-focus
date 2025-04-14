'use client';

import { useState, useEffect, useRef } from 'react';
import commands from '@/lib/commands';

interface TerminalOutput {
  type: 'command' | 'response';
  content: string;
}

export default function Terminal() {
  const [isVisible, setIsVisible] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalOutput[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '`') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const args = input.trim().split(' ');
    const commandName = args[0].toLowerCase();
    const command = commands.get(commandName);

    const newHistory: TerminalOutput[] = [
      ...history,
      { type: 'command', content: `> ${input}` }
    ];

    if (command) {
      try {
        command.execute(args.slice(1));
        if (commandName === 'clear') {
          setHistory([]);
        } else {
          setHistory([...newHistory, { type: 'response', content: 'Command executed successfully.' }]);
        }
      } catch (error) {
        setHistory([...newHistory, { type: 'response', content: `Error: ${error}` }]);
      }
    } else {
      setHistory([...newHistory, { type: 'response', content: `Command not found: ${commandName}` }]);
    }

    setInput('');
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 w-96 h-64 rounded-lg overflow-hidden z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div 
        ref={terminalRef}
        className="h-52 overflow-y-auto p-4 font-mono text-sm"
      >
        {history.map((entry, index) => (
          <div 
            key={index} 
            className={entry.type === 'command' ? 'text-green-400' : 'text-gray-300'}
          >
            {entry.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleCommand} className="border-t border-gray-700">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-transparent text-white px-4 py-2 font-mono text-sm focus:outline-none"
          placeholder="Type a command..."
          autoComplete="off"
        />
      </form>
    </div>
  );
} 