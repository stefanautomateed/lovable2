'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

interface LogsProps {
  logs: LogEntry[];
}

export function Logs({ logs }: LogsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      case 'success':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  };

  const getLevelBg = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'bg-red-500/10';
      case 'warn':
        return 'bg-yellow-500/10';
      case 'success':
        return 'bg-green-500/10';
      default:
        return 'bg-blue-500/10';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-950">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800">
        <Terminal className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-200">Logs</h3>
      </div>
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No logs yet. Start building to see activity.
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`p-2 rounded ${getLevelBg(log.level)}`}
            >
              <span className="text-gray-500">{log.timestamp}</span>
              {' '}
              <span className={getLevelColor(log.level)}>[{log.level.toUpperCase()}]</span>
              {' '}
              <span className="text-gray-200">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
