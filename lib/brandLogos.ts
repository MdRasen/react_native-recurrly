import { icons } from "@/constants/icons";
import type { ImageSourcePropType } from "react-native";

export interface BrandPreset {
  name: string;
  category: string;
  color: string;
  icon: ImageSourcePropType;
  domain?: string;
}

/**
 * High-quality bundled local icons mapped to keywords.
 */
const LOCAL_BRAND_MAP: Record<string, ImageSourcePropType> = {
  spotify: icons.spotify,
  netflix: icons.netflix,
  notion: icons.notion,
  figma: icons.figma,
  github: icons.github,
  adobe: icons.adobe,
  photoshop: icons.adobe,
  illustrator: icons.adobe,
  creativecloud: icons.adobe,
  openai: icons.openai,
  chatgpt: icons.openai,
  gpt: icons.openai,
  claude: icons.claude,
  anthropic: icons.claude,
  canva: icons.canva,
  dropbox: icons.dropbox,
  medium: icons.medium,
};

/**
 * Domain overrides for popular services where the domain is not just `name.com`.
 */
const KNOWN_DOMAINS: Record<string, { domain: string; category: string; color: string }> = {
  apple: { domain: "apple.com", category: "Entertainment", color: "#f5a623" },
  applemusic: { domain: "apple.com", category: "Music", color: "#f8b4b4" },
  appletv: { domain: "apple.com", category: "Entertainment", color: "#f5a623" },
  icloud: { domain: "apple.com", category: "Cloud", color: "#c3aed6" },
  youtube: { domain: "youtube.com", category: "Entertainment", color: "#f8b4b4" },
  youtubepremium: { domain: "youtube.com", category: "Entertainment", color: "#f8b4b4" },
  disney: { domain: "disneyplus.com", category: "Entertainment", color: "#a8d8ea" },
  disneyplus: { domain: "disneyplus.com", category: "Entertainment", color: "#a8d8ea" },
  prime: { domain: "amazon.com", category: "Entertainment", color: "#a8d8ea" },
  amazon: { domain: "amazon.com", category: "Entertainment", color: "#a8d8ea" },
  primevideo: { domain: "amazon.com", category: "Entertainment", color: "#a8d8ea" },
  aws: { domain: "aws.amazon.com", category: "Cloud", color: "#f5c542" },
  hbo: { domain: "max.com", category: "Entertainment", color: "#c3aed6" },
  hbomax: { domain: "max.com", category: "Entertainment", color: "#c3aed6" },
  max: { domain: "max.com", category: "Entertainment", color: "#c3aed6" },
  hulu: { domain: "hulu.com", category: "Entertainment", color: "#d5e8d4" },
  paramount: { domain: "paramountplus.com", category: "Entertainment", color: "#a8d8ea" },
  paramountplus: { domain: "paramountplus.com", category: "Entertainment", color: "#a8d8ea" },
  peacock: { domain: "peacocktv.com", category: "Entertainment", color: "#f5c542" },
  twitch: { domain: "twitch.tv", category: "Entertainment", color: "#c3aed6" },
  discord: { domain: "discord.com", category: "Entertainment", color: "#c3aed6" },
  nitro: { domain: "discord.com", category: "Entertainment", color: "#c3aed6" },
  slack: { domain: "slack.com", category: "Productivity", color: "#f5a623" },
  zoom: { domain: "zoom.us", category: "Productivity", color: "#a8d8ea" },
  linkedin: { domain: "linkedin.com", category: "Productivity", color: "#a8d8ea" },
  twitter: { domain: "x.com", category: "Entertainment", color: "#e8def8" },
  x: { domain: "x.com", category: "Entertainment", color: "#e8def8" },
  microsoft: { domain: "office.com", category: "Productivity", color: "#f5a623" },
  office365: { domain: "office.com", category: "Productivity", color: "#f5a623" },
  google: { domain: "google.com", category: "Cloud", color: "#a8d8ea" },
  googleone: { domain: "google.com", category: "Cloud", color: "#a8d8ea" },
  playstation: { domain: "playstation.com", category: "Entertainment", color: "#a8d8ea" },
  psplus: { domain: "playstation.com", category: "Entertainment", color: "#a8d8ea" },
  xbox: { domain: "xbox.com", category: "Entertainment", color: "#d5e8d4" },
  gamepass: { domain: "xbox.com", category: "Entertainment", color: "#d5e8d4" },
  nintendo: { domain: "nintendo.com", category: "Entertainment", color: "#f8b4b4" },
  steam: { domain: "steampowered.com", category: "Entertainment", color: "#c3aed6" },
  duolingo: { domain: "duolingo.com", category: "Productivity", color: "#d5e8d4" },
  strava: { domain: "strava.com", category: "Productivity", color: "#f5a623" },
  "1password": { domain: "1password.com", category: "Productivity", color: "#a8d8ea" },
  bitwarden: { domain: "bitwarden.com", category: "Productivity", color: "#a8d8ea" },
  midjourney: { domain: "midjourney.com", category: "AI Tools", color: "#b8d4e3" },
  linear: { domain: "linear.app", category: "Developer Tools", color: "#e8def8" },
  vercel: { domain: "vercel.com", category: "Developer Tools", color: "#e8def8" },
  heroku: { domain: "heroku.com", category: "Developer Tools", color: "#c3aed6" },
  crunchyroll: { domain: "crunchyroll.com", category: "Entertainment", color: "#f5a623" },
  audible: { domain: "audible.com", category: "Entertainment", color: "#f5a623" },
  deezer: { domain: "deezer.com", category: "Music", color: "#f8b4b4" },
  tidal: { domain: "tidal.com", category: "Music", color: "#c3aed6" },
  soundcloud: { domain: "soundcloud.com", category: "Music", color: "#f5a623" },
  nytimes: { domain: "nytimes.com", category: "Entertainment", color: "#e8def8" },
  grammarly: { domain: "grammarly.com", category: "Productivity", color: "#d5e8d4" },
};

