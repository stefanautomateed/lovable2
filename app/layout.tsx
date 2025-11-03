import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Vibe Coding Platform - AI-Powered Website Builder',
  description: 'Build beautiful websites with AI assistance. Describe what you want, and watch it come to life.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
