import { BaseModule } from "./BaseModule.js";

export class DashboardModule extends BaseModule {
  render(root) {
    const active = this.state.students.filter((s) => s.attending).length;
    const picked = this.state.students.filter((s) => s.pickup === "picked").length;
    const dropped = this.state.students.filter((s) => s.drop === "dropped").length;
    const due = this.state.students.reduce((sum, s) => sum + s.paymentDue, 0);

    root.innerHTML = `
      <h2>Overview Dashboard</h2>
      <p class="soft">High-level view for transport providers</p>
      <div class="card-grid">
        <article class="stat-card"><p>Students attending today</p><strong>${active}</strong></article>
        <article class="stat-card"><p>Picked up</p><strong>${picked}</strong></article>
        <article class="stat-card"><p>Dropped off</p><strong>${dropped}</strong></article>
        <article class="stat-card"><p>Outstanding fee (LKR)</p><strong>${due.toLocaleString()}</strong></article>
      </div>
      <div class="split">
        <div class="block">
          <h3>Monthly Service Quality</h3>
          <div class="report-bars">
            ${this.renderBar("Attendance", this.state.monthlyReport.attendanceRate)}
            ${this.renderBar("On-Time Pickup", this.state.monthlyReport.pickupOnTime)}
            ${this.renderBar("Payment Completion", this.state.monthlyReport.paymentCompletion)}
          </div>
        </div>
        <div class="block">
          <h3>Driver Status</h3>
          <ul>
            ${this.state.drivers.map((d) => `<li>${d.name} (${d.route}) - <span class="badge ${this.badgeFor(d.status)}">${d.status}</span></li>`).join("")}
          </ul>
        </div>
      </div>
    `;
  }

  renderBar(label, value) {
    return `
      <div class="bar" style="--w: ${value}%">
        <span></span>
        <label>${label} - ${value}%</label>
      </div>
    `;
  }
}
