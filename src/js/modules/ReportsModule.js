import { BaseModule } from "./BaseModule.js";
import { ReportExportService } from "../services/ReportExportService.js";

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
        <h3>Monthly Export</h3>
        <div class="btn-row report-actions">
          <div>
            <label for="reportMonth">Month</label>
            <input id="reportMonth" type="month" value="${this.currentMonthValue()}" />
          </div>
          <button id="btnExportCsv" class="btn primary" type="button">Export CSV Report</button>
        </div>
      </div>

      <div class="block" style="margin-top: 1rem;">
        <h3>Route-wise Export</h3>
        <div class="btn-row report-actions">
          <div>
            <label for="reportRoute">Route</label>
            <select id="reportRoute">${this.routeOptions()}</select>
          </div>
          <button id="btnExportRouteCsv" class="btn ghost" type="button">Export Route CSV</button>
        </div>
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

    root.querySelector("#btnExportCsv").addEventListener("click", () => {
      const period = root.querySelector("#reportMonth").value || this.currentMonthValue();
      const rows = ReportExportService.buildMonthlyReportRows({
        period,
        metrics,
        students: this.state.students,
        history: this.state.history.slice(0, 80),
      });
      const csv = ReportExportService.toCsv(rows);
      ReportExportService.downloadCsv(`transport-report-${period}.csv`, csv);
      this.events.push(`Monthly report exported for ${period}`, "info", "system");
      this.onChange();
    });

    root.querySelector("#btnExportRouteCsv").addEventListener("click", () => {
      const period = root.querySelector("#reportMonth").value || this.currentMonthValue();
      const routeId = root.querySelector("#reportRoute").value;
      const route = this.state.routes.find((r) => r.id === routeId);
      if (!route) {
        this.events.push("Please select a route before export", "warn", "system");
        this.onChange();
        return;
      }

      const routeStudents = this.state.students.filter((s) => s.route === route.name);
      const routeStudentNames = new Set(routeStudents.map((s) => s.name));
      const routeHistory = this.state.history
        .filter((h) => routeStudentNames.has(h.student))
        .slice(0, 120);

      const rows = ReportExportService.buildRouteReportRows({
        period,
        route,
        students: routeStudents,
        history: routeHistory,
      });
      const csv = ReportExportService.toCsv(rows);
      const safeRoute = route.name.toLowerCase().replace(/\s+/g, "-");
      ReportExportService.downloadCsv(`route-report-${safeRoute}-${period}.csv`, csv);
      this.events.push(`Route report exported: ${route.name}`, "info", "system");
      this.onChange();
    });
  }

  currentMonthValue() {
    return this.state.date.toISOString().slice(0, 7);
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

  routeOptions() {
    if (!this.state.routes || this.state.routes.length === 0) {
      return "<option value=\"\">No routes</option>";
    }

    return this.state.routes.map((route) => `<option value="${route.id}">${route.name}</option>`).join("");
  }
}
