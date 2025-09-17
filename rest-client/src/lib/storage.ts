export function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getItem<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Failed to remove ${key} from localStorage`, err);
  }
}

export function encodeBase64(input: string): string {
  return btoa(unescape(encodeURIComponent(input)));
}

export function decodeBase64(input: string): string {
  return decodeURIComponent(escape(atob(input)));
}
