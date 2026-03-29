import { EventStore } from "./models/EventStore.js";
import { TransportState } from "./models/TransportState.js";
import { AuthSession } from "./models/AuthSession.js";
import { PersistenceStore } from "./models/PersistenceStore.js";
import { MockTransportApi } from "./services/MockTransportApi.js";
import { TransportService } from "./services/TransportService.js";
import { MockAuthApi } from "./services/MockAuthApi.js";
import { AuthService } from "./services/AuthService.js";
import { DashboardModule } from "./modules/DashboardModule.js";
import { ParentModule } from "./modules/ParentModule.js";
import { DriverModule } from "./modules/DriverModule.js";
import { TrackingModule } from "./modules/TrackingModule.js";
import { ReportsModule } from "./modules/ReportsModule.js";
import { AdminModule } from "./modules/AdminModule.js";
import { PaymentsModule } from "./modules/PaymentsModule.js";

export class Application {
  constructor() {
    this.state = new TransportState();
    this.events = new EventStore();
    this.auth = new AuthSession();
    this.persistence = new PersistenceStore();
    this.mockApi = new MockTransportApi(this.state);
    this.transportService = new TransportService(this.mockApi, this.events);
    this.mockAuthApi = new MockAuthApi();
    this.authService = new AuthService(this.mockAuthApi, this.events);
    this.modules = {
      dashboard: new DashboardModule(this.state, this.events, this.renderAll.bind(this), this.transportService),
      parent: new ParentModule(this.state, this.events, this.renderAll.bind(this), this.transportService),
      driver: new DriverModule(this.state, this.events, this.renderAll.bind(this), this.transportService),
      tracking: new TrackingModule(this.state, this.events, this.renderAll.bind(this), this.transportService),
      reports: new ReportsModule(this.state, this.events, this.renderAll.bind(this), this.transportService),
      admin: new AdminModule(this.state, this.events, this.renderAll.bind(this), this.transportService),
      payments: new PaymentsModule(this.state, this.events, this.renderAll.bind(this), this.transportService),
    };
    this.activeModule = "dashboard";
    this.activeEventFilter = "all";
    this.navConfig = [
      { id: "dashboard", label: "Overview" },
      { id: "parent", label: "Parent Portal" },
      { id: "driver", label: "Driver Panel" },
      { id: "tracking", label: "Live Tracking" },
      { id: "reports", label: "Reports" },
      { id: "admin", label: "Admin Dashboard" },
      { id: "payments", label: "Payments" },
    ];
    this.eventFilters = [
      { id: "all", label: "All" },
      { id: "attendance", label: "Attendance" },
      { id: "pickup", label: "Pickup" },
      { id: "dropoff", label: "Drop-off" },
      { id: "payment", label: "Payment" },
      { id: "tracking", label: "Tracking" },
      { id: "admin", label: "Admin" },
      { id: "auth", label: "Auth" },
      { id: "system", label: "System" },
    ];
  }

  mount() {
    this.restoreFromStorage();
    this.setupAuth();
    this.setupNav();
    this.setupEventFilters();
    this.setupGlobalActions();
    this.renderAll();
  }

