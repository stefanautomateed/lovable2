import { FileNode } from '@/lib/util/z';

/**
 * In-memory filesystem using POSIX-style paths
 */
class MemoryFileSystem {
  private files: Map<string, string> = new Map();

  /**
   * Normalize path to POSIX format
   */
  private normalizePath(path: string): string {
    // Ensure path starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    // Remove trailing slash unless it's root
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    // Normalize multiple slashes
    path = path.replace(/\/+/g, '/');
    return path;
  }

  /**
   * Get parent directory path
   */
  private getParentPath(path: string): string | null {
    const normalized = this.normalizePath(path);
    if (normalized === '/') return null;
    const lastSlash = normalized.lastIndexOf('/');
    return lastSlash === 0 ? '/' : normalized.slice(0, lastSlash);
  }

  /**
   * Ensure all parent directories exist
   */
  private ensureParentDirs(path: string): void {
    const parent = this.getParentPath(path);
    if (!parent) return;

    // We don't store directories explicitly, just files
    // So this is a no-op, but kept for future enhancements
  }

  /**
   * Read a file
   */
  read(path: string): string | null {
    const normalized = this.normalizePath(path);
    return this.files.get(normalized) || null;
  }

  /**
   * Write a file
   */
  write(path: string, content: string): void {
    const normalized = this.normalizePath(path);
    this.ensureParentDirs(normalized);
    this.files.set(normalized, content);
  }

  /**
   * Delete a file
   */
  delete(path: string): boolean {
    const normalized = this.normalizePath(path);
    return this.files.delete(normalized);
  }

  /**
   * Check if file exists
   */
  exists(path: string): boolean {
    const normalized = this.normalizePath(path);
    return this.files.has(normalized);
  }

  /**
   * List all files
   */
  listFiles(): string[] {
    return Array.from(this.files.keys()).sort();
  }

  /**
   * Get file tree structure
   */
  getTree(): FileNode {
    const root: FileNode = {
      name: '/',
      path: '/',
      type: 'directory',
      children: [],
    };

    const pathMap = new Map<string, FileNode>();
    pathMap.set('/', root);

    // Sort paths for consistent ordering
    const sortedPaths = Array.from(this.files.keys()).sort();

    for (const filePath of sortedPaths) {
      const parts = filePath.split('/').filter(Boolean);
      let currentPath = '';

      // Create/get directory nodes
      for (let i = 0; i < parts.length - 1; i++) {
        currentPath += '/' + parts[i];

        if (!pathMap.has(currentPath)) {
          const dirNode: FileNode = {
            name: parts[i],
            path: currentPath,
            type: 'directory',
            children: [],
          };
          pathMap.set(currentPath, dirNode);

          // Add to parent
          const parentPath = this.getParentPath(currentPath) || '/';
          const parent = pathMap.get(parentPath);
          if (parent && parent.children) {
            parent.children.push(dirNode);
          }
        }
      }

      // Add file node
      const fileName = parts[parts.length - 1];
      const fileNode: FileNode = {
        name: fileName,
        path: filePath,
        type: 'file',
      };

      const parentPath = this.getParentPath(filePath) || '/';
      const parent = pathMap.get(parentPath);
      if (parent && parent.children) {
        parent.children.push(fileNode);
      }
    }

    return root;
  }

  /**
   * Clear all files
   */
  clear(): void {
    this.files.clear();
  }

  /**
   * Get all files as entries
   */
  getAllEntries(): Array<{ path: string; content: string }> {
    return Array.from(this.files.entries()).map(([path, content]) => ({
      path,
      content,
    }));
  }

  /**
   * Load files from entries
   */
  loadEntries(entries: Array<{ path: string; content: string }>): void {
    this.clear();
    for (const entry of entries) {
      this.write(entry.path, entry.content);
    }
  }
}

// Global singleton instance
export const memoryFS = new MemoryFileSystem();
