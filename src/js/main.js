class EventStore {
  constructor() {
    this.items = [
      this.makeEvent("System initialized", "info"),
    ];
  }

  makeEvent(message, type = "info") {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return { id: crypto.randomUUID(), message, type, time };
  }

  push(message, type = "info") {
    this.items.unshift(this.makeEvent(message, type));
    this.items = this.items.slice(0, 18);
  }
}

class TransportState {
  constructor() {
    this.schoolName = "Greenfield International School";
    this.date = new Date();
    this.students = [
      { id: "S-101", name: "Nethmi Perera", route: "Route A", attending: true, returnTrip: true, pickup: "pending", drop: "pending", paymentDue: 8500 },
      { id: "S-102", name: "Sahan Jayasinghe", route: "Route B", attending: true, returnTrip: false, pickup: "pending", drop: "pending", paymentDue: 8500 },
      { id: "S-103", name: "Rivinu Fernando", route: "Route A", attending: false, returnTrip: false, pickup: "n/a", drop: "n/a", paymentDue: 0 },
      { id: "S-104", name: "Amaya Wickramasinghe", route: "Route C", attending: true, returnTrip: true, pickup: "pending", drop: "pending", paymentDue: 9000 },
    ];
    this.drivers = [
      { id: "D-01", name: "Kasun Silva", route: "Route A", status: "On time" },
      { id: "D-02", name: "Niroshan Gamage", route: "Route B", status: "Delayed 5 mins" },
      { id: "D-03", name: "Sampath Nadeeka", route: "Route C", status: "On time" },
    ];
    this.vehicleProgress = 26;
    this.monthlyReport = {
      attendanceRate: 93,
      pickupOnTime: 89,
      paymentCompletion: 84,
    };
  }

  markAttendance(studentId, attending, returnTrip) {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return null;
    student.attending = attending;
    student.returnTrip = returnTrip;
    if (!attending) {
      student.pickup = "n/a";
      student.drop = "n/a";
    }
    return student;
  }

  markPickup(studentId, status) {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return null;
    student.pickup = status;
    return student;
  }

  markDropoff(studentId, status) {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return null;
    student.drop = status;
    return student;
  }

  completePayment(studentId) {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return null;
    student.paymentDue = 0;
    return student;
  }

  simulateProgress() {
    this.vehicleProgress = Math.min(100, this.vehicleProgress + Math.floor(Math.random() * 22 + 8));
    if (this.vehicleProgress >= 100) {
      this.vehicleProgress = 0;
    }
  }
}

class BaseModule {
  constructor(state, events) {
    this.state = state;
    this.events = events;
  }

  badgeFor(status) {
    if (status === "picked" || status === "dropped" || status === "paid" || status === "On time") return "ok";
    if (status === "pending" || status.includes("Delayed")) return "warn";
    return "danger";
  }
}

class DashboardModule extends BaseModule {
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

class ParentModule extends BaseModule {
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
      app.renderAll();
    });
  }

  studentOptions() {
    return this.state.students.map((s) => `<option value="${s.id}">${s.name} (${s.id})</option>`).join("");
  }
}

class DriverModule extends BaseModule {
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

    root.querySelector("#moveForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const studentId = root.querySelector("#moveStudent").value;
      const moveType = root.querySelector("#moveType").value;
      const student = moveType === "pickup" ? this.state.markPickup(studentId, "picked") : this.state.markDropoff(studentId, "dropped");
      if (!student) return;
      this.events.push(`${student.name} ${moveType === "pickup" ? "picked up" : "dropped off"}`, "info");
      app.renderAll();
    });
  }

  studentOptions() {
    return this.state.students
      .filter((s) => s.attending)
      .map((s) => `<option value="${s.id}">${s.name} (${s.route})</option>`)
      .join("");
  }
}

class TrackingModule extends BaseModule {
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
      this.events.push(`Vehicle progress updated to ${this.state.vehicleProgress}%`, "info");
      app.renderAll();
    });
  }
}

class AdminModule extends BaseModule {
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

    root.querySelector("#btnLateWarn").addEventListener("click", () => {
      this.events.push("Delay alert sent to affected parents", "warn");
      app.renderAll();
    });