  setupAuth() {
    const roleForm = document.querySelector("#roleForm");
    const loginEmail = document.querySelector("#loginEmail");
    const loginPassword = document.querySelector("#loginPassword");
    const logoutBtn = document.querySelector("#btnLogout");

    roleForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = loginEmail.value.trim();
      const password = loginPassword.value;

      const user = await this.authService.login(email, password);
      if (!user || !this.auth.loginWithUser(user)) {
        this.renderAll();
        return;
      }

      loginPassword.value = "";
      this.activeModule = this.auth.allowedModules()[0];
      this.renderAll();
    });

    logoutBtn.addEventListener("click", async () => {
      if (!this.auth.isLoggedIn()) return;
      await this.authService.logout(this.auth.currentUser?.name, this.auth.currentRole);
      this.auth.logout();
      this.activeModule = "dashboard";
      this.renderAll();
    });
  }

  setupEventFilters() {
    const filterRoot = document.querySelector("#eventFilters");
    filterRoot.innerHTML = this.eventFilters
      .map((f) => `<button data-filter="${f.id}">${f.label}</button>`)
      .join("");

    filterRoot.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      this.activeEventFilter = btn.dataset.filter;
      this.renderEvents();
      this.saveToStorage();
    });
  }

  restoreFromStorage() {
    const snapshot = this.persistence.load();
    if (!snapshot) return;

    this.state.hydrate(snapshot.state);
    this.events.hydrate(snapshot.events);
    this.auth.hydrate(snapshot.auth);

    if (typeof snapshot.activeModule === "string") {
      this.activeModule = snapshot.activeModule;
    }
    if (typeof snapshot.activeEventFilter === "string") {
      this.activeEventFilter = snapshot.activeEventFilter;
    }
  }

  saveToStorage() {
    this.persistence.save({
      state: this.state.snapshot(),
      events: this.events.snapshot(),
      auth: this.auth.snapshot(),
      activeModule: this.activeModule,
      activeEventFilter: this.activeEventFilter,
    });
  }

  setupNav() {
    const nav = document.querySelector("#moduleNav");
    nav.innerHTML = this.navConfig.map((item) => `<button data-target="${item.id}">${item.label}</button>`).join("");

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

    document.querySelector("#btnSimulateDay").addEventListener("click", async () => {
      if (!this.auth.isLoggedIn()) {
        this.events.push("Login required to run simulation", "warn", "auth");
        this.renderAll();
        return;
      }
      await this.transportService.simulateSchoolDay();
      this.renderAll();
    });
  }

  renderAll() {
    this.renderNavState();
    this.renderModules();
    this.renderEvents();
    this.saveToStorage();
  }

  renderNavState() {
    const allowedSet = new Set(this.auth.allowedModules());
    const isLoggedIn = this.auth.isLoggedIn();
    const roleNode = document.querySelector("#activeRole");
    const userName = this.auth.currentUser?.name || "Guest User";
    const roleLabel = isLoggedIn
      ? this.auth.currentRole.charAt(0).toUpperCase() + this.auth.currentRole.slice(1)
      : "Guest";
    roleNode.textContent = `Role: ${roleLabel} | User: ${userName}`;

    document.querySelectorAll("#moduleNav button").forEach((btn) => {
      const target = btn.dataset.target;
      const hasAccess = allowedSet.has(target);
      btn.style.display = hasAccess ? "block" : "none";
      btn.disabled = !hasAccess;
      btn.classList.toggle("active", target === this.activeModule);
    });

    document.querySelectorAll(".module").forEach((module) => {
      const moduleId = module.dataset.module;
      const showModule = isLoggedIn && allowedSet.has(moduleId) && moduleId === this.activeModule;
      module.classList.toggle("active", showModule);
    });

    const simulateBtn = document.querySelector("#btnSimulateDay");
    simulateBtn.disabled = !isLoggedIn;

    if (isLoggedIn && !allowedSet.has(this.activeModule)) {
      this.activeModule = this.auth.allowedModules()[0] || "dashboard";
    }
  }

  renderModules() {
    if (!this.auth.isLoggedIn()) {
      const dashboard = document.querySelector("#dashboard");
      dashboard.innerHTML = `
        <h2>Welcome</h2>
        <p class="soft">Sign in from the top-right area to access role-based modules.</p>
      `;
      document.querySelectorAll(".module").forEach((module) => {
        module.classList.toggle("active", module.dataset.module === "dashboard");
      });
      return;
    }

    Object.entries(this.modules).forEach(([id, instance]) => {
      const root = document.querySelector(`#${id}`);
      instance.render(root);
    });
  }

  renderEvents() {
    const feed = document.querySelector("#eventFeed");
    const filterRoot = document.querySelector("#eventFilters");
    filterRoot.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === this.activeEventFilter);
    });

    const visibleItems = this.activeEventFilter === "all"
      ? this.events.items
      : this.events.items.filter((e) => e.category === this.activeEventFilter);

    feed.innerHTML = visibleItems
      .map((e) => `<li data-category="${e.category}"><strong>${e.message}</strong><br /><small>${e.time} - ${e.category}</small></li>`)
      .join("");

    if (visibleItems.length === 0) {
      feed.innerHTML = "<li><strong>No events</strong><br /><small>Try another filter.</small></li>";
    }
  }
}
