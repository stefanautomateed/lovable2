import JSZip from 'jszip';

export interface FileEntry {
  path: string;
  content: string;
}

export async function createZip(files: FileEntry[]): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    // Remove leading slash for zip paths
    const zipPath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
    zip.file(zipPath, file.content);
  }

  return await zip.generateAsync({ type: 'blob' });
}

export async function extractZip(blob: Blob): Promise<FileEntry[]> {
  const zip = await JSZip.loadAsync(blob);
  const files: FileEntry[] = [];

  for (const [path, zipEntry] of Object.entries(zip.files)) {
    if (!zipEntry.dir) {
      const content = await zipEntry.async('string');
      // Ensure path starts with /
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      files.push({ path: normalizedPath, content });
    }
  }

  return files;
}
