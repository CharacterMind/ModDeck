export interface Cheat {
  id: string;
  label: string;
  description: string;
  category: string;
  hotkey?: string;
  type: 'toggle' | 'value' | 'button';
  defaultValue?: number;
}

export interface Game {
  id: string;
  name: string;
  steamAppId: number;
  platform: 'steam' | 'epic' | 'gog' | 'xbox';
  processes: string[];
  coverUrl: string;
  heroUrl?: string;
  accentColor: string;
  genre: string;
  cheats: Cheat[];
}

export const GAMES: Game[] = [
  {
    id: 'supermarket-simulator',
    name: 'Supermarket Simulator',
    steamAppId: 2670630,
    platform: 'steam',
    processes: ['Supermarket Simulator.exe'],
    coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2670630/library_600x900.jpg',
    heroUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2670630/header.jpg',
    accentColor: '#3d9bd4',
    genre: 'Simulation',
    cheats: [
      { id: 'unlimited-money', label: 'Unlimited Money', description: 'Money never decreases', category: 'ECONOMY', hotkey: 'F1', type: 'toggle' },
      { id: 'set-money', label: 'Set Money', description: 'Set your balance to any amount', category: 'ECONOMY', type: 'value', defaultValue: 1000000 },
      { id: 'add-10k', label: 'Add $10,000', description: 'Instant cash injection', category: 'ECONOMY', hotkey: 'F2', type: 'button' },
      { id: 'set-level', label: 'Set Store Level', description: 'Jump your store to any upgrade level', category: 'STORE', type: 'value', defaultValue: 20 },
      { id: 'no-customer-complaints', label: 'No Customer Complaints', description: 'Customers are always satisfied', category: 'STORE', hotkey: 'F4', type: 'toggle' },
      { id: 'fast-restock', label: 'Fast Restock', description: 'Delivery trucks arrive instantly', category: 'STORE', hotkey: 'F5', type: 'toggle' },
    ],
  },
];

// Map Steam app IDs to game IDs for fast lookup
export const STEAM_ID_MAP: Record<number, string> = Object.fromEntries(
  GAMES.map(g => [g.steamAppId, g.id])
);
