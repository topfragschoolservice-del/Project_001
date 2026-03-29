import { BaseModule } from "./BaseModule.js";

export class DriverModule extends BaseModule {
  render(root) {
    root.innerHTML = `
      <h2>Driver Panel</h2>
      <p class="soft">Real-time pickup and drop-off marking</p>
      <div class="split">
        <div class="block">
          <h3>Update Student Movement</h3>
          <form id="moveForm">
            <div>
              <label for="moveStudent">Student</label>
              <select id="moveStudent">${this.studentOptions()}</select>
            </div>
            <div>
              <label for="moveType">Action</label>
              <select id="moveType">
                <option value="pickup">Mark Pickup</option>
                <option value="dropoff">Mark Drop-off</option>
              </select>
            </div>
            <button class="btn primary" type="submit">Update Status</button>
          </form>
        </div>
        <div class="block">
          <h3>Live Student Status</h3>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Student</th><th>Pickup</th><th>Drop</th></tr>
              </thead>
              <tbody>
                ${this.state.students.map((s) => `
                  <tr>
                    <td>${s.name}</td>
                    <td><span class="badge ${this.badgeFor(s.pickup)}">${s.pickup}</span></td>
                    <td><span class="badge ${this.badgeFor(s.drop)}">${s.drop}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    root.querySelector("#moveForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const studentId = root.querySelector("#moveStudent").value;
      const moveType = root.querySelector("#moveType").value;
      const student = await this.transportService.markStudentMovement(studentId, moveType);
      if (!student) return;
      this.onChange();
    });
  }

  studentOptions() {
    return this.state.students
      .filter((s) => s.attending)
      .map((s) => `<option value="${s.id}">${s.name} (${s.route})</option>`)
      .join("");
  }
}
