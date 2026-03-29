import { EventStore } from "./models/EventStore.js";
import { TransportState } from "./models/TransportState.js";
import { DashboardModule } from "./modules/DashboardModule.js";
import { ParentModule } from "./modules/ParentModule.js";
import { DriverModule } from "./modules/DriverModule.js";
import { TrackingModule } from "./modules/TrackingModule.js";
import { AdminModule } from "./modules/AdminModule.js";
import { PaymentsModule } from "./modules/PaymentsModule.js";

export class Application {
  constructor() {
    this.state = new TransportState();
    this.events = new EventStore();
    this.modules = {
      dashboard: new DashboardModule(this.state, this.events, this.renderAll.bind(this)),
      parent: new ParentModule(this.state, this.events, this.renderAll.bind(this)),
      driver: new DriverModule(this.state, this.events, this.renderAll.bind(this)),
      tracking: new TrackingModule(this.state, this.events, this.renderAll.bind(this)),
      admin: new AdminModule(this.state, this.events, this.renderAll.bind(this)),
      payments: new PaymentsModule(this.state, this.events, this.renderAll.bind(this)),
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
