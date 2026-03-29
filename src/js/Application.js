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
import { RoutesModule } from "./modules/RoutesModule.js";
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
      routes: new RoutesModule(this.state, this.events, this.renderAll.bind(this), this.transportService),
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
      { id: "routes", label: "Route Management" },
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
    const registerForm = document.querySelector("#registerForm");
    const loginEmail = document.querySelector("#loginEmail");
    const loginPassword = document.querySelector("#loginPassword");
    const registerName = document.querySelector("#registerName");
    const registerEmail = document.querySelector("#registerEmail");
    const registerPhone = document.querySelector("#registerPhone");
    const registerPassword = document.querySelector("#registerPassword");
    const registerRole = document.querySelector("#registerRole");
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

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const user = await this.authService.register(
        registerName.value,
        registerEmail.value,
        registerPhone.value,
        registerPassword.value,
        registerRole.value,
      );

      if (!user || !this.auth.loginWithUser(user)) {
        this.renderAll();
        return;
      }

      registerPassword.value = "";
      this.activeModule = this.auth.allowedModules()[0] || "dashboard";
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

    document.querySelector("#btnShowOverview").addEventListener("click", () => {
      this.activeModule = this.auth.isLoggedIn() ? (this.auth.allowedModules()[0] || "dashboard") : "dashboard";
      this.renderAll();
    });

    document.querySelector("#btnShowTracking").addEventListener("click", () => {
      if (!this.auth.isLoggedIn() || !this.auth.allowedModules().includes("tracking")) return;
      this.activeModule = "tracking";
      this.renderAll();
    });

    document.querySelector("#btnNavParent").addEventListener("click", () => {
      if (!this.auth.isLoggedIn() || !this.auth.allowedModules().includes("parent")) return;
      this.activeModule = "parent";
      this.renderAll();
    });

    document.querySelector("#btnNavDriver").addEventListener("click", () => {
      if (!this.auth.isLoggedIn() || !this.auth.allowedModules().includes("driver")) return;
      this.activeModule = "driver";
      this.renderAll();
    });

    document.querySelector("#btnNavReports").addEventListener("click", () => {
      if (!this.auth.isLoggedIn() || !this.auth.allowedModules().includes("reports")) return;
      this.activeModule = "reports";
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
        <section class="hero-banner guest-banner">
          <div>
            <p class="soft">Welcome to Smart Transport</p>
            <h2>Organized School Mobility Dashboard</h2>
            <p class="soft">Sign in or create an account to unlock role-based modules, live updates, and reporting tools.</p>
          </div>
          <div class="hero-badges">
            <span class="badge ok">Role Based Access</span>
            <span class="badge warn">Live Tracking</span>
            <span class="badge ok">Smart Reports</span>
          </div>
        </section>
        <div class="quick-grid">
          <article class="quick-card"><h4>Parent Tools</h4><p class="soft">Attendance, pickup status, and payments.</p></article>
          <article class="quick-card"><h4>Driver Tools</h4><p class="soft">Trip operations and live route handling.</p></article>
          <article class="quick-card"><h4>Admin Tools</h4><p class="soft">Routes, assignments, and exports.</p></article>
        </div>
        <div class="split guest-fill-grid">
          <div class="block guest-block">
            <h3>Top Frag Operations</h3>
            <ul>
              <li>Centralized attendance and pickup visibility</li>
              <li>Daily route readiness and driver availability</li>
              <li>Quick access to reports and payment workflows</li>
            </ul>
          </div>
          <div class="block guest-block">
            <h3>Getting Started</h3>
            <ul>
              <li>Sign in with your role to unlock modules</li>
              <li>Use "Simulate School Day" to generate live events</li>
              <li>Switch modules from left navigation anytime</li>
            </ul>
          </div>
        </div>
        <div class="card-grid guest-bottom-grid">
          <article class="stat-card light-block"><p>Live Modules</p><strong>8</strong></article>
          <article class="stat-card blue-block"><p>Role Types</p><strong>3</strong></article>
          <article class="stat-card light-block"><p>Activity Feed</p><strong>Real-Time</strong></article>
        </div>
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
