import { NativeModules, Platform } from "react-native";

const DEFAULT_API_URL = "http://127.0.0.1:3000/api";
const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function resolveMetroHost(): string | null {
  const scriptURL = NativeModules?.SourceCode?.scriptURL;

  if (!scriptURL) {
    return null;
  }

  try {
    const parsed = new URL(scriptURL);
    const host = parsed.hostname;

    if (!host || LOCALHOST_HOSTS.has(host)) {
      return null;
    }

    return host;
  } catch {
    return null;
  }
}

function resolveApiUrl(): string {
  const configured = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL).trim();

  try {
    const parsed = new URL(configured);

    // Keep explicit non-localhost URLs as-is.
    if (!LOCALHOST_HOSTS.has(parsed.hostname)) {
      return stripTrailingSlash(parsed.toString());
    }

    // Web localhost should continue to target browser-local backend.
    if (Platform.OS === "web") {
      return stripTrailingSlash(parsed.toString());
    }

    // On emulators/real devices, prefer Metro host to reach the dev machine.
    const metroHost = resolveMetroHost();
    if (metroHost) {
      parsed.hostname = metroHost;
    } else if (Platform.OS === "android") {
      // Android emulator localhost fallback
      parsed.hostname = "10.0.2.2";
    } else {
      // Avoid localhost -> ::1 resolution ambiguity in local environments.
      parsed.hostname = "127.0.0.1";
    }

    return stripTrailingSlash(parsed.toString());
  } catch {
    return stripTrailingSlash(configured);
  }
}

export const API_URL = resolveApiUrl();

export const QUERY_CACHE_KEY = "gym-mobile-query-cache";
export const OFFLINE_QUEUE_KEY = "gym-mobile-offline-queue";
