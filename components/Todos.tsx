'use client';

import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface TodoItem {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface TodosProps {
  todos: TodoItem[];
}

export function Todos({ todos }: TodosProps) {
  const getStatusIcon = (status: TodoItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TodoItem['status']) => {
    switch (status) {
      case 'completed':
        return 'text-gray-500 line-through';
      case 'in_progress':
        return 'text-blue-600 font-medium';
      default:
        return 'text-gray-700';
    }
  };

  const completedCount = todos.filter(t => t.status === 'completed').length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold mb-2">Implementation Plan</h3>
        {todos.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{completedCount} of {todos.length} completed</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {todos.length === 0 ? (
          <div className="text-muted-foreground text-center py-8 text-sm">
            No plan yet. Start by describing what you want to build.
          </div>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo, index) => (
              <li key={todo.id} className="flex items-start gap-3 p-2 rounded hover:bg-accent/50 transition-colors">
                <div className="mt-0.5">{getStatusIcon(todo.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${getStatusColor(todo.status)}`}>
                    {index + 1}. {todo.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
