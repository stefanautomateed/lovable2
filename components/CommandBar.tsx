'use client';

import { useState } from 'react';
import { Play, Sparkles, CheckCircle, Eye, Wand2, Download, Upload } from 'lucide-react';

interface CommandBarProps {
  onPlan: (prompt: string) => void;
  onBuild: () => void;
  onVerify: () => void;
  onPreview: () => void;
  onRefine: (change: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  disabled?: boolean;
  currentState?: string;
}

export function CommandBar({
  onPlan,
  onBuild,
  onVerify,
  onPreview,
  onRefine,
  onExport,
  onImport,
  disabled = false,
  currentState = 'idle',
}: CommandBarProps) {
  const [prompt, setPrompt] = useState('');
  const [refineInput, setRefineInput] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [showRefineInput, setShowRefineInput] = useState(false);

  const handlePlan = () => {
    if (prompt.trim()) {
      onPlan(prompt);
      setPrompt('');
      setShowPromptInput(false);
    }
  };

  const handleRefine = () => {
    if (refineInput.trim()) {
      onRefine(refineInput);
      setRefineInput('');
      setShowRefineInput(false);
    }
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onImport(file);
    };
    input.click();
  };

  return (
    <div className="border-b border-border bg-background px-4 py-3">
      <div className="flex items-center gap-2 flex-wrap">
        {!showPromptInput && !showRefineInput && (
          <>
            <button
              onClick={() => setShowPromptInput(true)}
              disabled={disabled}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              New Plan
            </button>

            <button
              onClick={onBuild}
              disabled={disabled || currentState === 'idle'}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              <Play className="h-4 w-4" />
              Build
            </button>

            <button
              onClick={onVerify}
              disabled={disabled}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Verify
            </button>

            <button
              onClick={onPreview}
              disabled={disabled}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>

            <button
              onClick={() => setShowRefineInput(true)}
              disabled={disabled}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              <Wand2 className="h-4 w-4" />
              Refine
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleImportClick}
                disabled={disabled}
                className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
              >
                <Upload className="h-4 w-4" />
                Import
              </button>

              <button
                onClick={onExport}
                disabled={disabled}
                className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </>
        )}

        {showPromptInput && (
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePlan()}
              placeholder="Describe the website you want to build..."
              className="flex-1 px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              autoFocus
            />
            <button
              onClick={handlePlan}
              disabled={!prompt.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
            >
              Create Plan
            </button>
            <button
              onClick={() => {
                setShowPromptInput(false);
                setPrompt('');
              }}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {showRefineInput && (
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              value={refineInput}
              onChange={(e) => setRefineInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
              placeholder="What would you like to change?"
              className="flex-1 px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              autoFocus
            />
            <button
              onClick={handleRefine}
              disabled={!refineInput.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
            >
              Apply
            </button>
            <button
              onClick={() => {
                setShowRefineInput(false);
                setRefineInput('');
              }}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 text-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
