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
  steamAppId?: number;
  platform: 'steam' | 'epic' | 'gog' | 'xbox';
  processes: string[];
  coverUrl: string;
  heroUrl?: string;
  accentColor: string;
  genre: string;
  rating: number;
  players: string;
  cheats: Cheat[];
}

export const GAMES: Game[] = [
  {
    id: 'supermarket-together',
    name: 'Supermarket Together',
    steamAppId: 2709570,
    platform: 'steam',
    processes: ['SupermarketTogether.exe'],
    coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2709570/library_600x900.jpg',
    heroUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2709570/header.jpg',
    accentColor: '#f59e0b',
    genre: 'Simulation',
    rating: 4.8,
    players: '112K',
    cheats: [
      { id: 'unlimited-funds', label: 'Unlimited Funds', description: 'Wallet refills faster than you can spend', category: 'FUNDS', hotkey: 'F1', type: 'toggle' },
      { id: 'set-funds', label: 'Set Funds', description: 'Type any amount you want — decimals OK', category: 'FUNDS', type: 'value', defaultValue: 1000000 },
      { id: 'add-10k', label: 'Add $10,000', description: 'Instant cash injection', category: 'FUNDS', hotkey: 'F2', type: 'button' },
      { id: 'set-franchise', label: 'Set Franchise Level', description: 'Jump your franchise to any level', category: 'FRANCHISE', type: 'value', defaultValue: 12 },
      { id: 'unlimited-shelf', label: 'Unlimited Shelf Items', description: 'Shelves never go empty', category: 'STORE OPS', hotkey: 'F4', type: 'toggle' },
      { id: 'god-mode', label: 'God Mode', description: 'You cannot be fired or lose the store', category: 'MISC', hotkey: 'F5', type: 'toggle' },
    ],
  },
];
