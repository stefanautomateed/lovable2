'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PreviewProps {
  files: Map<string, string>;
  trigger: number; // Increment to rebuild
}

export function Preview({ files, trigger }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (files.size === 0) return;

    buildPreview();
  }, [trigger]);

  const buildPreview = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simple HTML preview for now
      // In production, this would use esbuild-wasm to bundle
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
  // Extract page content
  const pagePath = '/app/page.tsx';
  const pageContent = files.get(pagePath) || '';

  // Very simple preview - just show the structure
  // In production, this would use esbuild to bundle properly
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    }
  </style>
</head>
<body>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <div class="container mx-auto px-4 py-16">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Preview Loading...</h1>
        <p class="text-gray-600">
          This is a simplified preview. The full preview with React bundling will be available soon.
        </p>
        <div class="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <p class="text-sm text-gray-500 mb-2">Files detected:</p>
          <ul class="text-left space-y-1">
            ${Array.from(files.keys()).slice(0, 10).map(p =>
              `<li class="text-sm font-mono text-gray-700">${p}</li>`
            ).join('')}
          </ul>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
