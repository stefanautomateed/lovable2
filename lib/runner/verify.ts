import { logger } from '@/lib/util/logger';

export interface VerifyResult {
  path: string;
  issues: VerifyIssue[];
}

export interface VerifyIssue {
  severity: 'error' | 'warning';
  message: string;
  line?: number;
}

/**
 * Basic syntax verification for TypeScript/JavaScript files
 * Since we can't run TypeScript compiler in Node.js runtime easily,
 * we do basic sanity checks
 */
export function verifyFile(path: string, content: string): VerifyResult {
  const issues: VerifyIssue[] = [];

  // Only verify TS/JS files
  if (!path.match(/\.(ts|tsx|js|jsx)$/)) {
    return { path, issues };
  }

  // Basic syntax checks
  const lines = content.split('\n');

  // Check for unclosed braces
  let braceCount = 0;
  let parenCount = 0;
  let bracketCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Skip comments and strings (basic)
    const cleanLine = line
      .replace(/\/\/.*$/, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/"(?:[^"\\]|\\.)*"/g, '')
      .replace(/'(?:[^'\\]|\\.)*'/g, '')
      .replace(/`(?:[^`\\]|\\.)*`/g, '');

    // Count braces, parentheses, brackets
    for (const char of cleanLine) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      if (char === '[') bracketCount++;
      if (char === ']') bracketCount--;
    }

    // Check for common issues
    if (line.trim().endsWith(',}') || line.trim().endsWith(',]')) {
      issues.push({
        severity: 'warning',
        message: 'Trailing comma before closing bracket',
        line: lineNum,
      });
    }
  }

  // Check final counts
  if (braceCount !== 0) {
    issues.push({
      severity: 'error',
      message: `Unbalanced braces (${braceCount > 0 ? 'unclosed' : 'extra closing'})`,
    });
  }

  if (parenCount !== 0) {
    issues.push({
      severity: 'error',
      message: `Unbalanced parentheses (${parenCount > 0 ? 'unclosed' : 'extra closing'})`,
    });
  }

  if (bracketCount !== 0) {
    issues.push({
      severity: 'error',
      message: `Unbalanced brackets (${bracketCount > 0 ? 'unclosed' : 'extra closing'})`,
    });
  }

  // Check for common React/Next.js issues
  if (path.match(/\.(tsx|jsx)$/)) {
    if (content.includes('export default') && !content.includes('import React')) {
      // React 17+ doesn't require React import, so this is just a warning
      if (content.includes('useState') || content.includes('useEffect')) {
        issues.push({
          severity: 'warning',
          message: 'Using React hooks without importing React (may need import)',
        });
      }
    }
  }

  if (issues.length > 0) {
    logger.warn(`Verification issues in ${path}`, { issues });
  } else {
    logger.success(`Verification passed: ${path}`);
  }

  return { path, issues };
}

/**
 * Verify multiple files
 */
export function verifyFiles(files: Array<{ path: string; content: string }>): VerifyResult[] {
  return files.map(f => verifyFile(f.path, f.content));
}
