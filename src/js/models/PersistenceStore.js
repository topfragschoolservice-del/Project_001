export class PersistenceStore {
  constructor(storageKey = "smart-transport-state-v1") {
    this.storageKey = storageKey;
  }

  save(payload) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch {
      return false;
    }
  }
}
