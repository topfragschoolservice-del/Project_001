import { BaseModule } from "./BaseModule.js";

export class ParentModule extends BaseModule {
  render(root) {
    root.innerHTML = `
      <h2>Parent Portal</h2>
      <p class="soft">Mark attendance and return trip preferences</p>
      <div class="split">
        <div class="block">
          <h3>Mark Daily Attendance</h3>
          <form id="attendanceForm">
            <div>
              <label for="attStudent">Student</label>
              <select id="attStudent">${this.studentOptions()}</select>
            </div>
            <div>
              <label for="attending">Will attend school?</label>
              <select id="attending">
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label for="returnTrip">Need return transport?</label>
              <select id="returnTrip">
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <button class="btn primary" type="submit">Save Attendance</button>
          </form>
        </div>
        <div class="block">
          <h3>Today Summary</h3>
          <ul>
            ${this.state.students.map((s) => `
              <li>
                ${s.name} - attend: <span class="badge ${s.attending ? "ok" : "danger"}">${s.attending ? "Yes" : "No"}</span>
                return: <span class="badge ${s.returnTrip ? "ok" : "warn"}">${s.returnTrip ? "Yes" : "No"}</span>
              </li>
            `).join("")}
          </ul>
        </div>
      </div>
    `;

    root.querySelector("#attendanceForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const studentId = root.querySelector("#attStudent").value;
      const attending = root.querySelector("#attending").value === "yes";
      const returnTrip = root.querySelector("#returnTrip").value === "yes";
      const student = this.state.markAttendance(studentId, attending, returnTrip);
      if (!student) return;
      this.events.push(`${student.name} attendance updated by parent`, attending ? "info" : "warn");
      this.onChange();
    });
  }

  studentOptions() {
    return this.state.students.map((s) => `<option value="${s.id}">${s.name} (${s.id})</option>`).join("");
  }
}
