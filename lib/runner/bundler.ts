/**
 * Client-side bundler using esbuild-wasm
 * This file provides utilities to bundle user projects in the browser
 */

export interface BundleResult {
  success: boolean;
  code?: string;
  css?: string;
  error?: string;
  blobUrl?: string;
}

/**
 * Bundle files for preview
 * This is a placeholder that will be implemented on the client side
 * The actual bundling happens in the Preview component using esbuild-wasm
 */
export async function bundleForPreview(
  files: Map<string, string>,
  entryPoint: string = '/app/page.tsx'
): Promise<BundleResult> {
  // This function is meant to be called from the client
  // The server-side version just returns a placeholder
  return {
    success: false,
    error: 'Bundling must be done on the client side',
  };
}

/**
 * Generate preview HTML that loads the bundled code
 */
export function generatePreviewHTML(bundledCode: string, bundledCss?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  ${bundledCss ? `<style>${bundledCss}</style>` : ''}
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    #root {
      width: 100%;
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    ${bundledCode}
  </script>
</body>
</html>`;
}
