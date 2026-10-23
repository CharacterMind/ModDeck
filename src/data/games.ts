import {
  Car,
  Castle,
  CloudSun,
  Coins,
  CreditCard,
  Crosshair,
  Crown,
  Dices,
  Dumbbell,
  FlaskConical,
  Ghost,
  Globe2,
  Heart,
  Map,
  Move3d,
  Package,
  Rocket,
  Scroll,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Skull,
  Sparkles,
  Star,
  Store,
  ShoppingBasket,
  Swords,
  Timer,
  TreePine,
  User,
  Wand2,
  Zap,
  Factory,
  type LucideIcon,
} from "lucide-react";

export type CheatType = "toggle" | "slider" | "action";

export type Effect =
  | "god"
  | "infhealth"
  | "onehit"
  | "infmoney"
  | "addmoney"
  | "infammo"
  | "freeze"
  | "xp"
  | "speed"
  | "jump"
  | "setmoney"
  | "setxp"
  | "moneyx";

export interface CheatDef {
  id: string;
  name: string;
  desc: string;
  type: CheatType;
  hotkey?: string;
  pro?: boolean;
  effect?: Effect;
  slider?: {
    min: number;
    max: number;
    step: number;
    default: number;
    unit: string;
    /** decimal places the typed input accepts (money: 2) */
    decimals?: number;
    /** quick-set chips rendered under the slider (e.g. 1M / 1B / 1T) */
    presets?: number[];
  };
}

export interface CheatCategoryDef {
  id: string;
  name: string;
  icon: LucideIcon;
  cheats: CheatDef[];
}

export interface Game {
  id: string;
  title: string;
  genre: string;
  platforms: string[];
  rating: number;
  downloads: string;
  size: string;
  version: string;
  updated: string;
  featured?: boolean;
  players: string;
  icon: LucideIcon;
  /** real cover art served from /games/<id>.jpg (falls back to gradient art) */
  cover?: string;
  gradient: [string, string];
  scene: { sky: [string, string]; ground: string; accent: string; hero: LucideIcon; enemy: LucideIcon };
  categories: CheatCategoryDef[];
}

const t = (
  id: string,
  name: string,
  desc: string,
  hotkey?: string,
  effect?: Effect,
  pro = false
): CheatDef => ({ id, name, desc, type: "toggle", hotkey, effect, pro });

const s = (
  id: string,
  name: string,
  desc: string,
  min: number,
  max: number,
  step: number,
  def: number,
  unit: string,
  effect?: Effect,
  pro = false,
  opts?: { decimals?: number; presets?: number[] }
): CheatDef => ({
  id,
  name,
  desc,
  type: "slider",
  slider: { min, max, step, default: def, unit, ...opts },
  effect,
  pro,
});

/** money sliders share the same number space: $0 → $1 trillion, decimals allowed */
const MONEY_RANGE = { min: 0, max: 1e12, step: 1e9, decimals: 2 } as const;
const MONEY_PRESETS = [1e6, 1e8, 1e9, 1e11, 1e12];

const a = (id: string, name: string, desc: string, hotkey: string, effect?: Effect): CheatDef => ({
  id,
  name,
  desc,
  type: "action",
  hotkey,
  effect,
});

