export interface Cheat {
  id: string;
  label: string;
  description: string;
  category: string;
  hotkey?: string;
  type: 'toggle' | 'value' | 'button';
  defaultValue?: number;
  proOnly?: boolean;
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
  cheats: Cheat[];
}

export const GAMES: Game[] = [
  {
    id: 'supermarket-together',
    name: 'Supermarket Together',
    steamAppId: 1134870,
    platform: 'steam',
    processes: ['SupermarketTogether.exe'],
    coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1134870/library_600x900.jpg',
    heroUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1134870/header.jpg',
    accentColor: '#f59e0b',
    cheats: [
      { id: 'unlimited-funds', label: 'Unlimited Funds', description: 'Wallet refills faster than you can spend', category: 'FUNDS', hotkey: 'F1', type: 'toggle' },
      { id: 'set-funds', label: 'Set Funds', description: 'Type any amount you want — decimals OK', category: 'FUNDS', type: 'value', defaultValue: 1000000 },
      { id: 'add-10k', label: 'Add $10,000', description: 'Instant cash injection', category: 'FUNDS', hotkey: 'F2', type: 'button' },
      { id: 'money-multiplier', label: 'Money Multiplier', description: 'Every checkout pays out extra', category: 'FUNDS', type: 'value', defaultValue: 2, proOnly: true },
      { id: 'set-franchise', label: 'Set Franchise Level', description: 'Jump your franchise to any level', category: 'FRANCHISE', type: 'value', defaultValue: 12 },
      { id: 'franchise-xp', label: 'Franchise XP Multiplier', description: 'Multiply all franchise experience gained', category: 'FRANCHISE', type: 'value', defaultValue: 2, proOnly: true },
      { id: 'add-star-tokens', label: 'Add 10 Star Tokens', description: 'Drop 10 star tokens in your pocket', category: 'FRANCHISE', hotkey: 'F3', type: 'button' },
      { id: 'unlimited-star-tokens', label: 'Unlimited Star Tokens', description: 'Star tokens never run out', category: 'FRANCHISE', type: 'toggle', proOnly: true },
      { id: 'unlimited-shelf', label: 'Unlimited Shelf Items', description: 'Shelves never go empty', category: 'STORE OPS', hotkey: 'F4', type: 'toggle' },
      { id: 'instant-restock', label: 'Instant Restock', description: 'Deliveries arrive instantly', category: 'STORE OPS', type: 'toggle' },
      { id: 'no-customer-complaints', label: 'No Customer Complaints', description: 'Customers are always happy', category: 'STORE OPS', type: 'toggle', proOnly: true },
      { id: 'god-mode', label: 'God Mode', description: 'You cannot be fired or lose the store', category: 'MISC', hotkey: 'F5', type: 'toggle' },
    ],
  },
  {
    id: 'supermarket-simulator',
    name: 'Supermarket Simulator',
    steamAppId: 2670760,
    platform: 'steam',
    processes: ['SupermarketSimulator.exe'],
    coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2670760/library_600x900.jpg',
    heroUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2670760/header.jpg',
    accentColor: '#10b981',
    cheats: [
      { id: 'unlimited-money', label: 'Unlimited Money', description: 'Never run out of cash', category: 'ECONOMY', hotkey: 'F1', type: 'toggle' },
      { id: 'set-money', label: 'Set Money', description: 'Set your exact balance', category: 'ECONOMY', type: 'value', defaultValue: 999999 },
      { id: 'fast-customers', label: 'Fast Customers', description: 'Customers move at double speed', category: 'STORE', type: 'toggle' },
      { id: 'unlimited-licenses', label: 'All Licenses Unlocked', description: 'Every product license available', category: 'STORE', type: 'toggle', proOnly: true },
    ],
  },
  {
    id: 'planet-crafter',
    name: 'The Planet Crafter',
    steamAppId: 1284190,
    platform: 'steam',
    processes: ['Planet Crafter.exe', 'PlanetCrafter.exe'],
    coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1284190/library_600x900.jpg',
    heroUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1284190/header.jpg',
    accentColor: '#3b82f6',
    cheats: [
      { id: 'unlimited-oxygen', label: 'Unlimited Oxygen', description: 'Oxygen never depletes', category: 'SURVIVAL', hotkey: 'F1', type: 'toggle' },
      { id: 'unlimited-water', label: 'Unlimited Water', description: 'Water never depletes', category: 'SURVIVAL', hotkey: 'F2', type: 'toggle' },
      { id: 'unlimited-food', label: 'Unlimited Food', description: 'Food never depletes', category: 'SURVIVAL', hotkey: 'F3', type: 'toggle' },
      { id: 'fast-terraform', label: 'Fast Terraforming', description: 'Terraform speed x10', category: 'TERRAFORMING', type: 'toggle', proOnly: true },
      { id: 'unlimited-inventory', label: 'Unlimited Inventory', description: 'Carry as much as you want', category: 'INVENTORY', type: 'toggle' },
    ],
  },
  {
    id: 'gta-v',
    name: 'Grand Theft Auto V',
    steamAppId: 271590,
    platform: 'steam',
    processes: ['GTA5.exe'],
    coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/library_600x900.jpg',
    heroUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg',
    accentColor: '#ef4444',
    cheats: [
      { id: 'unlimited-health', label: 'Unlimited Health', description: 'Health never drops below 1', category: 'PLAYER', hotkey: 'F1', type: 'toggle' },
      { id: 'unlimited-armor', label: 'Unlimited Armor', description: 'Full armor at all times', category: 'PLAYER', hotkey: 'F2', type: 'toggle' },
      { id: 'set-money', label: 'Set Money', description: 'Set your cash balance', category: 'ECONOMY', type: 'value', defaultValue: 9999999 },
      { id: 'wanted-none', label: 'No Wanted Level', description: 'Police ignore you completely', category: 'WANTED', hotkey: 'F3', type: 'toggle', proOnly: true },
      { id: 'super-speed', label: 'Super Speed', description: 'Move at superhuman speed', category: 'PLAYER', type: 'toggle', proOnly: true },
    ],
  },
  {
    id: 'cyberpunk-2077',
    name: 'Cyberpunk 2077',
    steamAppId: 1091500,
    platform: 'steam',
    processes: ['Cyberpunk2077.exe'],
    coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/library_600x900.jpg',
    heroUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg',
    accentColor: '#f59e0b',
    cheats: [
      { id: 'god-mode', label: 'God Mode', description: 'Cannot die', category: 'PLAYER', hotkey: 'F1', type: 'toggle' },
      { id: 'unlimited-stamina', label: 'Unlimited Stamina', description: 'Sprint forever', category: 'PLAYER', hotkey: 'F2', type: 'toggle' },
      { id: 'set-eddies', label: 'Set Eurodollars', description: 'Set your eddies balance', category: 'ECONOMY', type: 'value', defaultValue: 999999 },
      { id: 'max-street-cred', label: 'Max Street Cred', description: 'Instant max reputation', category: 'PROGRESSION', type: 'button', proOnly: true },
    ],
  },
  {
    id: 'elden-ring',
    name: 'Elden Ring',
    steamAppId: 1245620,
    platform: 'steam',
    processes: ['eldenring.exe'],
    coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg',
    heroUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg',
    accentColor: '#d97706',
    cheats: [
      { id: 'god-mode', label: 'God Mode', description: 'Cannot die — offline only', category: 'PLAYER', hotkey: 'F1', type: 'toggle' },
      { id: 'unlimited-fp', label: 'Unlimited FP', description: 'Magic never runs out', category: 'PLAYER', hotkey: 'F2', type: 'toggle' },
      { id: 'unlimited-stamina', label: 'Unlimited Stamina', description: 'Never get tired', category: 'PLAYER', hotkey: 'F3', type: 'toggle' },
      { id: 'set-runes', label: 'Set Runes', description: 'Set your rune count', category: 'ECONOMY', type: 'value', defaultValue: 9999999 },
      { id: 'one-hit-kill', label: 'One Hit Kill', description: 'Every hit kills instantly', category: 'COMBAT', type: 'toggle', proOnly: true },
    ],
  },
  {
    id: 'mall-simulator',
    name: 'Mall Simulator',
    steamAppId: 2498840,
    platform: 'steam',
    processes: ['MallSimulator.exe'],
    coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2498840/library_600x900.jpg',
    heroUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2498840/header.jpg',
    accentColor: '#8b5cf6',
    cheats: [
      { id: 'unlimited-money', label: 'Unlimited Money', description: 'Infinite budget', category: 'ECONOMY', hotkey: 'F1', type: 'toggle' },
      { id: 'set-money', label: 'Set Money', description: 'Set exact balance', category: 'ECONOMY', type: 'value', defaultValue: 500000 },
      { id: 'all-shops-unlocked', label: 'All Shops Unlocked', description: 'Every store type available', category: 'MALL', type: 'toggle', proOnly: true },
    ],
  },
  {
    id: 'gym-simulator-24',
    name: 'Gym Simulator 24',
    steamAppId: 2255320,
    platform: 'steam',
    processes: ['GymSimulator24.exe'],
    coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2255320/library_600x900.jpg',
    heroUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2255320/header.jpg',
    accentColor: '#06b6d4',
    cheats: [
      { id: 'unlimited-money', label: 'Unlimited Money', description: 'Never run out of funds', category: 'ECONOMY', hotkey: 'F1', type: 'toggle' },
      { id: 'max-reputation', label: 'Max Reputation', description: 'Instant 5-star gym', category: 'REPUTATION', type: 'button' },
      { id: 'unlimited-members', label: 'No Member Limit', description: 'Gym never hits capacity', category: 'GYM', type: 'toggle', proOnly: true },
    ],
  },
];

export function getGame(id: string): Game | undefined {
  return GAMES.find(g => g.id === id);
}
