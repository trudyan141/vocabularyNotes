export type Preferences = {
  locale: "vi" | "en";
  childFriendly: boolean;
  level: "Beginner" | "Intermediate";
  reduceMotion: boolean;
  sound: boolean;
  profileName: string;
  profileAvatar: "google" | "fox" | "cat" | "dog";
};
export const defaultPreferences: Preferences = {
  locale: "vi",
  childFriendly: true,
  level: "Beginner",
  reduceMotion: false,
  sound: true,
  profileName: "",
  profileAvatar: "google",
};
export const preferencesKey = "wfk.preferences.v1";
export function readPreferences(raw: string | null): Preferences {
  if (!raw) return defaultPreferences;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return defaultPreferences;
    const p = data as Record<string, unknown>;
    // Whitelist small UI settings; secrets/content never cross this boundary.
    return {
      locale: p.locale === "en" ? "en" : "vi",
      childFriendly:
        typeof p.childFriendly === "boolean" ? p.childFriendly : true,
      level: p.level === "Intermediate" ? "Intermediate" : "Beginner",
      reduceMotion: p.reduceMotion === true,
      sound: p.sound !== false,
      profileName: typeof p.profileName === "string" ? p.profileName.trim().slice(0, 60) : "",
      profileAvatar: p.profileAvatar === "fox" || p.profileAvatar === "cat" || p.profileAvatar === "dog" ? p.profileAvatar : "google",
    };
  } catch {
    return defaultPreferences;
  }
}
