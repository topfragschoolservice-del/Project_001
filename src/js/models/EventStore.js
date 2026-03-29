export class EventStore {
  constructor() {
    this.items = [
      this.makeEvent("System initialized", "info"),
    ];
  }

  makeEvent(message, type = "info") {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return { id: crypto.randomUUID(), message, type, time };
  }

  push(message, type = "info") {
    this.items.unshift(this.makeEvent(message, type));
    this.items = this.items.slice(0, 18);
  }

  snapshot() {
    return this.items;
  }

  hydrate(items) {
    if (!Array.isArray(items)) return;
    this.items = items.slice(0, 18);
  }
}
