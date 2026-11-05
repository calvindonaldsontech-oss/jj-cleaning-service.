const STORAGE_KEY = 'jj-cleaning-settings';

const DEFAULT_BOUNCE_EMAIL = 'jjcleaningservice3@gmail.com';

export interface EmailSettings {
  fromName: string;
  replyToEmail: string;
  bounceEmail: string;
}

export interface SystemSettings {
  apiToken: string;
  email: EmailSettings;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  apiToken: '',
  email: {
    fromName: 'JJ Cleaning Services LLC',
    replyToEmail: 'jjcleaningservice3@gmail.com',
    bounceEmail: DEFAULT_BOUNCE_EMAIL,
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseSettings(data: unknown): SystemSettings {
  const fallback = DEFAULT_SETTINGS;
  if (!isRecord(data)) return fallback;
  const emailRaw = data.email;
  const email: EmailSettings = isRecord(emailRaw)
    ? {
        fromName: typeof emailRaw.fromName === 'string' && emailRaw.fromName.trim() ? emailRaw.fromName : fallback.email.fromName,
        replyToEmail: typeof emailRaw.replyToEmail === 'string' ? emailRaw.replyToEmail : fallback.email.replyToEmail,
        bounceEmail: typeof emailRaw.bounceEmail === 'string' ? emailRaw.bounceEmail : fallback.email.bounceEmail,
      }
    : fallback.email;
  return {
    apiToken: typeof data.apiToken === 'string' ? data.apiToken : '',
    email,
  };
}

export function loadSettings(): SystemSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return parseSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SystemSettings): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
