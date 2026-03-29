export class EventStore {
  constructor() {
    this.items = [
      this.makeEvent("System initialized", "info", "system"),
    ];
  }

  makeEvent(message, type = "info", category = "system") {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return { id: crypto.randomUUID(), message, type, category, time };
  }

  push(message, type = "info", category = "system") {
    this.items.unshift(this.makeEvent(message, type, category));
    this.items = this.items.slice(0, 18);
  }

  snapshot() {
    return this.items;
  }

  hydrate(items) {
    if (!Array.isArray(items)) return;
    this.items = items.slice(0, 18).map((item) => ({
      ...item,
      category: item.category || "system",
    }));
  }
}
