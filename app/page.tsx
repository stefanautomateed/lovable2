'use client';

import { useState, useEffect } from 'react';
import { Editor } from '@/components/Editor';
import { Preview } from '@/components/Preview';
import { Logs } from '@/components/Logs';
import { Todos } from '@/components/Todos';
import { CommandBar } from '@/components/CommandBar';
import { FileNode } from '@/lib/util/z';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

interface TodoItem {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export default function Home() {
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [activeTab, setActiveTab] = useState<'preview' | 'logs' | 'todos'>('preview');
  const [previewTrigger, setPreviewTrigger] = useState(0);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [currentSpec, setCurrentSpec] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize with scaffold on mount
  useEffect(() => {
    initializeProject();
  }, []);

  const addLog = (level: LogEntry['level'], message: string) => {
    setLogs(prev => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
      },
    ]);
  };

  const initializeProject = async () => {
    addLog('info', 'Initializing project...');

    // Create default scaffold
    await createDefaultScaffold();

    // Load file tree
    await loadFileTree();

    addLog('success', 'Project initialized');
  };

  const createDefaultScaffold = async () => {
    const defaultFiles = [
      {
        path: '/app/layout.tsx',
        content: `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Website',
  description: 'Built with Vibe Coding Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}`,
      },
      {
        path: '/app/page.tsx',
        content: `export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-gray-900">
          Welcome to Your Website
        </h1>
        <p className="text-center text-gray-600 mt-4">
          Describe what you want to build and watch it come to life!
        </p>
      </div>
    </main>
  );
}`,
      },
      {
        path: '/app/globals.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
      },
    ];

    for (const file of defaultFiles) {
      await fetch('/api/fs/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(file),
      });
    }
  };

  const loadFileTree = async () => {
    const res = await fetch('/api/fs/list');
    const data = await res.json();
    setFileTree(data.tree);
  };

  const loadFile = async (path: string) => {
    const res = await fetch(`/api/fs/read?path=${encodeURIComponent(path)}`);
    const data = await res.json();

    if (data.content !== undefined) {
      setSelectedFile(path);
      setFileContent(data.content);
    }
  };

  const saveFile = async (path: string, content: string) => {
    await fetch('/api/fs/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content }),
    });

    addLog('success', `Saved ${path}`);
  };

  const handlePlan = async (prompt: string) => {
    setIsProcessing(true);
    addLog('info', `Creating plan for: ${prompt}`);

    try {
      const res = await fetch('/api/agent/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.success) {
        setCurrentSpec(data.spec);
        setCurrentPlan(data.plan);
        setCurrentStep(0);

        // Set todos from plan
        const newTodos: TodoItem[] = data.plan.steps.map((step: string, index: number) => ({
          id: `step-${index}`,
          description: step,
          status: 'pending' as const,
        }));
        setTodos(newTodos);

        addLog('success', 'Plan created successfully');
        setActiveTab('todos');
      } else {
        addLog('error', `Plan creation failed: ${data.error}`);
      }
    } catch (error) {
      addLog('error', `Failed to create plan: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuild = async () => {
    if (!currentPlan || !currentSpec) {
      addLog('warn', 'No plan available. Create a plan first.');
      return;
    }

    if (currentStep >= currentPlan.steps.length) {
      addLog('info', 'All steps completed!');
      return;
    }

    setIsProcessing(true);
    addLog('info', `Building step ${currentStep + 1}/${currentPlan.steps.length}...`);

    // Update todo status
    setTodos(prev =>
      prev.map((t, i) => (i === currentStep ? { ...t, status: 'in_progress' as const } : t))
    );

    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'BUILD',
          payload: {
            spec: currentSpec,
            plan: currentPlan,
            currentStep,
            totalSteps: currentPlan.steps.length,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        addLog('success', data.summary);

        // Mark step as completed
        setTodos(prev =>
          prev.map((t, i) => (i === currentStep ? { ...t, status: 'completed' as const } : t))
        );

        setCurrentStep(prev => prev + 1);

        // Reload file tree
        await loadFileTree();

        // If we have a selected file, reload it
        if (selectedFile) {
          await loadFile(selectedFile);
        }
      } else {
        addLog('error', `Build failed: ${data.error}`);
        setTodos(prev =>
          prev.map((t, i) => (i === currentStep ? { ...t, status: 'pending' as const } : t))
        );
      }
    } catch (error) {
      addLog('error', `Build error: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify = async () => {
    setIsProcessing(true);
    addLog('info', 'Verifying files...');

    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'VERIFY' }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.hasIssues) {
          addLog('warn', `Found ${data.issueCount} issue(s)`);
        } else {
          addLog('success', 'Verification passed!');
        }
      }
    } catch (error) {
      addLog('error', `Verification error: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePreview = () => {
    addLog('info', 'Refreshing preview...');
    setPreviewTrigger(prev => prev + 1);
    setActiveTab('preview');
  };

  const handleRefine = async (change: string) => {
    setIsProcessing(true);
    addLog('info', `Refining: ${change}`);

    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'REFINE',
          payload: { userChange: change },
        }),
      });

      const data = await res.json();

      if (data.success) {
        addLog('success', data.summary);
        await loadFileTree();
        if (selectedFile) await loadFile(selectedFile);
      } else {
        addLog('error', `Refine failed: ${data.error}`);
      }
    } catch (error) {
      addLog('error', `Refine error: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    addLog('info', 'Exporting project...');
    window.location.href = '/api/fs/export';
  };

  const handleImport = async (file: File) => {
    setIsProcessing(true);
    addLog('info', 'Importing project...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/fs/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        addLog('success', `Imported ${data.filesImported} files`);
        await loadFileTree();
      } else {
        addLog('error', `Import failed: ${data.error}`);
      }
    } catch (error) {
      addLog('error', `Import error: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get files as Map for preview
  const getFilesMap = (): Map<string, string> => {
    const map = new Map<string, string>();
    if (selectedFile && fileContent) {
      map.set(selectedFile, fileContent);
    }
    // In production, we'd load all files here
    return map;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="px-6 py-3">
          <h1 className="text-xl font-bold text-foreground">
            Vibe Coding Platform
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-powered website builder
          </p>
        </div>
      </header>

      {/* Command Bar */}
      <CommandBar
        onPlan={handlePlan}
        onBuild={handleBuild}
        onVerify={handleVerify}
        onPreview={handlePreview}
        onRefine={handleRefine}
        onExport={handleExport}
        onImport={handleImport}
        disabled={isProcessing}
        currentState={currentPlan ? 'planning' : 'idle'}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - File Tree + Editor */}
        <div className="flex-1 flex border-r border-border">
          {/* File Tree */}
          <div className="w-64 border-r border-border bg-card overflow-y-auto">
            <div className="p-2">
              <h3 className="text-xs font-semibold text-muted-foreground px-2 py-1">
                FILES
              </h3>
              {fileTree && <FileTreeNode node={fileTree} onSelect={loadFile} />}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1">
            {selectedFile ? (
              <div className="h-full flex flex-col">
                <div className="border-b border-border bg-card px-4 py-2">
                  <span className="text-sm font-mono text-foreground">{selectedFile}</span>
                </div>
                <div className="flex-1">
                  <Editor
                    path={selectedFile}
                    value={fileContent}
                    onChange={(value) => {
                      setFileContent(value);
                      saveFile(selectedFile, value);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a file to edit
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview/Logs/Todos */}
        <div className="w-1/2 flex flex-col">
          {/* Tabs */}
          <div className="border-b border-border bg-card flex">
            {(['preview', 'logs', 'todos'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'preview' && (
              <Preview files={getFilesMap()} trigger={previewTrigger} />
            )}
            {activeTab === 'logs' && <Logs logs={logs} />}
            {activeTab === 'todos' && <Todos todos={todos} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// File tree node component
function FileTreeNode({
  node,
  onSelect,
  depth = 0,
}: {
  node: FileNode;
  onSelect: (path: string) => void;
  depth?: number;
}) {
  const [isOpen, setIsOpen] = useState(depth < 2);

  if (node.type === 'file') {
    return (
      <button
        onClick={() => onSelect(node.path)}
        className="w-full flex items-center gap-2 px-2 py-1 hover:bg-accent rounded text-sm text-left"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-2 py-1 hover:bg-accent rounded text-sm text-left"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="truncate">{node.name}</span>
      </button>
      {isOpen && node.children && (
        <div>
          {node.children.map((child: FileNode) => (
            <FileTreeNode
              key={child.path}
              node={child}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
