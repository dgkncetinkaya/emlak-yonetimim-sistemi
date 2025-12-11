// LocalStorage helper functions

/**
 * Get data from localStorage and parse as JSON
 * @param key - localStorage key
 * @param defaultValue - default value if key doesn't exist
 * @returns parsed data or default value
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Save data to localStorage as JSON string
 * @param key - localStorage key
 * @param value - data to save
 */
export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
  }
}

/**
 * Remove item from localStorage
 * @param key - localStorage key
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
  }
}

/**
 * Clear all localStorage data
 */
export function clearStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Check if localStorage is available
 * @returns true if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Storage keys constants
export const STORAGE_KEYS = {
  YG_TEMPLATES: 'ygTemplates',
  DOC_ARCHIVE: 'docArchive',
  CURRENT_USER: 'currentUser'
} as const;

// Export individual constants for easier importing
export const YG_TEMPLATES = STORAGE_KEYS.YG_TEMPLATES;
export const DOC_ARCHIVE = STORAGE_KEYS.DOC_ARCHIVE;
export const CURRENT_USER = STORAGE_KEYS.CURRENT_USER;