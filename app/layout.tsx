import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ModDeck — Game Trainers & Mods for PC',
  description: 'The free, open alternative to WeMod. Real game trainers powered by a local companion. Mod your favorite PC games for free.',
  keywords: 'game trainer, game mods, WeMod alternative, PC game cheats, ModDeck',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen overflow-hidden bg-[#0a0a0a]">
        {children}
      </body>
    </html>
  );
}
