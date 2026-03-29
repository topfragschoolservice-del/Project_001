export class BaseModule {
  constructor(state, events, onChange, transportService) {
    this.state = state;
    this.events = events;
    this.onChange = onChange;
    this.transportService = transportService;
  }

  badgeFor(status) {
    if (status === "picked" || status === "dropped" || status === "paid" || status === "On time") return "ok";
    if (status === "pending" || status.includes("Delayed")) return "warn";
    return "danger";
  }
}
