import { BaseModule } from "./BaseModule.js";

export class DashboardModule extends BaseModule {
  render(root) {
    const active = this.state.students.filter((s) => s.attending).length;
    const picked = this.state.students.filter((s) => s.pickup === "picked").length;
    const dropped = this.state.students.filter((s) => s.drop === "dropped").length;
    const due = this.state.students.reduce((sum, s) => sum + s.paymentDue, 0);
    const totalStudents = this.state.students.length;
    const activeRoutes = this.state.routes.filter((r) => r.status !== "inactive").length;
    const activeDrivers = this.state.drivers.filter((d) => d.status !== "off").length;

    root.innerHTML = `
      <section class="hero-banner">
        <div>
          <p class="soft">Control Center</p>
          <h2>Transport Overview Dashboard</h2>
          <p class="soft">Clean and organized operations with clear action blocks and live metrics.</p>
        </div>
        <div class="hero-badges">
          <span class="badge ok">${activeRoutes} Active Routes</span>
          <span class="badge warn">${activeDrivers} Active Drivers</span>
          <span class="badge ok">${totalStudents} Students</span>
        </div>
      </section>

      <div class="quick-grid">
        <article class="quick-card dark-blue">
          <h4>Morning Readiness</h4>
          <strong>${this.state.monthlyReport.attendanceRate}%</strong>
          <p class="soft">Attendance and route readiness status.</p>
        </article>
        <article class="quick-card light-blue">
          <h4>On-Time Pickups</h4>
          <strong>${this.state.monthlyReport.pickupOnTime}%</strong>
          <p class="soft">Current punctuality score for all routes.</p>
        </article>
        <article class="quick-card dark-blue">
          <h4>Payments Closed</h4>
          <strong>${this.state.monthlyReport.paymentCompletion}%</strong>
          <p class="soft">Monthly payment completion performance.</p>
        </article>
      </div>

      <div class="card-grid">
        <article class="stat-card blue-block"><p>Students attending today</p><strong>${active}</strong></article>
        <article class="stat-card light-block"><p>Picked up</p><strong>${picked}</strong></article>
        <article class="stat-card blue-block"><p>Dropped off</p><strong>${dropped}</strong></article>
        <article class="stat-card light-block"><p>Outstanding fee (LKR)</p><strong>${due.toLocaleString()}</strong></article>
      </div>

      <div class="btn-row quick-actions">
        <button type="button" class="btn primary" data-jump="tracking">Open Live Tracking</button>
        <button type="button" class="btn ghost" data-jump="reports">Open Reports</button>
        <button type="button" class="btn warn" data-jump="payments">Open Payments</button>
      </div>

      <div class="split">
        <div class="block blue-surface">
          <h3>Monthly Service Quality</h3>
          <div class="report-bars">
            ${this.renderBar("Attendance", this.state.monthlyReport.attendanceRate)}
            ${this.renderBar("On-Time Pickup", this.state.monthlyReport.pickupOnTime)}
            ${this.renderBar("Payment Completion", this.state.monthlyReport.paymentCompletion)}
          </div>
        </div>
        <div class="block sky-surface">
          <h3>Driver Status</h3>
          <ul>
            ${this.state.drivers.map((d) => `<li>${d.name} (${d.route}) - <span class="badge ${this.badgeFor(d.status)}">${d.status}</span></li>`).join("")}
          </ul>
        </div>
      </div>
    `;

    root.querySelectorAll("button[data-jump]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const jump = btn.dataset.jump;
        if (!jump) return;
        const navBtn = document.querySelector(`#moduleNav button[data-target="${jump}"]`);
        navBtn?.click();
      });
    });
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
