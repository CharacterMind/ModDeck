export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  summary: string;
  sections: {
    label: 'ADDED' | 'FIXED' | 'CHANGED' | 'REMOVED';
    items: string[];
  }[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: 'V330',
    date: 'Oct 2026',
    title: 'Daily Limit Banner',
    summary: 'Time tracking is now front and centre — big WeMod-style bar at the top shows your remaining free time at a glance.',
    sections: [
      {
        label: 'ADDED',
        items: [
          'Daily Limit Banner at the top of every view — shows a progress bar, time remaining in large text, and a one-click Upgrade button',
          'Click the banner to expand a detailed panel with full used/remaining breakdown and the Coven upgrade card',
          'Banner turns red when you\'re at or near the 5-hour daily limit',
          'Banner disappears entirely for Coven (Pro) members',
        ],
      },
      {
        label: 'CHANGED',
        items: [
          'Daily free time limit set to 5 hours',
          'Removed the small ⏳ widget from the status bar — the top banner replaces it',
        ],
      },
    ],
  },
  {
    version: 'V329',
    date: 'Oct 2026',
    title: 'Candy Points & Steam Art Fixes',
    summary: 'Deck Points renamed to Candy Points across the whole app, plus three games were showing the wrong Steam cover art.',
    sections: [
      {
        label: 'CHANGED',
        items: [
          '"Deck Points" and "DP" renamed to "Candy Points" and "CP" everywhere — Settings, Home, Trainer, Pro, and Welcome screens',
          'Earning rate labels updated to CP/hour throughout',
        ],
      },
      {
        label: 'FIXED',
        items: [
          'Supermarket Together was showing Streets of Rogue 2 cover art — correct Steam ID applied',
          'Mall Simulator cover art updated to correct Steam artwork',
          'Gym Simulator 24 cover art updated to correct Steam artwork',
        ],
      },
    ],
  },
  {
    version: 'V328',
    date: 'Oct 2026',
    title: 'Live Site Styling Fixed',
    summary: 'The Render deployment was stripping all Tailwind CSS in production — the Halloween theme and all styles now load correctly on the live site.',
    sections: [
      {
        label: 'FIXED',
        items: [
          'Tailwind CSS packages moved from devDependencies to dependencies — Render\'s production build was skipping them, leaving the site unstyled',
          'All Halloween theming, orange accents, and layout now appear correctly at moddeck-uxeq.onrender.com',
        ],
      },
    ],
  },
  {
    version: 'V327',
    date: 'Oct 2026',
    title: 'Halloween Theme & Companion',
    summary: 'Full Halloween visual overhaul and local Companion support — cast trainer spells from a local daemon running on your PC.',
    sections: [
      {
        label: 'ADDED',
        items: [
          'Halloween theme: pumpkin orange accents, dark backgrounds, 🎃 branding throughout',
          'ModDeck Companion — local HTTP daemon at 127.0.0.1:27301 bridges the app to your running games',
          'StatusBar shows live Companion connection status with animated pulse',
          'Welcome modal with onboarding flow and 50 Candy Points starter gift',
          'Trainer view with session timer, CP earning, and Pro upgrade prompts',
          'Library view with genre filter and search',
          'Settings view with profile, Candy Points balance, and danger zone',
          'Pro / Coven view with plan comparison',
        ],
      },
    ],
  },
];
