import { BaseModule } from "./BaseModule.js";

export class AdminModule extends BaseModule {
  render(root) {
    root.innerHTML = `
      <h2>Admin Dashboard</h2>
      <p class="soft">Manage routes, students, drivers, and operations</p>
      <div class="split">
        <div class="block">
          <h3>Students</h3>
          <form id="studentForm">
            <div>
              <label for="studentName">Student Name</label>
              <input id="studentName" type="text" placeholder="New student" required />
            </div>
            <div>
              <label for="studentRoute">Route</label>
              <select id="studentRoute">${this.routeOptions()}</select>
            </div>
            <div>
              <label for="studentDue">Payment Due (LKR)</label>
              <input id="studentDue" type="number" min="0" value="8500" />
            </div>
            <button type="submit" class="btn primary">Add Student</button>
          </form>

          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Route</th><th>Attend</th><th>Action</th></tr>
              </thead>
              <tbody>
                ${this.state.students.map((s) => `
                  <tr>
                    <td>${s.id}</td>
                    <td>${s.name}</td>
                    <td>
                      <select data-student-route="${s.id}">${this.routeOptions(s.route)}</select>
                    </td>
                    <td><span class="badge ${s.attending ? "ok" : "danger"}">${s.attending ? "Yes" : "No"}</span></td>
                    <td><button type="button" class="btn warn" data-delete-student="${s.id}">Remove</button></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
        <div class="block">
          <h3>Drivers</h3>
          <form id="driverForm">
            <div>
              <label for="driverName">Driver Name</label>
              <input id="driverName" type="text" placeholder="New driver" required />
            </div>
            <div>
              <label for="driverStatus">Status</label>
              <select id="driverStatus">
                <option>On time</option>
                <option>Delayed 5 mins</option>
                <option>Unavailable</option>
              </select>
            </div>
            <button type="submit" class="btn primary">Add Driver</button>
          </form>

          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Route</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                ${this.state.drivers.map((d) => `
                  <tr>
                    <td>${d.id}</td>
                    <td>${d.name}</td>
                    <td>${d.route}</td>
                    <td>
                      <select data-driver-status="${d.id}">
                        ${this.driverStatusOptions(d.status)}
                      </select>
                    </td>
                    <td><button type="button" class="btn warn" data-delete-driver="${d.id}">Remove</button></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <div class="btn-row" style="margin-top: 0.8rem;">
            <button id="btnLateWarn" class="btn warn">Send Delay Alert</button>
            <button id="btnDailyReport" class="btn ghost">Generate Daily Summary</button>
          </div>
        </div>
      </div>
    `;

    root.querySelector("#studentForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        name: root.querySelector("#studentName").value.trim(),
        route: root.querySelector("#studentRoute").value || "Unassigned",
        paymentDue: Number(root.querySelector("#studentDue").value || 0),
      };
      const student = await this.transportService.createStudent(payload);
      if (!student) return;
      root.querySelector("#studentForm").reset();
      root.querySelector("#studentDue").value = 8500;
      this.onChange();
    });

    root.querySelectorAll("[data-student-route]").forEach((select) => {
      select.addEventListener("change", async (e) => {
        const studentId = e.target.dataset.studentRoute;
        const route = e.target.value;
        if (!studentId) return;
        await this.transportService.updateStudentRoute(studentId, route);
        this.onChange();
      });
    });

    root.querySelectorAll("[data-delete-student]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const studentId = e.target.dataset.deleteStudent;
        if (!studentId) return;
        const confirmed = confirm("Remove this student from the transport system?");
        if (!confirmed) return;
        await this.transportService.deleteStudent(studentId);
        this.onChange();
      });
    });

    root.querySelector("#driverForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        name: root.querySelector("#driverName").value.trim(),
        status: root.querySelector("#driverStatus").value,
      };
      const driver = await this.transportService.createDriver(payload);
      if (!driver) return;
      root.querySelector("#driverForm").reset();
      this.onChange();
    });

    root.querySelectorAll("[data-driver-status]").forEach((select) => {
      select.addEventListener("change", async (e) => {
        const driverId = e.target.dataset.driverStatus;
        const status = e.target.value;
        if (!driverId) return;
        await this.transportService.updateDriverStatus(driverId, status);
        this.onChange();
      });
    });

    root.querySelectorAll("[data-delete-driver]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const driverId = e.target.dataset.deleteDriver;
        if (!driverId) return;
        const confirmed = confirm("Remove this driver from active records?");
        if (!confirmed) return;
        await this.transportService.deleteDriver(driverId);
        this.onChange();
      });
    });

    root.querySelector("#btnLateWarn").addEventListener("click", async () => {
      await this.transportService.sendDelayAlert();
      this.onChange();
    });

    root.querySelector("#btnDailyReport").addEventListener("click", async () => {
      await this.transportService.generateDailySummary();
      this.onChange();
    });
  }

  routeOptions(selectedName = "") {
    const routeNames = this.state.routes.map((route) => route.name);
    const all = ["Unassigned", ...routeNames];
    return all.map((name) => `<option value="${name}" ${name === selectedName ? "selected" : ""}>${name}</option>`).join("");
  }

  driverStatusOptions(selected = "On time") {
    const statuses = ["On time", "Delayed 5 mins", "Unavailable"];
    return statuses.map((status) => `<option value="${status}" ${status === selected ? "selected" : ""}>${status}</option>`).join("");
  }
}
