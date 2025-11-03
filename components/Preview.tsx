'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PreviewProps {
  trigger: number; // Increment to rebuild
}

export function Preview({ trigger }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    buildPreview();
  }, [trigger]);

  const buildPreview = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all files from the API
      const response = await fetch('/api/fs/list');
      const { tree } = await response.json();

      // Get all file paths from tree
      const filePaths = extractFilePaths(tree);

      // Fetch content for all files
      const files = new Map<string, string>();
      await Promise.all(
        filePaths.map(async (path) => {
          try {
            const res = await fetch(`/api/fs/read?path=${encodeURIComponent(path)}`);
            const data = await res.json();
            if (data.content) {
              files.set(path, data.content);
            }
          } catch (err) {
            console.error(`Failed to load ${path}:`, err);
          }
        })
      );

      // Generate HTML preview
      const html = generateSimpleHTML(files);

      if (iframeRef.current) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        iframeRef.current.src = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview failed');
    } finally {
      setLoading(false);
    }
  };

  function extractFilePaths(node: any, paths: string[] = []): string[] {
    if (node.type === 'file') {
      paths.push(node.path);
    } else if (node.children) {
      for (const child of node.children) {
        extractFilePaths(child, paths);
      }
    }
    return paths;
  }

  return (
    <div className="relative h-full w-full bg-white">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background p-4 z-10">
          <div className="text-destructive text-center">
            <p className="font-semibold mb-2">Preview Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        className="preview-iframe"
        sandbox="allow-scripts"
        title="Preview"
      />
    </div>
  );
}

function generateSimpleHTML(files: Map<string, string>): string {
  // Extract components content
  const components: Record<string, string> = {};
  for (const [path, content] of files.entries()) {
    if (path.startsWith('/components/sections/')) {
      const componentName = path.split('/').pop()?.replace('.tsx', '') || '';
      components[componentName] = extractComponentHTML(content);
    }
  }

  // Extract page content
  const pagePath = '/app/page.tsx';
  const pageContent = files.get(pagePath) || '';

  // Try to extract JSX from page.tsx
  let mainContent = extractComponentHTML(pageContent);

  // If we have section components, render them
  if (Object.keys(components).length > 0) {
    mainContent = Object.values(components).join('\n');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body>
  ${mainContent || `
    <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div class="text-center px-4">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Preview</h1>
        <p class="text-gray-600">
          Build your website to see the preview here.
        </p>
      </div>
    </div>
  `}
  <script>
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  </script>
</body>
</html>`;
}

function extractComponentHTML(tsxContent: string): string {
  // Remove imports and exports
  let content = tsxContent
    .replace(/^import .*$/gm, '')
    .replace(/^export (default )?/gm, '');

  // Try to extract JSX from return statement
  const returnMatch = content.match(/return\s*\(([\s\S]*?)\);?\s*[}]/);
  if (returnMatch) {
    let jsx = returnMatch[1].trim();

    // Convert JSX to HTML
    jsx = jsx
      .replace(/className=/g, 'class=')
      .replace(/\{`([^`]*)`\}/g, '$1')
      .replace(/\{(['"])(.*?)\1\}/g, '$2')
      .replace(/<([A-Z]\w+)([^>]*)>/g, '<div$2>') // Replace React components with divs
      .replace(/<\/[A-Z]\w+>/g, '</div>')
      // Handle icon components from lucide-react
      .replace(/<(\w+)\s+className="([^"]*)"[^>]*\/>/g, '<i data-lucide="$1" class="$2"></i>')
      .replace(/<(\w+)\s+className="([^"]*)"[^>]*><\/\w+>/g, '<i data-lucide="$1" class="$2"></i>');

    return jsx;
  }

  // Fallback: try to find any JSX-like content
  const jsxMatch = content.match(/<[^>]+>[\s\S]*<\/[^>]+>/);
  if (jsxMatch) {
    return jsxMatch[0]
      .replace(/className=/g, 'class=')
      .replace(/\{`([^`]*)`\}/g, '$1');
  }

  return '';
}
