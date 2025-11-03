import { z } from 'zod';

// File operation schemas
export const ReadFileSchema = z.object({
  path: z.string().min(1),
});

export const WriteFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
});

export const EditFileSchema = z.object({
  path: z.string().min(1),
  changes: z.array(
    z.object({
      old: z.string(),
      new: z.string(),
    })
  ),
});

export const GlobSchema = z.object({
  pattern: z.string().min(1),
});

export const GrepSchema = z.object({
  pattern: z.string().min(1),
  caseSensitive: z.boolean().optional().default(true),
});

// Agent schemas
export const PlanRequestSchema = z.object({
  prompt: z.string().min(1),
});

export const RunRequestSchema = z.object({
  type: z.enum(['BUILD', 'VERIFY', 'PREVIEW', 'REFINE']),
  payload: z.any().optional(),
});

export const RefinePayloadSchema = z.object({
  userChange: z.string().min(1),
});

// File tree node
export const FileNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string(),
    path: z.string(),
    type: z.enum(['file', 'directory']),
    children: z.array(FileNodeSchema).optional(),
  })
);

export type ReadFileInput = z.infer<typeof ReadFileSchema>;
export type WriteFileInput = z.infer<typeof WriteFileSchema>;
export type EditFileInput = z.infer<typeof EditFileSchema>;
export type GlobInput = z.infer<typeof GlobSchema>;
export type GrepInput = z.infer<typeof GrepSchema>;
export type PlanRequest = z.infer<typeof PlanRequestSchema>;
export type RunRequest = z.infer<typeof RunRequestSchema>;
export type RefinePayload = z.infer<typeof RefinePayloadSchema>;
export type FileNode = z.infer<typeof FileNodeSchema>;