export const GAMES: Game[] = [
  {
    // ---- Supermarket Together (default / first game) ----
    // Cheat set researched from real trainers: WeMod, MrAntiFun, FLiNG, PLITCH
    id: "supermarket-together",
    title: "Supermarket Together",
    cover: "/games/v3/supermarket-together.jpg",
    genre: "Co-op Sim",
    platforms: ["Steam"],
    rating: 4.8,
    downloads: "2.4M",
    size: "8 GB",
    version: "1.2.7",
    updated: "yesterday",
    featured: true,
    players: "126K",
    icon: ShoppingCart,
    gradient: ["#059669", "#a3e635"],
    scene: { sky: ["#0b3b2e", "#43c88c"], ground: "#0f2a20", accent: "#a3e635", hero: ShoppingCart, enemy: Shield },
    categories: [
      {
        id: "funds",
        name: "Funds",
        icon: Coins,
        cheats: [
          t("inf-funds", "Unlimited Funds", "Wallet refills faster than you can spend", "F1", "infmoney"),
          s("set-funds", "Set Funds", "Type any amount you want — decimals allowed, up to $1 trillion", MONEY_RANGE.min, MONEY_RANGE.max, MONEY_RANGE.step, 1e6, "$", "setmoney", false, { decimals: MONEY_RANGE.decimals, presets: MONEY_PRESETS }),
          a("add-funds", "Add $10,000", "Instant cash injection", "F2", "addmoney"),
          s("money-mult", "Money Multiplier", "Every checkout pays out extra", 1, 10, 1, 1, "x", "moneyx", true),
        ],
      },
      {
        id: "franchise",
        name: "Franchise",
        icon: Star,
        cheats: [
          s("set-franchise-level", "Set Franchise Level", "Jump your franchise to any level", 1, 100, 1, 12, "", "setxp"),
          s("xp-mult", "Franchise XP Multiplier", "Multiply all franchise experience gained", 1, 50, 1, 1, "x", "xp", true),
          a("star-tokens", "Add 10 Star Tokens", "Drop 10 star tokens in your pocket", "F3"),
          t("inf-star-tokens", "Unlimited Star Tokens", "Star tokens never run out", undefined, undefined, true),
        ],
      },
      {
        id: "store-ops",
        name: "Store Ops",
        icon: Package,
        cheats: [
          t("inf-shelf", "Unlimited Shelf Items", "Shelves restock themselves instantly", "F4"),
          a("instant-restock", "Instant Restock", "Fill every shelf straight from storage", "F5"),
          t("no-thieves", "No Thieves", "Thieves walk right past your store", "F6"),
          t("free-purchase", "Free Purchasing", "Everything in the catalog costs $0", undefined, undefined, true),
        ],
      },
      {
        id: "time-player",
        name: "Time & Player",
        icon: Timer,
        cheats: [
          s("game-speed", "Time Speed Multiplier", "Speed up the whole in-game day", 1, 10, 0.5, 1, "x", "speed"),
          t("stop-time", "Stop Time", "Freeze the clock — closing time never comes", "F7", "freeze"),
          t("inf-energy", "Infinite Stamina", "Never tire while hauling boxes", "F8"),
          s("customer-boost", "Customer Boost", "More customers roll through the doors", 1, 5, 1, 1, "x"),
        ],
      },
    ],
  },
  {
    // ---- Supermarket Simulator (single-player sim by Nokta — owner request) ----
    id: "supermarket-simulator",
    title: "Supermarket Simulator",
    genre: "Simulator",
    platforms: ["Steam"],
    rating: 4.6,
    downloads: "3.1M",
    size: "6 GB",
    version: "0.4.2",
    updated: "2 days ago",
    players: "88K",
    icon: ShoppingBasket,
    cover: "/games/v3/supermarket-simulator.jpg",
    gradient: ["#d97706", "#facc15"],
    scene: { sky: ["#3b2305", "#eab308"], ground: "#241a05", accent: "#facc15", hero: ShoppingBasket, enemy: Ghost },
    categories: [
      {
        id: "funds",
        name: "Funds",
        icon: Coins,
        cheats: [
          t("inf-money", "Unlimited Funds", "The register never empties", "F1", "infmoney"),
          s("set-funds", "Set Funds", "Type any amount you want — decimals allowed, up to $1 trillion", MONEY_RANGE.min, MONEY_RANGE.max, MONEY_RANGE.step, 1e6, "$", "setmoney", false, { decimals: MONEY_RANGE.decimals, presets: MONEY_PRESETS }),
          a("add-money", "Add $10,000", "Instant cash injection", "F2", "addmoney"),
          s("money-mult", "Money Multiplier", "Every sale pays out extra", 1, 10, 1, 1, "x", "moneyx", true),
        ],
      },
      {
        id: "store",
        name: "Store",
        icon: Package,
        cheats: [
          t("inf-shelf", "Unlimited Shelf Items", "Shelves refill themselves", "F4"),
          a("instant-restock", "Instant Restock", "Fill every shelf straight from storage", "F5"),
          t("no-thieves", "No Thieves", "Shoplifters forget your store exists", "F6"),
          t("free-purchase", "Free Purchasing", "Everything in the catalog costs $0", undefined, undefined, true),
        ],
      },
      {
        id: "market",
        name: "Market",
        icon: Star,
        cheats: [
          s("set-franchise-level", "Set Store Level", "Jump your store to any level", 1, 100, 1, 12, "", "setxp"),
          s("xp-mult", "XP Multiplier", "Multiply all experience gained", 1, 50, 1, 1, "x", "xp", true),
          s("customer-boost", "Customer Boost", "More shoppers roll through the doors", 1, 5, 1, 1, "x"),
          s("set-day", "Set Day", "Skip the calendar ahead to any day", 1, 100, 1, 5, ""),
        ],
      },
      {
        id: "time-player",
        name: "Time & Player",
        icon: Timer,
        cheats: [
          s("game-speed", "Time Speed Multiplier", "Speed up the whole in-game day", 1, 10, 0.5, 1, "x", "speed"),
          t("stop-time", "Stop Time", "Freeze the clock — closing time never comes", "F7", "freeze"),
          t("inf-stamina", "Infinite Stamina", "Haul boxes all day without tiring", "F8"),
          t("inf-carry", "Infinite Carry Capacity", "Carry the entire pallet in one trip"),
        ],
      },
    ],
  },
  {
    id: "mall-simulator",
    title: "Mall Simulator",
    cover: "/games/v3/mall-simulator.jpg",
    genre: "Simulator",
    platforms: ["Steam"],
    rating: 4.5,
    downloads: "980K",
    size: "12 GB",
    version: "1.4.0",
    updated: "3 days ago",
    players: "48K",
    icon: Store,
    gradient: ["#7c3aed", "#ec4899"],
    scene: { sky: ["#2a1140", "#c04abf"], ground: "#1a1030", accent: "#ec4899", hero: ShoppingBag, enemy: Shield },
    categories: [
      {
        id: "economy",
        name: "Economy",
        icon: Coins,
        cheats: [
          t("inf-money", "Infinite Money", "Rent is a suggestion", "F1", "infmoney"),
          s("set-funds", "Set Funds", "Type any amount you want — decimals allowed, up to $1 trillion", MONEY_RANGE.min, MONEY_RANGE.max, MONEY_RANGE.step, 1e6, "$", "setmoney", false, { decimals: MONEY_RANGE.decimals, presets: MONEY_PRESETS }),
          a("add-money", "Add $10,000", "Instant cash injection", "F2", "addmoney"),
        ],
      },
      {
        id: "expansion",
        name: "Expansion",
        icon: Star,
        cheats: [
          s("xp-mult", "XP Multiplier", "Level your mall empire faster", 1, 50, 1, 1, "x", "xp", true),
          t("instant-build", "Instant Construction", "Shops finish building in a snap", "F3"),
          t("inf-materials", "Infinite Materials", "Never buy construction supplies", "F4"),
        ],
      },
      {
        id: "mall-ops",
        name: "Mall Ops",
        icon: Package,
        cheats: [
          t("inf-shelf", "Unlimited Stock", "Storerooms never empty", "F5"),
          a("instant-restock", "Instant Restock", "Every shelf filled", "F6"),
          t("no-thieves", "No Thieves", "Shoplifters simply vanish", "F7"),
          s("customer-boost", "Customer Boost", "Fill the mall with shoppers", 1, 5, 1, 1, "x"),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Timer,
        cheats: [
          s("game-speed", "Time Speed Multiplier", "Speed up the whole day", 1, 10, 0.5, 1, "x", "speed"),
          t("stop-time", "Stop Time", "Freeze the mall clock", "F8", "freeze"),
          t("free-purchase", "Free Purchasing", "Buy anything for $0", undefined, undefined, true),
        ],
      },
    ],
  },
  {
    id: "planet-crafter",
    title: "The Planet Crafter",
    cover: "/games/v3/planet-crafter.jpg",
    genre: "Survival",
    platforms: ["Steam"],
    rating: 4.7,
    downloads: "1.3M",
    size: "10 GB",
    version: "1.2.11",
    updated: "1 week ago",
    players: "39K",
    icon: Globe2,
    gradient: ["#0e7490", "#67e8f9"],
    scene: { sky: ["#0c3444", "#3ec6d8"], ground: "#0f2a33", accent: "#67e8f9", hero: Globe2, enemy: Ghost },
    categories: [
      {
        id: "survivor",
        name: "Survivor",
        icon: User,
        cheats: [
          t("god-mode", "God Mode", "Nothing on the planet can hurt you", "F1", "god"),
          t("inf-health", "Infinite Health", "HP always full", "F2", "infhealth"),
          t("inf-oxygen", "Infinite Oxygen", "Breathe forever without a suit refill", "F3"),
          t("inf-stamina", "Infinite Stamina", "Run across the whole map", "F4"),
        ],
      },
      {
        id: "resources",
        name: "Resources",
        icon: Coins,
        cheats: [
          t("inf-money", "Infinite Credits", "Trade stations love you", "F5", "infmoney"),
          a("add-money", "Add 10,000 Credits", "Instant credit transfer", "Ctrl+C", "addmoney"),
          t("inf-materials", "Infinite Materials", "Iron, ice and iridium forever", "F6"),
          t("inf-energy", "Infinite Energy", "Every machine runs at full power", "F7"),
        ],
      },
      {
        id: "terraforming",
        name: "Terraforming",
        icon: Globe2,
        cheats: [
          s("xp-mult", "Terraformation Multiplier", "Skyrockets terraformation score", 1, 50, 1, 1, "x", "xp", true),
          t("instant-build", "Instant Construction", "Buildings complete instantly", "F8"),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Timer,
        cheats: [
          s("speed", "Movement Speed", "Sprint like the wind", 1, 10, 0.5, 1, "x", "speed"),
          t("freeze-time", "Freeze Time", "Perfect weather, forever", "F9", "freeze"),
          t("no-meteors", "No Meteor Showers", "Meteors never fall on your base"),
        ],
      },
    ],
  },
  {
    id: "gym-simulator-24",
    title: "Gym Simulator 24",
    cover: "/games/v3/gym-simulator-24.jpg",
    genre: "Simulator",
    platforms: ["Steam"],
    rating: 4.4,
    downloads: "720K",
    size: "9 GB",
    version: "2.1.3",
    updated: "5 days ago",
    players: "31K",
    icon: Dumbbell,
    gradient: ["#ea580c", "#facc15"],
    scene: { sky: ["#4a2005", "#f59e0b"], ground: "#241203", accent: "#facc15", hero: Dumbbell, enemy: Ghost },
    categories: [
      {
        id: "economy",
        name: "Economy",
        icon: Coins,
        cheats: [
          t("inf-money", "Infinite Money", "Memberships pay out forever", "F1", "infmoney"),
          s("set-funds", "Set Funds", "Type any amount you want — decimals allowed, up to $1 trillion", MONEY_RANGE.min, MONEY_RANGE.max, MONEY_RANGE.step, 1e6, "$", "setmoney", false, { decimals: MONEY_RANGE.decimals, presets: MONEY_PRESETS }),
          a("add-money", "Add $10,000", "Instant cash injection", "F2", "addmoney"),
        ],
      },
      {
        id: "progress",
        name: "Progress",
        icon: Star,
        cheats: [
          s("set-level", "Set Body Level", "Jump straight to any fitness level", 1, 100, 1, 12, "", "setxp"),
          s("xp-mult", "XP Multiplier", "Gain muscle XP in bulk", 1, 50, 1, 1, "x", "xp", true),
          a("add-members", "Add 50 Members", "A bus of new members arrives", "F3"),
        ],
      },
      {
        id: "gym-ops",
        name: "Gym Ops",
        icon: Package,
        cheats: [
          t("inf-shelf", "Unlimited Supplements", "Protein shelf never empties", "F4"),
          a("instant-restock", "Instant Restock", "Every machine stocked", "F5"),
          s("customer-boost", "Customer Boost", "Pack the gym floor", 1, 5, 1, 1, "x"),
          t("no-thieves", "No Thieves", "Nobody skips on their bill", "F6"),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Timer,
        cheats: [
          s("game-speed", "Time Speed Multiplier", "Speed up opening hours", 1, 10, 0.5, 1, "x", "speed"),
          t("stop-time", "Stop Time", "Never close the gym", "F7", "freeze"),
          t("inf-energy", "Infinite Stamina", "Curl dumbbells all day", "F8"),
        ],
      },
    ],
  },
  {
    // ---- Satisfactory (owner-request lineup: Steam covers) ----
    id: "satisfactory",
    title: "Satisfactory",
    cover: "/games/v3/satisfactory.jpg",
    genre: "Factory Sim",
    platforms: ["Steam"],
    rating: 4.9,
    downloads: "1.8M",
    size: "20 GB",
    version: "1.0.1",
    updated: "4 days ago",
    players: "54K",
    icon: Factory,
    gradient: ["#ea580c", "#f59e0b"],
    scene: { sky: ["#3a1200", "#f97316"], ground: "#241000", accent: "#f59e0b", hero: Factory, enemy: Ghost },
    categories: [
      {
        id: "economy",
        name: "Economy",
        icon: Coins,
        cheats: [
          t("inf-money", "Infinite Coupons", "The AWESOME sink never runs dry", "F1", "infmoney"),
          s("set-funds", "Set Coupons", "Type any amount you want — decimals allowed, up to $1 trillion", MONEY_RANGE.min, MONEY_RANGE.max, MONEY_RANGE.step, 1e6, "$", "setmoney", false, { decimals: MONEY_RANGE.decimals, presets: MONEY_PRESETS }),
          a("add-money", "Add $10,000", "Instant coupon injection", "F2", "addmoney"),
        ],
      },
      {
        id: "factory",
        name: "Factory",
        icon: Package,
        cheats: [
          t("instant-build", "Instant Construction", "Every building snaps up in a blink", "F3"),
          t("inf-materials", "Infinite Materials", "Conveyor parts from thin air", "F4"),
          t("free-build", "Free Building", "Construct anything at zero cost", undefined, undefined, true),
          s("power-boost", "Power Multiplier", "Overclock the whole grid", 1, 10, 1, 1, "x"),
        ],
      },
      {
        id: "research",
        name: "Research",
        icon: Star,
        cheats: [
          s("set-tier", "Set Milestone Tier", "Jump your career to any tier", 1, 100, 1, 12, "", "setxp"),
          s("xp-mult", "Research Multiplier", "Multiply all research points earned", 1, 50, 1, 1, "x", "xp", true),
          a("scan-all", "Scan Everything", "Instantly complete the current scan", "F5"),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Timer,
        cheats: [
          s("game-speed", "Time Speed Multiplier", "Speed up the whole factory day", 1, 10, 0.5, 1, "x", "speed"),
          t("stop-time", "Stop Time", "Freeze the world mid-conveyor", "F6", "freeze"),
          t("inf-stamina", "Infinite Stamina", "Sprint across the map forever", "F7"),
        ],
      },
    ],
  },
  {
    id: "poppy-playtime",
    title: "Poppy Playtime",
    cover: "/games/v3/poppy-playtime.jpg",
    genre: "Horror",
    platforms: ["Steam"],
    rating: 4.3,
    downloads: "2.1M",
    size: "9 GB",
    version: "1.3.2",
    updated: "1 week ago",
    players: "19K",
    icon: Ghost,
    gradient: ["#dc2626", "#2563eb"],
    scene: { sky: ["#1a0505", "#7f1d1d"], ground: "#0d0202", accent: "#ef4444", hero: Ghost, enemy: Crosshair },
    categories: [
      {
        id: "player",
        name: "Player",
        icon: Heart,
        cheats: [
          t("god", "God Mode", "Huggy can never catch you", "F1", "god"),
          t("inf-health", "Infinite Health", "Survive every encounter", "F2", "infhealth"),
          t("no-scare", "No Game Over", "Game overs simply do not happen", undefined, undefined, true),
        ],
      },
      {
        id: "movement",
        name: "Movement",
        icon: Move3d,
        cheats: [
          s("game-speed", "Game Speed Multiplier", "Outrun anything in the factory", 1, 10, 0.5, 1, "x", "speed"),
          t("super-jump", "Super Jump", "Leap over conveyor belts", "F3", "jump"),
          t("stop-time", "Stop Time", "Freeze the toys in place", "F4", "freeze"),
        ],
      },
      {
        id: "items",
        name: "Items",
        icon: Package,
        cheats: [
          t("inf-ammo", "Infinite Grab Charge", "GrabPack never runs out", "F5", "infammo"),
          t("inf-stamina", "Infinite Stamina", "Sprint through the vents all night", "F6"),
          a("reveal-items", "Reveal Items", "Highlight every collectible nearby", "F7"),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Timer,
        cheats: [
          s("set-chapter", "Set Chapter Progress", "Jump to any chapter", 1, 10, 1, 1, ""),
          t("no-pursuit", "No Pursuit", "Toys lose interest instantly", undefined, undefined, true),
          t("dim-lights", "Night Vision", "See in the dark without the flashlight", "F8"),
        ],
      },
    ],
  },
  {
    id: "tcg-card-shop-simulator",
    title: "TCG Card Shop Simulator",
    cover: "/games/v3/tcg-card-shop-simulator.jpg",
    genre: "Simulator",
    platforms: ["Steam"],
    rating: 4.6,
    downloads: "1.6M",
    size: "7 GB",
    version: "0.5.1",
    updated: "3 days ago",
    players: "62K",
    icon: CreditCard,
    gradient: ["#0891b2", "#8b5cf6"],
    scene: { sky: ["#04202c", "#22d3ee"], ground: "#06121a", accent: "#22d3ee", hero: CreditCard, enemy: Ghost },
    categories: [
      {
        id: "economy",
        name: "Economy",
        icon: Coins,
        cheats: [
          t("inf-money", "Infinite Money", "Every pack you buy is free profit", "F1", "infmoney"),
          s("set-funds", "Set Funds", "Type any amount you want — decimals allowed, up to $1 trillion", MONEY_RANGE.min, MONEY_RANGE.max, MONEY_RANGE.step, 1e6, "$", "setmoney", false, { decimals: MONEY_RANGE.decimals, presets: MONEY_PRESETS }),
          a("add-money", "Add $10,000", "Instant cash injection", "F2", "addmoney"),
          s("money-mult", "Money Multiplier", "Every sale pays out extra", 1, 10, 1, 1, "x", "moneyx", true),
        ],
      },
      {
        id: "shop",
        name: "Shop",
        icon: Package,
        cheats: [
          t("inf-shelf", "Unlimited Shelf Items", "Card shelves restock themselves", "F4"),
          a("instant-restock", "Instant Restock", "Fill every display case", "F5"),
          t("no-thieves", "No Thieves", "Card cheaters get banned on sight", "F6"),
          t("free-purchase", "Free Purchasing", "Stock orders cost $0", undefined, undefined, true),
        ],
      },
      {
        id: "progress",
        name: "Progress",
        icon: Star,
        cheats: [
          s("set-level", "Set Store Level", "Jump your shop to any level", 1, 100, 1, 12, "", "setxp"),
          s("xp-mult", "XP Multiplier", "Level your shop in bulk", 1, 50, 1, 1, "x", "xp", true),
          s("customer-boost", "Customer Boost", "Pack the store with collectors", 1, 5, 1, 1, "x"),
          a("pack-luck", "God Pack Next", "Your next pack is a god pack", "F7"),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Timer,
        cheats: [
          s("game-speed", "Time Speed Multiplier", "Speed up opening hours", 1, 10, 0.5, 1, "x", "speed"),
          t("stop-time", "Stop Time", "Never close the card shop", "F8", "freeze"),
          t("inf-stamina", "Infinite Stamina", "Grade cards all night", "F9"),
        ],
      },
    ],
  },
  {
    id: "the-forest",
    title: "The Forest",
    cover: "/games/v3/the-forest.jpg",
    genre: "Survival",
    platforms: ["Steam"],
    rating: 4.7,
    downloads: "3.4M",
    size: "8 GB",
    version: "1.1.4",
    updated: "2 weeks ago",
    players: "27K",
    icon: TreePine,
    gradient: ["#166534", "#84cc16"],
    scene: { sky: ["#04150a", "#4d7c0f"], ground: "#020a04", accent: "#84cc16", hero: TreePine, enemy: Skull },
    categories: [
      {
        id: "survival",
        name: "Survival",
        icon: Heart,
        cheats: [
          t("god", "God Mode", "Cannibals cannot touch you", "F1", "god"),
          t("inf-health", "Infinite Health", "Health bar never drops", "F2", "infhealth"),
          t("one-hit", "One-Hit Kills", "Every swing is a killing blow", undefined, "onehit", true),
        ],
      },
      {
        id: "building",
        name: "Building",
        icon: Package,
        cheats: [
          t("instant-build", "Instant Construction", "Your base builds itself", "F3"),
          t("inf-materials", "Infinite Materials", "Logs and sticks from thin air", "F4"),
          t("free-build", "Free Building", "No blueprints cost resources", undefined, undefined, true),
        ],
      },
      {
        id: "items",
        name: "Items",
        icon: Crosshair,
        cheats: [
          t("inf-ammo", "Infinite Ammo", "Bows and guns never empty", "F5", "infammo"),
          t("inf-stamina", "Infinite Stamina", "Chop trees without stopping", "F6"),
          t("inf-carry", "Infinite Carry Capacity", "Haul the whole forest home"),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Timer,
        cheats: [
          s("game-speed", "Time Speed Multiplier", "Speed up day and night", 1, 10, 0.5, 1, "x", "speed"),
          t("stop-time", "Stop Time", "The sun never sets", "F7", "freeze"),
          t("super-jump", "Super Jump", "Leap over the tree line", "F8", "jump"),
        ],
      },
    ],
  },
  {
    id: "7-days-to-die",
    title: "7 Days to Die",
    cover: "/games/v3/7-days-to-die.jpg",
    genre: "Zombie Survival",
    platforms: ["Steam"],
    rating: 4.5,
    downloads: "4.2M",
    size: "15 GB",
    version: "1.4.2",
    updated: "yesterday",
    players: "71K",
    icon: Skull,
    gradient: ["#7f1d1d", "#f97316"],
    scene: { sky: ["#160404", "#991b1b"], ground: "#0a0202", accent: "#ef4444", hero: Skull, enemy: Ghost },
    categories: [
      {
        id: "survival",
        name: "Survival",
        icon: Heart,
        cheats: [
          t("god", "God Mode", "Walk through the horde untouched", "F1", "god"),
          t("inf-health", "Infinite Health", "Blood moon cannot kill you", "F2", "infhealth"),
          t("one-hit", "One-Hit Kills", "Every swing drops a zombie", "F3", "onehit"),
        ],
      },
      {
        id: "money",
        name: "Money",
        icon: Coins,
        cheats: [
          t("inf-money", "Infinite Dukes", "The trader never says no", "F4", "infmoney"),
          s("set-funds", "Set Dukes", "Type any amount you want — decimals allowed, up to $1 trillion", MONEY_RANGE.min, MONEY_RANGE.max, MONEY_RANGE.step, 1e6, "$", "setmoney", false, { decimals: MONEY_RANGE.decimals, presets: MONEY_PRESETS }),
          a("add-money", "Add $10,000", "Instant dukes injection", "F5", "addmoney"),
        ],
      },
      {
        id: "items",
        name: "Items",
        icon: Package,
        cheats: [
          t("inf-ammo", "Infinite Ammo", "Never scavenge bullets again", "F6", "infammo"),
          t("inf-carry", "Infinite Carry Capacity", "Loot the whole town in one trip"),
          a("max-quality", "Max Weapon Quality", "Instantly max the held weapon", "F7"),
          t("free-craft", "Free Crafting", "Craft anything at zero cost", undefined, undefined, true),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Timer,
        cheats: [
          s("game-speed", "Time Speed Multiplier", "Speed up the 7-day cycle", 1, 10, 0.5, 1, "x", "speed"),
          t("stop-time", "Stop Time", "Blood moon postponed forever", "F8", "freeze"),
          s("set-game-stage", "Set Game Stage", "Jump to any game stage", 1, 200, 1, 24, "", "setxp"),
        ],
      },
    ],
  },
  {
    id: "gta-v",
    title: "Grand Theft Auto V",
    cover: "/games/v3/gta-v.jpg",
    genre: "Action",
    platforms: ["Steam", "Epic", "Rockstar"],
    rating: 4.9,
    downloads: "8.2M",
    size: "94 GB",
    version: "1.70",
    updated: "2 days ago",
    featured: true,
    players: "512K",
    icon: Car,
    gradient: ["#0f4c5c", "#e36414"],
    scene: { sky: ["#1a2a4a", "#c2571c"], ground: "#242b38", accent: "#00c8ff", hero: Car, enemy: Shield },
    categories: [
      {
        id: "player",
        name: "Player",
        icon: User,
        cheats: [
          t("god-mode", "God Mode", "You are completely invincible", "F1", "god"),
          t("inf-health", "Infinite Health", "Health constantly regenerates", "F2", "infhealth"),
          t("one-hit", "One-Hit Kills", "Any hit instantly eliminates targets", "F3", "onehit", true),
          t("no-wanted", "No Wanted Level", "Police never chase you", "F4"),
        ],
      },
      {
        id: "movement",
        name: "Movement",
        icon: Move3d,
        cheats: [
          s("speed", "Super Speed", "Move at superhuman speed", 1, 10, 0.5, 1, "x", "speed"),
          t("super-jump", "Super Jump", "Jump dozens of meters high", "F5", "jump"),
          t("no-clip", "Noclip", "Fly through walls and terrain", "F6", undefined, true),
          t("inf-stamina", "Infinite Stamina", "Never run out of breath", "F7"),
        ],
      },
      {
        id: "money",
        name: "Money & Ammo",
        icon: Coins,
        cheats: [
          t("inf-money", "Infinite Money", "Wallet keeps filling up", "F8", "infmoney"),
          a("add-money", "Add $10,000", "Instantly add cash", "Ctrl+M", "addmoney"),
          t("inf-ammo", "Infinite Ammo", "Never reload again", "F9", "infammo"),
          a("spawn-car", "Spawn Super Car", "Spawn a vehicle in front", "Ctrl+S"),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Globe2,
        cheats: [
          t("freeze-time", "Freeze Time", "Pause the in-game clock and NPC AI", "F10", "freeze"),
          s("xp-mult", "RP Multiplier", "Multiply all RP gained", 1, 50, 1, 1, "x", "xp", true),
          t("max-rep", "Max Reputation", "All stats maxed out", undefined, undefined, true),
        ],
      },
    ],
  },
  {
    id: "cyberpunk-2077",
    title: "Cyberpunk 2077",
    cover: "/games/v3/cyberpunk-2077.jpg",
    genre: "RPG",
    platforms: ["Steam", "GOG", "Epic"],
    rating: 4.7,
    downloads: "5.6M",
    size: "72 GB",
    version: "2.21",
    updated: "5 days ago",
    featured: true,
    players: "341K",
    icon: Zap,
    gradient: ["#f9d423", "#00c8ff"],
    scene: { sky: ["#0c1b2a", "#f2b705"], ground: "#141821", accent: "#f9d423", hero: Zap, enemy: Ghost },
    categories: [
      {
        id: "player",
        name: "Player",
        icon: User,
        cheats: [
          t("god-mode", "Invincibility", "Netrunning can't hurt you", "F1", "god"),
          t("inf-health", "Infinite Health", "Health immediately restores", "F2", "infhealth"),
          t("one-hit", "One-Hit Kills", "Delete enemies with a single shot", "F3", "onehit", true),
        ],
      },
      {
        id: "money",
        name: "Eddies & Gear",
        icon: Coins,
        cheats: [
          t("inf-money", "Infinite Eddies", "Unlimited cheddar", "F4", "infmoney"),
          a("add-money", "Add 10,000 Eddies", "Instant cash transfer", "Ctrl+E", "addmoney"),
          t("inf-ammo", "Infinite Ammo", "Magazine never empties", "F5", "infammo"),
          t("legendary-items", "Legendary Crafting", "Craft items without materials", undefined, undefined, true),
        ],
      },
      {
        id: "cyberware",
        name: "Cyberware",
        icon: Sparkles,
        cheats: [
          s("speed", "Kerenzikov Speed", "Slow-motion reflexes multiplier", 1, 10, 0.5, 1, "x", "speed"),
          t("inf-ram", "Infinite RAM", "Quickhack without limits", "F6"),
          t("no-cooldown", "No Quickhack Cooldown", "Spam cyberattacks freely", "F7"),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Globe2,
        cheats: [
          t("freeze-time", "Freeze NC", "Stop time in Night City", "F8", "freeze"),
          s("xp-mult", "XP Multiplier", "Boost street cred & XP gain", 1, 50, 1, 1, "x", "xp", true),
          t("no-wanted", "MaxTac Off", "Police ignore your crimes", "F9"),
        ],
      },
    ],
  },
  {
    id: "elden-ring",
    title: "Elden Ring",
    cover: "/games/v3/elden-ring.jpg",
    genre: "Souls-like",
    platforms: ["Steam"],
    rating: 4.8,
    downloads: "3.9M",
    size: "60 GB",
    version: "1.16",
    updated: "1 week ago",
    featured: true,
    players: "287K",
    icon: Crown,
    gradient: ["#3d3223", "#c9a227"],
    scene: { sky: ["#241d12", "#b98a2f"], ground: "#1d1812", accent: "#e6b93d", hero: Crown, enemy: Swords },
    categories: [
      {
        id: "player",
        name: "Tarnished",
        icon: User,
        cheats: [
          t("god-mode", "God Mode", "Become unkillable in the Lands Between", "F1", "god"),
          t("inf-health", "Infinite HP", "Flask-less regeneration", "F2", "infhealth"),
          t("one-hit", "One-Hit Kills", "Slay demigods in one strike", "F3", "onehit", true),
        ],
      },
      {
        id: "runes",
        name: "Runes",
        icon: Coins,
        cheats: [
          t("inf-runes", "Infinite Runes", "Runes never run out", "F4", "infmoney"),
          a("add-runes", "Add 10,000 Runes", "Instant rune injection", "Ctrl+R", "addmoney"),
          s("xp-mult", "Rune Multiplier", "Multiply every rune picked up", 1, 50, 1, 1, "x", "xp", true),
        ],
      },
      {
        id: "combat",
        name: "Combat",
        icon: Swords,
        cheats: [
          s("speed", "Swift Movement", "Move with unholy speed", 1, 10, 0.5, 1, "x", "speed"),
          t("inf-stamina", "Infinite Stamina", "Roll and attack forever", "F5"),
          t("no-death", "No Death Trigger", "Dying doesn't lose runes", "F6"),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Map,
        cheats: [
          t("freeze-time", "Stop Time", "Freeze enemies and world", "F7", "freeze"),
          t("all-unlocks", "Unlock All Sites", "Every grace site unlocked", undefined, undefined, true),
        ],
      },
    ],
  },
  {
    id: "rdr2",
    title: "Red Dead Redemption 2",
    cover: "/games/v3/rdr2.jpg",
    genre: "Adventure",
    platforms: ["Steam", "Epic", "Rockstar"],
    rating: 4.9,
    downloads: "4.4M",
    size: "116 GB",
    version: "1491.50",
    updated: "3 days ago",
    players: "224K",
    icon: Map,
    gradient: ["#7f1d1d", "#d97706"],
    scene: { sky: ["#2a1a14", "#c2542a"], ground: "#221610", accent: "#e07a3f", hero: Map, enemy: Shield },
    categories: [
      {
        id: "player",
        name: "Outlaw",
        icon: User,
        cheats: [
          t("god-mode", "God Mode", "Bullets can't touch Arthur", "F1", "god"),
          t("inf-health", "Infinite Health", "Health core never drains", "F2", "infhealth"),
          t("one-hit", "Dead Eye Kills", "One shot, one kill", "F3", "onehit", true),
        ],
      },
      {
        id: "money",
        name: "Money",
        icon: Coins,
        cheats: [
          t("inf-money", "Infinite Money", "The vault never empties", "F4", "infmoney"),
          a("add-money", "Add $10,000", "Pocket a fresh stack", "Ctrl+D", "addmoney"),
          t("inf-ammo", "Infinite Ammo", "Saddlebags always full", "F5", "infammo"),
        ],
      },
      {
        id: "horse",
        name: "Horse & Camp",
        icon: Heart,
        cheats: [
          s("speed", "Horse Speed", "Gallop beyond limits", 1, 10, 0.5, 1, "x", "speed"),
          t("inf-stamina", "Infinite Horse Stamina", "Your steed never tires", "F6"),
          t("max-bond", "Max Horse Bonding", "Level 4 bond instantly", "F7"),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: CloudSun,
        cheats: [
          t("freeze-time", "Freeze Time", "Hold the frontier still", "F8", "freeze"),
          s("xp-mult", "XP Multiplier", "Boost all skill cores", 1, 50, 1, 1, "x", "xp", true),
        ],
      },
    ],
  },
  {
    id: "hogwarts-legacy",
    title: "Hogwarts Legacy",
    cover: "/games/v3/hogwarts-legacy.jpg",
    genre: "RPG",
    platforms: ["Steam", "Epic"],
    rating: 4.6,
    downloads: "3.1M",
    size: "85 GB",
    version: "1.0.12",
    updated: "6 days ago",
    players: "198K",
    icon: Wand2,
    gradient: ["#312e81", "#7c3aed"],
    scene: { sky: ["#1e1b4b", "#6d28d9"], ground: "#171331", accent: "#a78bfa", hero: Wand2, enemy: Ghost },
    categories: [
      {
        id: "player",
        name: "Wizard",
        icon: Wand2,
        cheats: [
          t("god-mode", "Protego Maxima", "Permanent invincibility", "F1", "god"),
          t("inf-health", "Infinite Health", "Wounds heal instantly", "F2", "infhealth"),
          t("one-hit", "Avada Unlocked", "One spell, one casualty", "F3", "onehit", true),
        ],
      },
      {
        id: "money",
        name: "Galleons",
        icon: Coins,
        cheats: [
          t("inf-money", "Infinite Galleons", "Gringotts has no limits", "F4", "infmoney"),
          a("add-money", "Add 1,000 Galleons", "Instant vault deposit", "Ctrl+G", "addmoney"),
        ],
      },
      {
        id: "magic",
        name: "Magic",
        icon: Sparkles,
        cheats: [
          t("inf-spell-energy", "Infinite Spell Energy", "Cast without cooldown", "F5"),
          s("speed", "Swift Casting", "Move at magical speed", 1, 10, 0.5, 1, "x", "speed"),
          t("all-spells", "Unlock All Spells", "Every spell from the start", undefined, undefined, true),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Castle,
        cheats: [
          t("freeze-time", "Freeze Time", "Stop the castle clocks", "F6", "freeze"),
          s("xp-mult", "XP Multiplier", "Level up your fifth year fast", 1, 50, 1, 1, "x", "xp", true),
        ],
      },
    ],
  },
  {
    id: "bg3",
    title: "Baldur's Gate 3",
    cover: "/games/v3/bg3.jpg",
    genre: "RPG",
    platforms: ["Steam", "GOG"],
    rating: 4.9,
    downloads: "2.8M",
    size: "122 GB",
    version: "4.69",
    updated: "4 days ago",
    players: "176K",
    icon: Dices,
    gradient: ["#7f1d1d", "#b91c1c"],
    scene: { sky: ["#301b1b", "#8f2d2d"], ground: "#1c1212", accent: "#f87171", hero: Dices, enemy: Swords },
    categories: [
      {
        id: "party",
        name: "Party",
        icon: User,
        cheats: [
          t("god-mode", "God Mode", "The dice always favor you", "F1", "god"),
          t("inf-health", "Infinite HP", "Party never falls", "F2", "infhealth"),
          t("one-hit", "Critical Everything", "Every attack is a crit", "F3", "onehit", true),
        ],
      },
      {
        id: "gold",
        name: "Gold & Loot",
        icon: Coins,
        cheats: [
          t("inf-gold", "Infinite Gold", "Endless riches", "F4", "infmoney"),
          a("add-gold", "Add 10,000 Gold", "Instant coin pouch", "Ctrl+G", "addmoney"),
          t("inf-inspiration", "Infinite Inspiration", "Reroll as much as you like", "F5"),
        ],
      },
      {
        id: "combat",
        name: "Combat",
        icon: Swords,
        cheats: [
          t("inf-actions", "Infinite Actions", "No action point limits", "F6"),
          t("always-first", "Always Win Initiative", "Your party always acts first", "F7"),
          s("xp-mult", "XP Multiplier", "Fast-track to level 12", 1, 50, 1, 1, "x", "xp", true),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Scroll,
        cheats: [
          t("freeze-time", "Freeze Turn Timer", "Take all the time you need", "F8", "freeze"),
          t("all-spells", "Unlock All Spells", "Every spell available", undefined, undefined, true),
        ],
      },
    ],
  },
  {
    id: "witcher-3",
    title: "The Witcher 3",
    cover: "/games/v3/witcher-3.jpg",
    genre: "RPG",
    platforms: ["Steam", "GOG", "Epic"],
    rating: 4.9,
    downloads: "5.1M",
    size: "50 GB",
    version: "4.04",
    updated: "1 week ago",
    players: "165K",
    icon: Swords,
    gradient: ["#1e3a5f", "#64748b"],
    scene: { sky: ["#16233a", "#5a6c84"], ground: "#141b28", accent: "#94a3b8", hero: Swords, enemy: Ghost },
    categories: [
      {
        id: "player",
        name: "Witcher",
        icon: User,
        cheats: [
          t("god-mode", "God Mode", "Mutant invincibility", "F1", "god"),
          t("inf-health", "Infinite Vitality", "Vitality always full", "F2", "infhealth"),
          t("one-hit", "One-Hit Kills", "Any monster dies in one blow", "F3", "onehit", true),
        ],
      },
      {
        id: "money",
        name: "Crowns",
        icon: Coins,
        cheats: [
          t("inf-money", "Infinite Crowns", "Oren and crown overflow", "F4", "infmoney"),
          a("add-money", "Add 10,000 Crowns", "Instant coin pouch", "Ctrl+C", "addmoney"),
          t("inf-ammo", "Infinite Bombs", "Bombs and oils never deplete", "F5"),
        ],
      },
      {
        id: "signs",
        name: "Signs",
        icon: Sparkles,
        cheats: [
          t("inf-stamina", "Infinite Stamina", "Cast signs endlessly", "F6"),
          s("speed", "Swift Movement", "Roach has nothing on you", 1, 10, 0.5, 1, "x", "speed"),
          t("all-skills", "Unlock All Skills", "Every ability tree unlocked", undefined, undefined, true),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: CloudSun,
        cheats: [
          t("freeze-time", "Freeze Time", "Meditation without time passing", "F7", "freeze"),
          s("xp-mult", "XP Multiplier", "Level up between contracts", 1, 50, 1, 1, "x", "xp", true),
        ],
      },
    ],
  },
  {
    id: "starfield",
    title: "Starfield",
    cover: "/games/v3/starfield.jpg",
    genre: "Sci-Fi RPG",
    platforms: ["Steam", "Xbox"],
    rating: 4.3,
    downloads: "2.2M",
    size: "125 GB",
    version: "1.14.70",
    updated: "1 week ago",
    players: "121K",
    icon: Rocket,
    gradient: ["#1e1b4b", "#0ea5e9"],
    scene: { sky: ["#0b1026", "#27446f"], ground: "#101627", accent: "#38bdf8", hero: Rocket, enemy: Ghost },
    categories: [
      {
        id: "player",
        name: "Explorer",
        icon: User,
        cheats: [
          t("god-mode", "God Mode", "Space hazards can't kill you", "F1", "god"),
          t("inf-health", "Infinite Health", "Suit integrity always full", "F2", "infhealth"),
          t("one-hit", "One-Hit Kills", "Dissolve hostiles instantly", "F3", "onehit", true),
        ],
      },
      {
        id: "money",
        name: "Credits",
        icon: Coins,
        cheats: [
          t("inf-credits", "Infinite Credits", "UC pays you forever", "F4", "infmoney"),
          a("add-money", "Add 10,000 Credits", "Instant transfer", "Ctrl+U", "addmoney"),
          t("inf-ammo", "Infinite Ammo", "Magazines never empty", "F5", "infammo"),
        ],
      },
      {
        id: "ship",
        name: "Ship",
        icon: Rocket,
        cheats: [
          t("inf-fuel", "Infinite Fuel", "Grav jump across the galaxy", "F6"),
          t("no-encumbrance", "No Encumbrance", "Carry everything you loot", "F7"),
          s("speed", "Boost Pack Power", "Multiply jetpack thrust", 1, 10, 0.5, 1, "x", "speed"),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Globe2,
        cheats: [
          t("freeze-time", "Freeze Time", "Pause orbital motion", "F8", "freeze"),
          s("xp-mult", "XP Multiplier", "Rank up between planets", 1, 50, 1, 1, "x", "xp", true),
        ],
      },
    ],
  },
  {
    id: "fallout-4",
    title: "Fallout 4",
    cover: "/games/v3/fallout-4.jpg",
    genre: "Post-Apocalyptic",
    platforms: ["Steam"],
    rating: 4.7,
    downloads: "6.0M",
    size: "30 GB",
    version: "1.10.163",
    updated: "2 weeks ago",
    players: "143K",
    icon: FlaskConical,
    gradient: ["#365314", "#65a30d"],
    scene: { sky: ["#1c2410", "#5f7a2a"], ground: "#161a0e", accent: "#a3e635", hero: FlaskConical, enemy: Ghost },
    categories: [
      {
        id: "player",
        name: "Sole Survivor",
        icon: User,
        cheats: [
          t("god-mode", "God Mode", "Rads and bullets bounce off", "F1", "god"),
          t("inf-health", "Infinite Health", "Stimpak-free healing", "F2", "infhealth"),
          t("one-hit", "One-Hit Kills", "Deathclaws fall in one hit", "F3", "onehit", true),
        ],
      },
      {
        id: "money",
        name: "Caps & Ammo",
        icon: Coins,
        cheats: [
          t("inf-caps", "Infinite Caps", "The wasteland economy is yours", "F4", "infmoney"),
          a("add-money", "Add 10,000 Caps", "Instant cap stash", "Ctrl+P", "addmoney"),
          t("inf-ammo", "Infinite Ammo", "Never scavenge bullets again", "F5", "infammo"),
        ],
      },
      {
        id: "survival",
        name: "Survival",
        icon: Heart,
        cheats: [
          t("no-radiation", "No Radiation", "Rad storms are harmless", "F6"),
          t("no-encumbrance", "No Encumbrance", "Carry the whole wasteland", "F7"),
          s("speed", "Vault-Tec Speed", "Move at sprint speed always", 1, 10, 0.5, 1, "x", "speed"),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Timer,
        cheats: [
          t("freeze-time", "Freeze Time", "Pause the wasteland", "F8", "freeze"),
          s("xp-mult", "XP Multiplier", "Power-level your SPECIAL", 1, 50, 1, 1, "x", "xp", true),
        ],
      },
    ],
  },
  {
    id: "spider-man",
    title: "Marvel's Spider-Man Remastered",
    cover: "/games/v3/spider-man.jpg",
    genre: "Action",
    platforms: ["Steam", "Epic"],
    rating: 4.8,
    downloads: "2.4M",
    size: "75 GB",
    version: "1.709",
    updated: "5 days ago",
    players: "98K",
    icon: Globe2,
    gradient: ["#991b1b", "#1d4ed8"],
    scene: { sky: ["#131c3a", "#3b5bdb"], ground: "#10131f", accent: "#e63946", hero: Ghost, enemy: Shield },
    categories: [
      {
        id: "player",
        name: "Spidey",
        icon: User,
        cheats: [
          t("god-mode", "God Mode", "Bullets can't touch the suit", "F1", "god"),
          t("inf-health", "Infinite Health", "Suit integrity restored instantly", "F2", "infhealth"),
          t("one-hit", "One-Hit Takedowns", "Finish enemies instantly", "F3", "onehit", true),
        ],
      },
      {
        id: "movement",
        name: "Web-Swinging",
        icon: Move3d,
        cheats: [
          s("speed", "Swing Speed", "Faster than a train", 1, 10, 0.5, 1, "x", "speed"),
          t("infinite-web", "Infinite Web", "Web fluid never runs out", "F4"),
          t("super-jump", "Super Jump", "Leap skyscrapers in a bound", "F5", "jump"),
        ],
      },
      {
        id: "gadgets",
        name: "Gadgets",
        icon: Sparkles,
        cheats: [
          t("inf-gadgets", "Infinite Gadgets", "All gadgets never deplete", "F6"),
          t("inf-tokens", "Infinite Tokens", "Buy every suit & upgrade", "F7", "infmoney"),
          a("add-money", "Add 10,000 Tokens", "Instant token cache", "Ctrl+T", "addmoney"),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Timer,
        cheats: [
          t("freeze-time", "Freeze Time", "Stop crime timers", "F8", "freeze"),
          s("xp-mult", "XP Multiplier", "Max out skill trees fast", 1, 50, 1, 1, "x", "xp", true),
        ],
      },
    ],
  },
  {
    id: "diablo-iv",
    title: "Diablo IV",
    cover: "/games/v3/diablo-iv.jpg",
    genre: "ARPG",
    platforms: ["Battle.net", "Steam"],
    rating: 4.4,
    downloads: "2.0M",
    size: "90 GB",
    version: "2.4.0",
    updated: "3 days ago",
    players: "112K",
    icon: Swords,
    gradient: ["#450a0a", "#dc2626"],
    scene: { sky: ["#1a0b0b", "#7f1d1d"], ground: "#140808", accent: "#f87171", hero: Swords, enemy: Ghost },
    categories: [
      {
        id: "player",
        name: "Nephalem",
        icon: User,
        cheats: [
          t("god-mode", "God Mode", "Lilith can't hurt you", "F1", "god"),
          t("inf-health", "Infinite Health", "Potions are obsolete", "F2", "infhealth"),
          t("one-hit", "One-Hit Kills", "Delete demon hordes", "F3", "onehit", true),
        ],
      },
      {
        id: "loot",
        name: "Loot",
        icon: Coins,
        cheats: [
          t("inf-gold", "Infinite Gold", "Buy anything from vendors", "F4", "infmoney"),
          a("add-money", "Add 10,000 Gold", "Instant gold pile", "Ctrl+G", "addmoney"),
          t("mythic-drop", "Mythic Drop Rate", "Every enemy drops mythics", undefined, undefined, true),
        ],
      },
      {
        id: "combat",
        name: "Combat",
        icon: Crosshair,
        cheats: [
          t("no-cooldown", "No Cooldowns", "Spam ultimate skills", "F5"),
          t("inf-resources", "Infinite Resource", "Mana and fury never empties", "F6"),
          s("speed", "Frenzy Speed", "Attack and move faster", 1, 10, 0.5, 1, "x", "speed"),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Globe2,
        cheats: [
          t("freeze-time", "Freeze Time", "Stop the legions of hell", "F7", "freeze"),
          s("xp-mult", "XP Multiplier", "Paragon boards fill fast", 1, 50, 1, 1, "x", "xp", true),
        ],
      },
    ],
  },
  {
    id: "palworld",
    title: "Palworld",
    cover: "/games/v3/palworld.jpg",
    genre: "Survival",
    platforms: ["Steam", "Xbox"],
    rating: 4.5,
    downloads: "1.8M",
    size: "40 GB",
    version: "0.5.1",
    updated: "4 days ago",
    players: "87K",
    icon: Heart,
    gradient: ["#0e7490", "#67e8f9"],
    scene: { sky: ["#0c3444", "#3ec6d8"], ground: "#0f2a33", accent: "#67e8f9", hero: Heart, enemy: Ghost },
    categories: [
      {
        id: "player",
        name: "Survivor",
        icon: User,
        cheats: [
          t("god-mode", "God Mode", "Pals can't hurt you", "F1", "god"),
          t("inf-health", "Infinite Health", "HP always full", "F2", "infhealth"),
          t("one-hit", "One-Hit Kills", "One shot any Pal", "F3", "onehit", true),
        ],
      },
      {
        id: "resources",
        name: "Resources",
        icon: Coins,
        cheats: [
          t("inf-money", "Infinite Gold", "Shop without limits", "F4", "infmoney"),
          a("add-money", "Add 10,000 Gold", "Instant gold bag", "Ctrl+G", "addmoney"),
          t("inf-materials", "Infinite Materials", "Wood, stone and ingots forever", "F5"),
        ],
      },
      {
        id: "pals",
        name: "Pals",
        icon: Heart,
        cheats: [
          t("inf-stamina", "Infinite Pal Stamina", "Pals work forever", "F6"),
          t("instant-catch", "100% Catch Rate", "Every sphere captures", "F7"),
          s("speed", "Ride Speed", "Mounts race at light speed", 1, 10, 0.5, 1, "x", "speed"),
        ],
      },
      {
        id: "world",
        name: "World",
        icon: Timer,
        cheats: [
          t("freeze-time", "Freeze Time", "Always daytime", "F8", "freeze"),
          s("xp-mult", "XP Multiplier", "Level 50 in minutes", 1, 50, 1, 1, "x", "xp", true),
        ],
      },
    ],
  },
];

export const GENRES = ["All", ...Array.from(new Set(GAMES.map((g) => g.genre)))].sort((a, b) =>
  a === "All" ? -1 : a.localeCompare(b)
);

/** how many tiles show in the home "My Games" thumbnail row */
export const MY_GAMES_ROW_COUNT = 10;

/**
 * Wide banner art for horizontal containers (My Games row, hero carousel).
 * Lives next to the portrait cover: /games/v3/<id>.jpg -> /games/v3/<id>-wide.jpg
 * v3 = official Steam art (library_600x900 portrait + capsule_616x353 banner), resolved via storesearch API.
 */
export function bannerOf(game: Game): string | undefined {
  return game.cover ? game.cover.replace(/\.jpg$/, "-wide.jpg") : undefined;
}

/** portrait cover URL (art is versioned by path: /games/v3/ — bump the folder when art changes) */
export function coverOf(game: Game): string | undefined {
  return game.cover ?? undefined;
}

export const PLATFORMS = ["All", ...Array.from(new Set(GAMES.flatMap((g) => g.platforms)))];

export function getGame(id: string | null | undefined): Game | undefined {
  return GAMES.find((g) => g.id === id);
}

export function gameCheatCount(game: Game): number {
  return game.categories.reduce((n, c) => n + c.cheats.length, 0);
}

export const TOTAL_CHEATS = GAMES.reduce((n, g) => n + gameCheatCount(g), 0);
export const TOTAL_TRAINERS = GAMES.length;
