import { BaseModule } from "./BaseModule.js";

export class AdminModule extends BaseModule {
  render(root) {
    root.innerHTML = `
      <h2>Admin Dashboard</h2>
      <p class="soft">Manage routes, students, drivers, and operations</p>
      <div class="split">
        <div class="block">
          <h3>Students & Routes</h3>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Route</th><th>Attend</th></tr>
              </thead>
              <tbody>
                ${this.state.students.map((s) => `
                  <tr>
                    <td>${s.id}</td>
                    <td>${s.name}</td>
                    <td>${s.route}</td>
                    <td><span class="badge ${s.attending ? "ok" : "danger"}">${s.attending ? "Yes" : "No"}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
        <div class="block">
          <h3>Driver Operations</h3>
          <ul>
            ${this.state.drivers.map((d) => `<li>${d.id} - ${d.name}, ${d.route}, <span class="badge ${this.badgeFor(d.status)}">${d.status}</span></li>`).join("")}
          </ul>
          <div class="btn-row" style="margin-top: 0.8rem;">
            <button id="btnLateWarn" class="btn warn">Send Delay Alert</button>
            <button id="btnDailyReport" class="btn ghost">Generate Daily Summary</button>
          </div>
        </div>
      </div>
    `;

    root.querySelector("#btnLateWarn").addEventListener("click", async () => {
      await this.transportService.sendDelayAlert();
      this.onChange();
    });

    root.querySelector("#btnDailyReport").addEventListener("click", async () => {
      await this.transportService.generateDailySummary();
      this.onChange();
    });
  }
}
