import { BaseModule } from "./BaseModule.js";

export class ReportsModule extends BaseModule {
  render(root) {
    const metrics = this.buildMetrics();

    root.innerHTML = `
      <h2>Attendance & Monthly Reports</h2>
      <p class="soft">Track attendance history and service quality trends</p>

      <div class="card-grid">
        <article class="stat-card"><p>Attendance Rate</p><strong>${metrics.attendanceRate}%</strong></article>
        <article class="stat-card"><p>Pickup On-Time</p><strong>${metrics.pickupOnTime}%</strong></article>
        <article class="stat-card"><p>Payment Completion</p><strong>${metrics.paymentCompletion}%</strong></article>
        <article class="stat-card"><p>Total History Entries</p><strong>${this.state.history.length}</strong></article>
      </div>

      <div class="block" style="margin-top: 1rem;">
        <h3>Recent Attendance and Transport History</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Time</th><th>Type</th><th>Student</th><th>Details</th></tr>
            </thead>
            <tbody>
              ${this.renderHistoryRows()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  buildMetrics() {
    const totalStudents = this.state.students.length || 1;
    const attendanceRate = Math.round((this.state.students.filter((s) => s.attending).length / totalStudents) * 100);

    const pickupEvents = this.state.history.filter((h) => h.type === "pickup");
    const onTimePicked = pickupEvents.filter((h) => h.details.includes("picked")).length;
    const pickupOnTime = pickupEvents.length === 0 ? this.state.monthlyReport.pickupOnTime : Math.round((onTimePicked / pickupEvents.length) * 100);

    const payableStudents = this.state.students.filter((s) => s.paymentDue >= 0).length || 1;
    const paidStudents = this.state.students.filter((s) => s.paymentDue === 0).length;
    const paymentCompletion = Math.round((paidStudents / payableStudents) * 100);

    return {
      attendanceRate,
      pickupOnTime,
      paymentCompletion,
    };
  }

  renderHistoryRows() {
    if (this.state.history.length === 0) {
      return "<tr><td colspan=\"4\">No history recorded yet.</td></tr>";
    }

    return this.state.history.slice(0, 24).map((entry) => {
      const stamp = new Date(entry.createdAt).toLocaleString();
      return `<tr><td>${stamp}</td><td>${entry.type}</td><td>${entry.student}</td><td>${entry.details}</td></tr>`;
    }).join("");
  }
}
