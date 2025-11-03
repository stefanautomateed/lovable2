/**
 * Agent policies and prompts for website generation
 */

export const SYSTEM_RULES = `You are an expert web developer building modern websites with Next.js, TypeScript, and Tailwind CSS.

CORE PRINCIPLES:
- Work incrementally and verify each step
- Use surgical edits - never overwrite whole files unless necessary
- Search → Read → Edit workflow for changes
- Keep diffs minimal and log what changed
- Prioritize correctness and accessibility

DEFAULT STACK:
- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide icons
- Framer Motion for animations

WEBSITE STRUCTURE:
- Hero section (compelling headline, CTA)
- Features section (3-6 key features)
- Use Cases section (real-world applications)
- Testimonials section (social proof)
- FAQ section (common questions)
- Footer (links, copyright)

REQUIREMENTS:
- Fully responsive (mobile-first)
- Accessible (ARIA labels, semantic HTML)
- Fast loading (optimized images, code splitting)
- SEO-friendly (metadata, semantic structure)
- Modern design (2xl border radius, soft shadows, good contrast)
- Subtle animations (Framer Motion)`;

export function deriveSpecPrompt(userText: string, existingFiles: string[]): string {
  return `Based on the user's request, derive a detailed specification for the website.

USER REQUEST:
${userText}

EXISTING FILES:
${existingFiles.length > 0 ? existingFiles.join('\n') : 'None (new project)'}

Generate a JSON response with:
{
  "goal": "Primary purpose of the website",
  "audience": "Target audience",
  "style": "Visual style and tone",
  "sections": ["List of required sections"],
  "features": ["Key features to implement"],
  "colorScheme": "Suggested color scheme"
}`;
}

export function sitePlanPrompt(spec: any): string {
  return `Create a detailed implementation plan for this website.

SPECIFICATION:
${JSON.stringify(spec, null, 2)}

Generate a JSON response with:
{
  "routes": [
    {"path": "/", "purpose": "Main landing page"}
  ],
  "components": [
    {"path": "/components/sections/Hero.tsx", "purpose": "Hero section with CTA"},
    {"path": "/components/sections/Features.tsx", "purpose": "Features grid"},
    {"path": "/components/sections/UseCases.tsx", "purpose": "Use cases showcase"},
    {"path": "/components/sections/Testimonials.tsx", "purpose": "Customer testimonials"},
    {"path": "/components/sections/FAQ.tsx", "purpose": "FAQ accordion"},
    {"path": "/components/sections/Footer.tsx", "purpose": "Site footer"}
  ],
  "steps": [
    "1. Set up Next.js layout with metadata and fonts",
    "2. Create global styles with Tailwind configuration",
    "3. Implement Hero section",
    "4. Implement Features section",
    "5. Implement UseCases section",
    "6. Implement Testimonials section",
    "7. Implement FAQ section",
    "8. Implement Footer",
    "9. Wire everything together in page.tsx",
    "10. Verify and preview"
  ]
}`;
}

export function implementPrompt(step: string, context: {
  spec: any;
  existingFiles: string[];
  currentStep: number;
  totalSteps: number;
}): string {
  return `Implement step ${context.currentStep} of ${context.totalSteps}:

STEP: ${step}

SPECIFICATION:
${JSON.stringify(context.spec, null, 2)}

EXISTING FILES:
${context.existingFiles.join('\n')}

Generate a JSON response with file operations:
{
  "operations": [
    {
      "type": "write",
      "path": "/path/to/file.tsx",
      "content": "full file content here"
    },
    {
      "type": "edit",
      "path": "/path/to/existing.tsx",
      "changes": [
        {"old": "exact string to find", "new": "replacement string"}
      ]
    }
  ],
  "summary": "Brief description of what was implemented"
}

IMPORTANT:
- Use exact, unique strings for 'old' in edits
- Include enough context to make replacements unambiguous
- Follow the default stack (Next.js, TypeScript, Tailwind)
- Make components accessible and responsive
- Use Lucide icons and Framer Motion for subtle animations
- Follow modern design principles (2xl radii, soft shadows)`;
}

export function refinePrompt(
  userChange: string,
  relevantFiles: Array<{ path: string; content: string }>,
  grepResults: Array<{ path: string; excerpt: string }>
): string {
  return `The user wants to make a change to the website.

USER REQUEST:
${userChange}

RELEVANT FILES:
${relevantFiles.map(f => `${f.path}:\n${f.content.slice(0, 1000)}...`).join('\n\n')}

GREP RESULTS:
${grepResults.map(r => `${r.path}: ${r.excerpt}`).join('\n')}

Generate a JSON response with surgical edits:
{
  "operations": [
    {
      "type": "edit",
      "path": "/path/to/file.tsx",
      "changes": [
        {"old": "exact string to find", "new": "replacement string"}
      ]
    }
  ],
  "summary": "Brief description of changes made"
}

CRITICAL:
- Use minimal, surgical edits only
- Find the exact unique string to replace
- Include enough context to avoid ambiguity
- Don't change unrelated code`;
}

export function verifyPrompt(issues: any[]): string {
  return `Review these verification issues and suggest fixes.

ISSUES:
${JSON.stringify(issues, null, 2)}

Generate a JSON response with:
{
  "fixes": [
    {
      "path": "/path/to/file.tsx",
      "issue": "description",
      "changes": [
        {"old": "problematic code", "new": "fixed code"}
      ]
    }
  ],
  "summary": "Overview of fixes"
}`;
}
