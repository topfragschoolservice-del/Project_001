import { BaseModule } from "./BaseModule.js";

export class TrackingModule extends BaseModule {
  render(root) {
    root.innerHTML = `
      <h2>Live Vehicle Tracking</h2>
      <p class="soft">Vehicle progress, route health, and alerts</p>
      <div class="split">
        <div class="block">
          <h3>Route A - Morning Trip</h3>
          <div class="route-line">
            <div class="bus" style="left: calc(${this.state.vehicleProgress}% - 50px)">BUS A1</div>
          </div>
          <p class="soft">Progress: ${this.state.vehicleProgress}%</p>
          <button id="btnAdvance" class="btn ghost">Advance Location</button>
        </div>
        <div class="block">
          <h3>Auto Alerts</h3>
          <ul>
            <li>Pickup confirmations are pushed to parents</li>
            <li>Drop-off confirmations are recorded instantly</li>
            <li>Late routes trigger delay notifications</li>
          </ul>
        </div>
      </div>
    `;

    root.querySelector("#btnAdvance").addEventListener("click", () => {
      this.state.simulateProgress();
      this.events.push(`Vehicle progress updated to ${this.state.vehicleProgress}%`, "info", "tracking");
      this.onChange();
    });
  }
}
