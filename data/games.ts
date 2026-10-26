export interface Cheat {
  id: string;
  label: string;
  description: string;
  category: string;
  hotkey?: string;
  type: 'toggle' | 'value' | 'button';
  defaultValue?: number;
  /** Shared memory pool key — cheats with the same pool share one calibration scan */
  pool?: string;
  /** Value to write when cheat is activated (for toggle/button types) */
  writeValue?: number;
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
    id: 'supermarket-together',
    name: 'Supermarket Together',
    steamAppId: 2709570,
    platform: 'steam',
    processes: ['Supermarket Together.exe'],
    coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1979840/library_600x900.jpg',
    heroUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1979840/header.jpg',
    accentColor: '#e8820c',
    genre: 'Co-op Sim',
    cheats: [
      { id: 'unlimited-money', label: 'Unlimited Money', description: 'Freeze balance so it never decreases', category: 'ECONOMY', hotkey: 'F1', type: 'toggle', pool: 'money', writeValue: 9999999 },
      { id: 'set-money', label: 'Set Money', description: 'Set your balance to any amount', category: 'ECONOMY', type: 'value', pool: 'money', defaultValue: 1000000 },
      { id: 'add-10k', label: 'Add $10,000', description: 'Instant $10k cash injection', category: 'ECONOMY', hotkey: 'F2', type: 'button', pool: 'money', writeValue: 10000 },
      { id: 'fast-restock', label: 'Fast Restock', description: 'Delivery trucks arrive instantly', category: 'STORE', hotkey: 'F3', type: 'toggle', pool: 'restock', writeValue: 0.01 },
      { id: 'no-customer-complaints', label: 'No Complaints', description: 'Customers are always satisfied', category: 'STORE', hotkey: 'F4', type: 'toggle', pool: 'complaints', writeValue: 0 },
    ],
  },
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
      { id: 'unlimited-money', label: 'Unlimited Money', description: 'Freeze balance so it never decreases', category: 'ECONOMY', hotkey: 'F1', type: 'toggle', pool: 'money', writeValue: 9999999 },
      { id: 'set-money', label: 'Set Money', description: 'Set your balance to any amount', category: 'ECONOMY', type: 'value', pool: 'money', defaultValue: 1000000 },
      { id: 'add-10k', label: 'Add $10,000', description: 'Instant $10k cash injection', category: 'ECONOMY', hotkey: 'F2', type: 'button', pool: 'money', writeValue: 10000 },
      { id: 'set-level', label: 'Set Store Level', description: 'Jump your store to any upgrade level', category: 'STORE', type: 'value', pool: 'level', defaultValue: 20 },
      { id: 'no-customer-complaints', label: 'No Customer Complaints', description: 'Customers are always satisfied', category: 'STORE', hotkey: 'F4', type: 'toggle', pool: 'complaints', writeValue: 0 },
      { id: 'fast-restock', label: 'Fast Restock', description: 'Delivery trucks arrive instantly', category: 'STORE', hotkey: 'F5', type: 'toggle', pool: 'restock', writeValue: 0.01 },
    ],
  },
];

// Map Steam app IDs to game IDs for fast lookup
export const STEAM_ID_MAP: Record<number, string> = Object.fromEntries(
  GAMES.map(g => [g.steamAppId, g.id])
);
