import { memoryFS } from './fsMemory';
import micromatch from 'micromatch';
import { logger } from '@/lib/util/logger';

export interface GrepResult {
  path: string;
  line: number;
  excerpt: string;
  match: string;
}

export interface EditChange {
  old: string;
  new: string;
}

/**
 * Read a file from memory FS
 */
export function read(path: string): string | null {
  const content = memoryFS.read(path);
  if (content === null) {
    logger.warn(`File not found: ${path}`);
  }
  return content;
}

/**
 * Write a file to memory FS
 */
export function write(path: string, content: string): void {
  memoryFS.write(path, content);
  logger.info(`File written: ${path}`, { size: content.length });
}

/**
 * Edit a file with surgical replacements
 */
export function edit(path: string, changes: EditChange[]): {
  success: boolean;
  error?: string;
  appliedChanges?: Array<{ old: string; new: string }>;
} {
  const content = memoryFS.read(path);
  if (content === null) {
    return { success: false, error: `File not found: ${path}` };
  }

  let updatedContent = content;
  const appliedChanges: Array<{ old: string; new: string }> = [];

  for (const change of changes) {
    const { old, new: newStr } = change;

    // Count occurrences
    const occurrences = (updatedContent.match(new RegExp(escapeRegex(old), 'g')) || []).length;

    if (occurrences === 0) {
      logger.warn(`Pattern not found in ${path}`, { pattern: old.slice(0, 100) });
      return {
        success: false,
        error: `Pattern not found: ${old.slice(0, 100)}...`,
      };
    }

    if (occurrences > 1) {
      logger.warn(`Ambiguous pattern in ${path} (${occurrences} matches)`, {
        pattern: old.slice(0, 100),
      });
      return {
        success: false,
        error: `Ambiguous pattern (${occurrences} matches): ${old.slice(0, 100)}...`,
      };
    }

    // Apply replacement
    updatedContent = updatedContent.replace(old, newStr);
    appliedChanges.push({ old, new: newStr });
  }

  memoryFS.write(path, updatedContent);
  logger.success(`File edited: ${path}`, { changes: appliedChanges.length });

  return { success: true, appliedChanges };
}

/**
 * Glob pattern matching
 */
export function glob(pattern: string): string[] {
  const allFiles = memoryFS.listFiles();

  // micromatch expects patterns without leading slash
  const normalizedPattern = pattern.startsWith('/') ? pattern.slice(1) : pattern;
  const normalizedFiles = allFiles.map(f => f.startsWith('/') ? f.slice(1) : f);

  const matches = micromatch(normalizedFiles, normalizedPattern);

  // Add leading slash back
  return matches.map(f => '/' + f).sort();
}

/**
 * Grep - search file contents
 */
export function grep(
  pattern: string,
  options: { caseSensitive?: boolean } = {}
): GrepResult[] {
  const { caseSensitive = true } = options;
  const results: GrepResult[] = [];
  const allFiles = memoryFS.listFiles();

  const regex = new RegExp(
    escapeRegex(pattern),
    caseSensitive ? 'g' : 'gi'
  );

  for (const filePath of allFiles) {
    const content = memoryFS.read(filePath);
    if (!content) continue;

    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (regex.test(line)) {
        results.push({
          path: filePath,
          line: i + 1,
          excerpt: line.trim(),
          match: pattern,
        });
      }
      // Reset regex
      regex.lastIndex = 0;
    }
  }

  return results;
}

/**
 * Delete a file
 */
export function deleteFile(path: string): boolean {
  const deleted = memoryFS.delete(path);
  if (deleted) {
    logger.info(`File deleted: ${path}`);
  } else {
    logger.warn(`File not found for deletion: ${path}`);
  }
  return deleted;
}

/**
 * List all files
 */
export function listFiles(): string[] {
  return memoryFS.listFiles();
}

/**
 * Check if file exists
 */
export function exists(path: string): boolean {
  return memoryFS.exists(path);
}

/**
 * Get file tree
 */
export function getTree() {
  return memoryFS.getTree();
}

/**
 * Clear all files
 */
export function clear(): void {
  memoryFS.clear();
  logger.info('Memory FS cleared');
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
