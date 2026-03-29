export class BaseModule {
  constructor(state, events, onChange) {
    this.state = state;
    this.events = events;
    this.onChange = onChange;
  }

  badgeFor(status) {
    if (status === "picked" || status === "dropped" || status === "paid" || status === "On time") return "ok";
    if (status === "pending" || status.includes("Delayed")) return "warn";
    return "danger";
  }
}