    root.querySelector("#btnDailyReport").addEventListener("click", () => {
      this.events.push("Daily transport report generated", "info");
      app.renderAll();
    });
  }
}

class PaymentsModule extends BaseModule {
  render(root) {
    root.innerHTML = `
      <h2>Secure Payments</h2>
      <p class="soft">Parents can pay online and receive receipts</p>
      <div class="split">
        <div class="block">
          <h3>Outstanding Fees</h3>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Student</th><th>Due (LKR)</th><th>Status</th></tr>
              </thead>
              <tbody>
                ${this.state.students.map((s) => `
                  <tr>
                    <td>${s.name}</td>
                    <td>${s.paymentDue.toLocaleString()}</td>
                    <td><span class="badge ${s.paymentDue === 0 ? "ok" : "warn"}">${s.paymentDue === 0 ? "paid" : "pending"}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
        <div class="block">
          <h3>Mock Online Payment</h3>
          <form id="payForm">
            <div>
              <label for="payStudent">Student</label>
              <select id="payStudent">${this.state.students.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}</select>
            </div>
            <div>
              <label for="payMethod">Payment Method</label>
              <select id="payMethod">
                <option>Card</option>
                <option>Bank Transfer</option>
                <option>Mobile Wallet</option>
              </select>
            </div>
            <button class="btn primary" type="submit">Complete Payment</button>
          </form>
        </div>
      </div>
    `;

    root.querySelector("#payForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const studentId = root.querySelector("#payStudent").value;
      const student = this.state.completePayment(studentId);
      if (!student) return;
      this.events.push(`Payment received for ${student.name}`, "info");
      app.renderAll();
    });
  }
}

class Application {
  constructor() {
    this.state = new TransportState();
    this.events = new EventStore();
    this.modules = {
      dashboard: new DashboardModule(this.state, this.events),
      parent: new ParentModule(this.state, this.events),
      driver: new DriverModule(this.state, this.events),
      tracking: new TrackingModule(this.state, this.events),
      admin: new AdminModule(this.state, this.events),
      payments: new PaymentsModule(this.state, this.events),
    };
    this.activeModule = "dashboard";
    this.navConfig = [
      { id: "dashboard", label: "Overview" },
      { id: "parent", label: "Parent Portal" },
      { id: "driver", label: "Driver Panel" },
      { id: "tracking", label: "Live Tracking" },
      { id: "admin", label: "Admin Dashboard" },
      { id: "payments", label: "Payments" },
    ];
  }

  mount() {
    this.setupNav();
    this.setupGlobalActions();
    this.renderAll();
  }

  setupNav() {
    const nav = document.querySelector("#moduleNav");
    nav.innerHTML = this.navConfig
      .map((item) => `<button data-target="${item.id}">${item.label}</button>`)
      .join("");

    nav.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-target]");
      if (!btn) return;
      this.activeModule = btn.dataset.target;
      this.renderAll();
    });
  }

  setupGlobalActions() {
    const todayDate = document.querySelector("#todayDate");
    todayDate.textContent = this.state.date.toDateString();

    document.querySelector("#btnSimulateDay").addEventListener("click", () => {
      this.state.students.forEach((s) => {
        if (!s.attending) return;
        s.pickup = Math.random() > 0.12 ? "picked" : "pending";
        s.drop = s.returnTrip ? (Math.random() > 0.22 ? "dropped" : "pending") : "n/a";
      });
      this.events.push("Simulation executed for pickup and drop-off flow", "info");
      this.renderAll();
    });
  }

  renderAll() {
    this.renderNavState();
    this.renderModules();
    this.renderEvents();
  }

  renderNavState() {
    document.querySelectorAll("#moduleNav button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.target === this.activeModule);
    });

    document.querySelectorAll(".module").forEach((module) => {
      module.classList.toggle("active", module.dataset.module === this.activeModule);
    });
  }

  renderModules() {
    Object.entries(this.modules).forEach(([id, instance]) => {
      const root = document.querySelector(`#${id}`);
      instance.render(root);
    });
  }

  renderEvents() {
    const feed = document.querySelector("#eventFeed");
    feed.innerHTML = this.events.items
      .map((e) => `<li><strong>${e.message}</strong><br /><small>${e.time}</small></li>`)
      .join("");
  }
}

const app = new Application();
app.mount();