/**
 * 1-tap quick brand presets for creating new subscriptions.
 */
export const POPULAR_BRAND_PRESETS: BrandPreset[] = [
  {
    name: "Netflix",
    category: "Entertainment",
    color: "#f8b4b4",
    icon: icons.netflix,
    domain: "netflix.com",
  },
  {
    name: "Spotify",
    category: "Music",
    color: "#d5e8d4",
    icon: icons.spotify,
    domain: "spotify.com",
  },
  {
    name: "ChatGPT",
    category: "AI Tools",
    color: "#b8d4e3",
    icon: icons.openai,
    domain: "openai.com",
  },
  {
    name: "Claude",
    category: "AI Tools",
    color: "#b8d4e3",
    icon: icons.claude,
    domain: "claude.ai",
  },
  {
    name: "YouTube Premium",
    category: "Entertainment",
    color: "#f8b4b4",
    icon: { uri: "https://www.google.com/s2/favicons?domain=youtube.com&sz=128" },
    domain: "youtube.com",
  },
  {
    name: "Disney+",
    category: "Entertainment",
    color: "#a8d8ea",
    icon: { uri: "https://www.google.com/s2/favicons?domain=disneyplus.com&sz=128" },
    domain: "disneyplus.com",
  },
  {
    name: "Amazon Prime",
    category: "Entertainment",
    color: "#a8d8ea",
    icon: { uri: "https://www.google.com/s2/favicons?domain=amazon.com&sz=128" },
    domain: "amazon.com",
  },
  {
    name: "GitHub Pro",
    category: "Developer Tools",
    color: "#e8def8",
    icon: icons.github,
    domain: "github.com",
  },
  {
    name: "Figma",
    category: "Design",
    color: "#f5c542",
    icon: icons.figma,
    domain: "figma.com",
  },
  {
    name: "Notion",
    category: "Productivity",
    color: "#a8d8ea",
    icon: icons.notion,
    domain: "notion.so",
  },
  {
    name: "Adobe Creative Cloud",
    category: "Design",
    color: "#f5c542",
    icon: icons.adobe,
    domain: "adobe.com",
  },
  {
    name: "Discord Nitro",
    category: "Entertainment",
    color: "#c3aed6",
    icon: { uri: "https://www.google.com/s2/favicons?domain=discord.com&sz=128" },
    domain: "discord.com",
  },
];

/**
 * Resolves a subscription name into:
 * 1. Bundled local PNG icon (if available)
 * 2. High-res Google Favicon CDN icon (128x128) based on domain matching
 * 3. Suggested category & category color
 */
export const resolveSubscriptionBrand = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) {
    return {
      icon: icons.wallet,
      isLocal: true,
      domain: undefined,
      suggestedCategory: undefined,
      suggestedColor: undefined,
    };
  }

  const normalized = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "");
  const firstWord = trimmed.toLowerCase().split(/\s+/)[0].replace(/[^a-z0-9]/g, "");

  // 1. Check local icons by exact or prefix match
  for (const key of Object.keys(LOCAL_BRAND_MAP)) {
    if (normalized === key || normalized.startsWith(key) || key.startsWith(firstWord)) {
      return {
        icon: LOCAL_BRAND_MAP[key],
        isLocal: true,
        domain: undefined,
        suggestedCategory:
          key === "spotify" ? "Music" :
          key === "netflix" ? "Entertainment" :
          key === "chatgpt" || key === "openai" || key === "claude" ? "AI Tools" :
          key === "github" ? "Developer Tools" :
          key === "adobe" || key === "figma" || key === "canva" ? "Design" :
          key === "notion" || key === "medium" || key === "dropbox" ? "Productivity" : "Other",
        suggestedColor:
          key === "spotify" ? "#d5e8d4" :
          key === "netflix" ? "#f8b4b4" :
          key === "chatgpt" || key === "openai" || key === "claude" ? "#b8d4e3" :
          key === "github" ? "#e8def8" :
          key === "adobe" || key === "figma" ? "#f5c542" : "#a8d8ea",
      };
    }
  }

  // 2. Check known domains
  for (const [key, meta] of Object.entries(KNOWN_DOMAINS)) {
    if (normalized === key || normalized.startsWith(key) || key.startsWith(firstWord)) {
      return {
        icon: { uri: `https://www.google.com/s2/favicons?domain=${meta.domain}&sz=128` },
        isLocal: false,
        domain: meta.domain,
        suggestedCategory: meta.category,
        suggestedColor: meta.color,
      };
    }
  }

  // 3. Fallback to generic domain using the first word or slug
  const fallbackDomain = `${firstWord || "service"}.com`;
  return {
    icon: { uri: `https://www.google.com/s2/favicons?domain=${fallbackDomain}&sz=128` },
    isLocal: false,
    domain: fallbackDomain,
    suggestedCategory: undefined,
    suggestedColor: undefined,
  };
};
